import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    logStep("Starting AI coach request");
    
    // Get environment variables
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      logStep("Error: OPENAI_API_KEY not set");
      throw new Error("OPENAI_API_KEY is not set in Supabase environment");
    }

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the request body
    let body;
    try {
      body = await req.json();
      logStep("Request body received", { 
        messageLength: body.message?.length,
        userId: body.userId
      });
    } catch (e) {
      logStep("Error parsing request body", e);
      throw new Error("Invalid JSON in request body");
    }

    const { message, userId } = body;
    if (!message) {
      logStep("Error: No message provided");
      throw new Error("No message provided");
    }

    if (!userId) {
      logStep("Error: No user ID provided");
      throw new Error("No user ID provided");
    }

    // Try to get the most recent analysis for this user
    logStep("Fetching most recent scan data", { userId });
    const { data: scanData, error: scanDataError } = await supabaseClient
      .from('resume_scan_data')
      .select('id, resume_text, job_description, job_title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (scanDataError) {
      logStep("Error fetching scan data", scanDataError);
      throw new Error(`Failed to fetch scan data: ${scanDataError.message}`);
    }

    if (!scanData) {
      logStep("No scan data found for user");
      throw new Error("No resume scan data found for this user");
    }

    const { id: scanId, resume_text, job_description, job_title } = scanData;
    logStep("Scan data fetched", {
      scanId,
      hasResume: !!resume_text,
      hasJobDesc: !!job_description,
      hasJobTitle: !!job_title,
      resumeLength: resume_text?.length,
      jobDescLength: job_description?.length
    });

    // Prepare messages array for OpenAI
    const messages = [
      { 
        role: "system", 
        content: `You are an AI Resume Coach with 20+ years of experience as a college career advisor and 10 years as a professional recruiter in industry.

Your job is to guide users in making their resumes stronger, helping them tailor to specific jobs, improve formatting, and highlight strengths. Ask targeted follow-up questions when needed and give actionable, detailed suggestions.

When evaluating a resume, be specific and constructive. Always adapt advice based on the user's career stage (student, early-career, mid-career, executive), industry, and the job they're targeting.

Focus on:
- Resume structure and formatting
- Keyword optimization and ATS-friendliness
- Highlighting relevant experience and accomplishments
- Tailoring to the job description

Always speak in a professional, helpful tone, and never guess when unsure — ask follow-up questions.`
      }
    ];

    // Add resume and job description context if available
    if (resume_text && job_description) {
      logStep("Adding both resume and job description context");
      messages.push({ 
        role: "system", 
        content: `Resume content: ${resume_text}\n\nJob description: ${job_description}\n\nThe user has provided their resume and a job description they're targeting. Use this information to provide tailored advice.` 
      });
    } else if (resume_text) {
      logStep("Adding resume context only");
      messages.push({ 
        role: "system", 
        content: `Resume content: ${resume_text}\n\nThe user has provided their resume. Use this information to provide tailored advice.` 
      });
    } else if (job_description) {
      logStep("Adding job description context only");
      messages.push({ 
        role: "system", 
        content: `Job description: ${job_description}\n\nThe user has provided a job description they're targeting. Use this information to provide tailored advice.` 
      });
    } else {
      logStep("No resume or job description found in scan data");
    }

    // Add user message
    messages.push({ role: "user", content: message });
    
    logStep("Sending request to OpenAI", { 
      model: "gpt-4", 
      messageCount: messages.length,
      totalContextLength: messages.reduce((sum, msg) => sum + msg.content.length, 0)
    });
    
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        messages: messages,
      }),
    });

    if (!completion.ok) {
      const errorText = await completion.text();
      logStep("OpenAI API error", { status: completion.status, error: errorText });
      throw new Error(`OpenAI API error: ${completion.status} ${errorText}`);
    }

    const response = await completion.json();
    const aiResponse = response.choices?.[0]?.message?.content || "";
    
    logStep("Received response from OpenAI", { 
      responseLength: aiResponse.length,
      preview: aiResponse.substring(0, 100) + '...'
    });
    
    return new Response(JSON.stringify({ message: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error in function", { error: errorMessage });
    console.error(`[AI-RESUME-COACH ERROR] ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
