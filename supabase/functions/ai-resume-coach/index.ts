
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.20.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-RESUME-COACH] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting AI coach request");
    const openaiKey = Deno.env.get("OPENAI_KEY");
    if (!openaiKey) throw new Error("OPENAI_KEY is not set");

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verify user's subscription tier allows AI coach access
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from("user_subscriptions")
      .select("subscription_tier")
      .eq("user_id", user.id)
      .single();
      
    if (subscriptionError && subscriptionError.code !== 'PGSQL_ERROR_NO_ROWS') {
      throw new Error(`Subscription error: ${subscriptionError.message}`);
    }
    
    const tier = subscriptionData?.subscription_tier || "free";
    if (tier !== "premium") {
      logStep("Access denied - not premium tier", { tier });
      throw new Error("AI Resume Coach is only available to Premium subscribers");
    }
    
    logStep("Subscription verified", { tier });

    // Get the user's message
    const { message } = await req.json();
    if (!message) throw new Error("No message provided");
    
    // Initialize OpenAI
    const configuration = new Configuration({ apiKey: openaiKey });
    const openai = new OpenAIApi(configuration);
    
    logStep("Sending request to OpenAI");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are AI Resume Coach, an expert in resume writing, job applications, 
          and interview preparation. Your goal is to help users improve their job search 
          prospects by providing specific, actionable advice. When discussing resumes, 
          focus on ATS optimization, keyword matching, and professional presentation. 
          For interview prep, provide tailored responses for common questions in the 
          user's industry. Be concise, supportive, and professional.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
    });
    
    const aiResponse = completion.choices[0].message.content;
    logStep("Received response from OpenAI");

    return new Response(JSON.stringify({ message: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[AI-RESUME-COACH ERROR] ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
