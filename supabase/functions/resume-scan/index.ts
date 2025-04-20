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
- technical: role-specific technical skills (e.g., financial modeling, data analysis, project management, etc.)
- soft_skill: specific behavioral competencies (e.g., stakeholder management, cross-functional collaboration, etc.)
- tool: role-specific tools and platforms (e.g., Excel, Tableau, Salesforce, etc.)
- certification: required or preferred certifications
- job_term: industry-specific terminology, methodologies, processes
- achievement: quantifiable metrics, results, impact
- education: specific degrees, coursework, or training requirements

Then, compare these keywords against the resume using both exact matches and reasonable equivalences (e.g., "Microsoft Excel" = "Excel", "Tableau" = "data visualization"). Recognize abbreviations, synonyms, and shorthands as equivalent when appropriate.

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
  "improvement_suggestions": [string],
  "interview_questions": {
    "technical": [
      {
        "question": "string",
        "context": "string explaining why this question is relevant"
      }
    ],
    "behavioral": [
      {
        "question": "string",
        "context": "string explaining why this question is relevant"
      }
    ],
    "resume_based": [
      {
        "question": "string",
        "context": "string explaining why this question is relevant"
      }
    ]
  }
}

IMPORTANT INSTRUCTIONS FOR KEYWORDS:
1. "found" keywords should include terms that appear in BOTH the resume and job description using both exact matches and reasonable equivalences.
2. "missing" keywords should include important terms that appear in the job description but NOT in the resume using both exact matches and reasonable equivalences.
3. Focus on role-specific technical skills and tools rather than generic terms.
4. For technical skills, include specific applications or contexts when mentioned.
5. For achievements, include specific metrics and impact when available.
6. Casing between resume and job description is insensitive.

Scoring Logic: 
- Score is calculated as 70% based on keyword match rate and 30% on resume formatting/structure quality.
- Weight role-specific technical skills and tools more heavily than generic terms.
- Consider the relevance and specificity of matches to the job role.

For the structure analysis:
- Make each strength and improvement detailed and specific with actionable guidance.
- Focus on role-specific achievements and skills rather than generic advice.
- Highlight formatting, organization, and content presentation issues.
- Provide concrete examples of how to improve for the specific role.

For improvement suggestions:
- Provide 3-5 specific, actionable recommendations to enhance the resume.
- Include specific examples of how to quantify achievements relevant to the role.
- Suggest specific skills or tools that would strengthen the resume for this position.
- Target advice for the specific job role and industry.
- NEVER provide generic advice like "improve communication skills" or "add more detail".
- Instead, provide specific examples like "Demonstrate communication skills by quantifying the impact of your presentations to stakeholders, e.g., 'Delivered quarterly financial reports to executive team, resulting in 15% faster decision-making'"

For interview questions:
- Generate 5 questions for each category (technical, behavioral, resume-based)
- Technical questions should focus on the specific skills and tools mentioned in the job description
- Behavioral questions should target the soft skills and competencies required for the role
- Resume-based questions should focus on the candidate's specific experience and achievements
- Each question should include context explaining why it's relevant to the role
- Questions should be challenging but appropriate for the candidate's experience level
- Include follow-up questions or probing points in the context where relevant

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
