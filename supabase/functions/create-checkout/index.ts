import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const allowedOrigins = [
  "https://yourdomain.com", // <-- Replace with your production domain
  "http://localhost:8080"   // For local development
];

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "https://yourdomain.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin"
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    logStep("Starting checkout creation");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Get request body
    const body = await req.json();
    const { tier = "pro" } = body; // default to pro tier if not specified
    logStep("Request received", { tier });

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user authentication
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if user already has a Stripe customer ID
    const { data: subscriptionData } = await supabaseClient
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = subscriptionData?.stripe_customer_id;

    if (!customerId) {
      // Look up customer in Stripe
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      } else {
        // Create a new customer in Stripe
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = newCustomer.id;
        logStep("Created new Stripe customer", { customerId });
      }

      // Update user_subscriptions with the Stripe customer ID
      const { error: upsertError, data: upsertData } = await supabaseClient
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
      
      if (upsertError) {
        console.error("Error upserting stripe_customer_id:", upsertError);
        throw new Error(`Failed to update user_subscriptions: ${upsertError.message}`);
      }
      
      logStep("Updated user_subscriptions", { 
        userId: user.id, 
        customerId, 
        upsertData 
      });
    }

    // Set price based on tier
    let priceId;
    if (tier === "premium") {
      priceId = Deno.env.get("STRIPE_PREMIUM_PRICE_ID");
      if (!priceId) throw new Error("STRIPE_PREMIUM_PRICE_ID is not set");
    } else {
      priceId = Deno.env.get("STRIPE_PRO_PRICE_ID");
      if (!priceId) throw new Error("STRIPE_PRO_PRICE_ID is not set");
    }

    // Create a checkout session
    logStep("Creating checkout session", { priceId, customerId });
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    });

    // After creating the session, verify and update the customer ID
    const sessionWithCustomer = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['customer']
    });
    
    if (sessionWithCustomer.customer) {
      const finalCustomerId = typeof sessionWithCustomer.customer === 'string' 
        ? sessionWithCustomer.customer 
        : sessionWithCustomer.customer.id;
        
      logStep("Retrieved customer from session", { sessionId: session.id, customerId: finalCustomerId });
      
      // Update user_subscriptions with the final customer ID
      const { error: upsertError, data: upsertData } = await supabaseClient
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: finalCustomerId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
      
      if (upsertError) {
        console.error("Error upserting stripe_customer_id:", upsertError);
        throw new Error(`Failed to update user_subscriptions: ${upsertError.message}`);
      }
      
      logStep("Updated user_subscriptions with final customer ID", { 
        userId: user.id, 
        customerId: finalCustomerId, 
        upsertData 
      });
    }

    logStep("Checkout session created", { sessionId: session.id, url: session.url });
    // Return the checkout session URL
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-CHECKOUT ERROR] ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
