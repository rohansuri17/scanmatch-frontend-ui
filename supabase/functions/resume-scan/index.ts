import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return new Response(JSON.stringify({ error: "Missing input" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    const systemPrompt = `
You are a resume evaluation API with 25 years of experience as a college career advisor and 10 years as a professional recruiter in industry. Given a resume and a job description, return ONLY a JSON object in the exact format below:

{
  "score": number (0-100),
  "keywords": {
    "found": [ { "word": string, "category": string } ],
    "missing": [ { "word": string, "category": string } ]
  },
  "structure": {
    "strengths": [string],
    "improvements": [string]
  },
  "job_title": string,
  "improvement_suggestions": [string]
}

Make the structure strengths, structure improvements, and improvement_suggestions detailed and specific giving actionable guidance. Each should be 1–2 sentences. Avoid generic advice. Do not include markdown or commentary. Output only valid JSON.
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
          },
        ],
      }),
    });

    const { choices } = await response.json();
    let content = choices?.[0]?.message?.content || "";
    console.log("📩 Raw GPT content:", content);

    content = content.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      console.log("✅ Parsed GPT response:", parsed);

      return new Response(JSON.stringify(parsed), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (err) {
      console.error("❌ Failed to parse GPT response:", content);
      return new Response(
        JSON.stringify({ error: "Invalid GPT response", raw: content }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  } catch (err) {
    console.error("Edge Function Error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
