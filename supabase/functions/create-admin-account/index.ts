
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const adminEmail = "admin@scanmatch.ai";
    const adminPassword = "Admin123!@#"; // In a real application, this would be more secure
    
    // Check if admin already exists
    const { data: existingUsers, error: searchError } = await supabaseClient.auth.admin.listUsers({
      filters: {
        email: adminEmail,
      },
    });

    if (searchError) {
      throw new Error(`Error searching for existing admin: ${searchError.message}`);
    }

    let adminUserId;
    
    if (existingUsers && existingUsers.users.length > 0) {
      console.log("Admin account already exists");
      adminUserId = existingUsers.users[0].id;
    } else {
      // Create admin account
      const { data: adminData, error: createError } = await supabaseClient.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });

      if (createError) {
        throw new Error(`Error creating admin user: ${createError.message}`);
      }

      adminUserId = adminData.user.id;
      console.log("Created new admin account");
    }

    // Set up premium subscription for admin
    const { data: subData, error: subError } = await supabaseClient
      .from("user_subscriptions")
      .upsert({
        user_id: adminUserId,
        subscription_tier: "premium",
        max_scans: null, // Unlimited scans
        scans_used: 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (subError) {
      throw new Error(`Error setting admin subscription: ${subError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Admin account created/updated with premium access",
      credentials: {
        email: adminEmail,
        password: adminPassword,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-ADMIN ERROR] ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
