
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
You are a resume evaluation API with 25 years of experience as a college career advisor and 10 years as a professional recruiter in industry.

Given a resume and a job description, perform a detailed keyword comparison. First, extract important keywords and phrases from the job description, grouped by category:
technical, soft_skill, tool, certification, job_term, or other.

Then, compare these keywords against the resume using both exact matches and reasonable equivalences (e.g., “Structured Query Language” = “SQL”, “JavaScript” = “JS”, “Microsoft” = “MS”, “communication skills” = “communication”). Recognize abbreviations, synonyms, and shorthands as equivalent when appropriate.

Return only a valid JSON object in the exact format below — no extra commentary, markdown, or formatting:
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

IMPORTANT INSTRUCTIONS FOR KEYWORDS:
1. "found" keywords should include terms that appear in BOTH the resume and job description obviously using both exact matches and reasonable equivalences.
2. "missing" keywords should include important terms that appear in the job description but NOT in the resume using both exact matches and reasonable equivalences.
3. Focus on skills, technologies, qualifications, and responsibilities.
4. Be thorough and accurate in keyword identification.
5. Include specific technologies, tools, methodologies, and industry terms.
6. Casing between resume and job description is insensitive. Ie. education is the same as EDUCATION and vice versa

Scoring Logic: 
- Score is calculated as 70% based on keyword match rate and 30% on resume formatting/structure quality.

For the structure analysis:
- Make each strength and improvement detailed and specific with actionable guidance (1-2 sentences). This might include a For example...
- Avoid generic advice
- Highlight formatting, organization, and content presentation issues

For improvement suggestions:
- Provide 3-5 specific, actionable recommendations to enhance the resume for this job with a sample of what the could add or include in quotes
- Target advice for career stage (new grad, mid-career, senior)
- Include both content and formatting suggestions  
- Avoid generic advice include specific coursework, certifications, or programs that could help strenghten the resume to achieve a higher match score

Do not include markdown or commentary. Output only valid JSON.
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
