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
  console.log(`[VERIFY-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Starting subscription verification");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Create Supabase client with service role key for admin operations
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

    // Get user's subscription from Supabase
    const { data: subscriptionData } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Get request body
    const body = await req.json();
    const { session_id } = body;
    logStep("Received request", { session_id, body });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // If no session ID provided, check existing subscription status
    if (!session_id) {
      logStep("No session ID provided, checking existing subscription");
      // If no subscription exists, create a free one
      if (!subscriptionData) {
        logStep("No subscription found, creating free tier");
        const { data: newSubscription, error } = await supabaseClient
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            subscription_tier: "free",
            max_scans: 5,
            scans_used: 0,
          })
          .select()
          .single();
          
        if (error) throw new Error(`Failed to create subscription: ${error.message}`);
        
        return new Response(JSON.stringify({
          subscription_tier: "free",
          is_subscribed: false,
          max_scans: 5,
          scans_used: 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // If user has a Stripe customer ID, check their subscription status
      if (subscriptionData.stripe_customer_id) {
        logStep("Checking Stripe subscription", { customerId: subscriptionData.stripe_customer_id });
        
        const subscriptions = await stripe.subscriptions.list({
          customer: subscriptionData.stripe_customer_id,
          status: "active",
          limit: 1,
        });
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          logStep("Active subscription found", { subscriptionId: subscription.id });
          
          // Determine tier from price
          const priceId = subscription.items.data[0].price.id;
          const price = await stripe.prices.retrieve(priceId);
          const amount = price.unit_amount || 0;
          
          let tier;
          if (amount <= 1999) {
            tier = "pro";
          } else {
            tier = "premium";
          }
          
          // Update user's subscription in Supabase
          const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          await supabaseClient
            .from("user_subscriptions")
            .update({
              subscription_tier: tier,
              subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscription_period_end: periodEnd,
              max_scans: null, // Unlimited scans for paid tiers
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
            
          logStep("Updated subscription in database", { tier, status: subscription.status });
          
          return new Response(JSON.stringify({
            subscription_tier: tier,
            is_subscribed: true,
            subscription_period_end: periodEnd,
            max_scans: null,
            scans_used: subscriptionData.scans_used || 0,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          // No active subscription found, downgrade to free tier
          logStep("No active subscription found, downgrading to free tier");
          await supabaseClient
            .from("user_subscriptions")
            .update({
              subscription_tier: "free",
              subscription_id: null,
              subscription_status: null,
              subscription_period_end: null,
              max_scans: 5,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
            
          return new Response(JSON.stringify({
            subscription_tier: "free",
            is_subscribed: false,
            max_scans: 5,
            scans_used: subscriptionData.scans_used || 0,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      } else {
        // User has no Stripe customer ID, they're on the free tier
        logStep("User has no Stripe customer ID, confirming free tier");
        return new Response(JSON.stringify({
          subscription_tier: "free",
          is_subscribed: false,
          max_scans: 5,
          scans_used: subscriptionData.scans_used || 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Handle new subscription from session ID
    logStep("Processing new subscription from session", { sessionId: session_id });
    
    // Retrieve the session to get subscription details
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer']
    });
    logStep("Retrieved session", { 
      sessionId: session.id,
      hasSubscription: !!session.subscription,
      hasCustomer: !!session.customer,
      subscriptionStatus: session.subscription?.status,
      customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id
    });

    if (!session.subscription || !session.customer) {
      logStep("Error: Missing subscription or customer in session");
      throw new Error("No subscription found in session");
    }

    const subscription = session.subscription;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
    logStep("Processing subscription", { 
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status
    });

    // Determine tier from price
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);
    const amount = price.unit_amount || 0;
    logStep("Retrieved price details", { priceId, amount });
    
    let tier;
    if (amount <= 1999) {
      tier = "pro";
    } else {
      tier = "premium";
    }
    logStep("Determined tier", { tier, amount });

    // Update user's subscription in Supabase
    const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    logStep("Updating user subscription", { 
      userId: user.id,
      tier,
      customerId,
      periodEnd
    });

    const { error: updateError, data: updateData } = await supabaseClient
      .from("user_subscriptions")
      .update({
        subscription_tier: tier,
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_period_end: periodEnd,
        stripe_customer_id: customerId,
        max_scans: null, // Unlimited scans for paid tiers
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select();

    if (updateError) {
      logStep("Error updating subscription", { error: updateError });
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    logStep("Successfully updated subscription", { 
      updateData,
      tier,
      status: subscription.status 
    });

    return new Response(JSON.stringify({
      subscription_tier: tier,
      is_subscribed: true,
      subscription_period_end: periodEnd,
      max_scans: null,
      scans_used: 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[VERIFY-SUBSCRIPTION ERROR] ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
