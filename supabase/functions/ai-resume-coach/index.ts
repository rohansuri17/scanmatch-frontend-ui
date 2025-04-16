
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
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY is not set in Supabase environment");

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
    // Check for admin/superuser account for testing
    const isAdmin = user.email === "admin@scanmatch.ai";
    if (tier !== "premium" && tier !== "pro" && !isAdmin) {
      logStep("Access denied - not premium/pro tier", { tier });
      throw new Error("AI Resume Coach is only available to Pro and Premium subscribers");
    }
    
    logStep("Subscription verified", { tier });

    // Get the user's message and optional resume/job description
    const { message, resumeText, jobDescription } = await req.json();
    if (!message) throw new Error("No message provided");
    
    // Initialize OpenAI
    const configuration = new Configuration({ apiKey: openaiKey });
    const openai = new OpenAIApi(configuration);
    
    const systemPrompt = `
You are an AI Resume Coach with 20+ years of experience as a college career advisor and 10 years as a professional recruiter in industry.

Your job is to guide users in making their resumes stronger, helping them tailor to specific jobs, improve formatting, and highlight strengths. Ask targeted follow-up questions when needed and give actionable, detailed suggestions.

When evaluating a resume, be specific and constructive. Always adapt advice based on the user's career stage (student, early-career, mid-career, executive), industry, and the job they're targeting.

Focus on:
- Resume structure and formatting
- Keyword optimization and ATS-friendliness
- Highlighting relevant experience and accomplishments
- Tailoring to the job description

Always speak in a professional, helpful tone, and never guess when unsure — ask follow-up questions.
`.trim();

    // Prepare messages array for OpenAI
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Add resume and job description context if available
    if (resumeText && jobDescription) {
      messages.push({ 
        role: "system", 
        content: `Resume content: ${resumeText}\n\nJob description: ${jobDescription}\n\nThe user has provided their resume and a job description they're targeting. Use this information to provide tailored advice.` 
      });
    }

    // Add user message
    messages.push({ role: "user", content: message });
    
    logStep("Sending request to OpenAI");
    // Try to handle both older and newer OpenAI SDK formats
    try {
      // First attempt using newer format
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages as any,
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      const aiResponse = completion.choices[0].message.content;
      logStep("Received response from OpenAI (new format)");
      
      // Save message history to database for premium users only
      if (tier === "premium" || isAdmin) {
        try {
          await supabaseClient.from("ai_coach_conversations").insert({
            user_id: user.id,
            user_message: message,
            ai_response: aiResponse,
            created_at: new Date().toISOString()
          });
          logStep("Saved conversation to database");
        } catch (error) {
          console.error("Error saving conversation:", error);
          // Don't fail the request if saving fails
        }
      }
      
      return new Response(JSON.stringify({ message: aiResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      // If newer format fails, try older format
      console.log("Failed with newer OpenAI format, trying older format:", error);
      
      const completion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: messages as any,
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      const aiResponse = completion.data.choices[0].message?.content || "Sorry, I couldn't generate a response.";
      logStep("Received response from OpenAI (old format)");
      
      // Save message history to database for premium users only
      if (tier === "premium" || isAdmin) {
        try {
          await supabaseClient.from("ai_coach_conversations").insert({
            user_id: user.id,
            user_message: message,
            ai_response: aiResponse,
            created_at: new Date().toISOString()
          });
          logStep("Saved conversation to database");
        } catch (error) {
          console.error("Error saving conversation:", error);
          // Don't fail the request if saving fails
        }
      }
      
      return new Response(JSON.stringify({ message: aiResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[AI-RESUME-COACH ERROR] ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
