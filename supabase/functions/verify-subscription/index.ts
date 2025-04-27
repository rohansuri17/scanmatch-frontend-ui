
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Add proper request sanitization
const sanitizeInput = (input: unknown): string => {
  if (typeof input !== 'string') return '';
  // Prevent XSS and other injection attacks
  return input.replace(/[<>"'&]/g, '');
};

// Helper logging function with enhanced security
const logStep = (step: string, details?: any) => {
  const safeDetails = details ? JSON.stringify(details, (key, value) => {
    // Sanitize sensitive data before logging
    if (key === 'authorization' || key === 'token' || key === 'apikey') return '[REDACTED]';
    return value;
  }) : '';
  
  const detailsStr = safeDetails ? ` - ${safeDetails}` : '';
  console.log(`[VERIFY-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    logStep("Starting subscription verification");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not properly configured");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication with additional security checks
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("Invalid authorization token");
    }
    
    logStep("Authenticating user");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Authentication error", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.id) {
      throw new Error("User not authenticated properly");
    }
    
    if (!user?.email) {
      throw new Error("User email not available");
    }
    
    logStep("User authenticated", { userId: user.id });

    // Rate limiting check - prevent abuse
    const rateLimitKey = `subscription_check:${user.id}`;
    const { data: rateLimit } = await supabaseClient
      .rpc('check_rate_limit', { key: rateLimitKey, limit: 10, window: 60 });
    
    if (rateLimit === false) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Get user's subscription from Supabase with timeouts
    const { data: subscriptionData, error: subError } = await Promise.race([
      supabaseClient
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      new Promise<{data: null, error: Error}>((resolve) => 
        setTimeout(() => resolve({
          data: null, 
          error: new Error("Database query timeout")
        }), 5000)
      )
    ]);
    
    if (subError) {
      throw new Error(`Failed to fetch subscription: ${subError.message}`);
    }

    // Initialize Stripe with proper configuration
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
      timeout: 10000, // 10 second timeout
    });
    
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
      try {
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
              max_scans: tier === "free" ? 5 : null, // Unlimited scans for paid tiers
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
            
          logStep("Updated subscription in database", { tier, status: subscription.status });
          
          return new Response(JSON.stringify({
            subscription_tier: tier,
            is_subscribed: true,
            subscription_period_end: periodEnd,
            max_scans: tier === "free" ? 5 : null,
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
      } catch (stripeError) {
        // Handle Stripe API errors gracefully
        logStep("Stripe API error", { error: stripeError.message });
        console.error("Stripe API error:", stripeError);
        
        // Return cached subscription data as fallback
        return new Response(JSON.stringify({
          subscription_tier: subscriptionData.subscription_tier || "free",
          is_subscribed: subscriptionData.subscription_tier !== "free",
          max_scans: subscriptionData.max_scans || 5,
          scans_used: subscriptionData.scans_used || 0,
          error: "Stripe service temporarily unavailable",
          cached: true,
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[VERIFY-SUBSCRIPTION ERROR] ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
