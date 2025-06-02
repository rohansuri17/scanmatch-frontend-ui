import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, jobDescription, analysisData } = await req.json()

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Create the prompt for GPT
    const prompt = `Please rewrite the following resume to better match the job description and incorporate the missing keywords. 
    Make it more ATS-friendly and professional. Keep the same information but improve the wording and structure.
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Missing Keywords:
    ${analysisData.keywords_missing?.join(', ')}
    
    Structure Improvements:
    ${analysisData.structure_improvements?.join(', ')}
    
    Please format the response in a clean, professional way with clear sections.`

    // Get GPT's response
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Your task is to improve resumes while maintaining their authenticity and truthfulness."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    const improvedResume = completion.data.choices[0].message?.content

    // Create PDF
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const page = pdfDoc.addPage([612, 792]) // US Letter size
    const { width, height } = page.getSize()
    
    // Add content to PDF
    const fontSize = 12
    const lineHeight = fontSize * 1.2
    let y = height - 50 // Start from top with margin
    
    const lines = improvedResume?.split('\n') || []
    for (const line of lines) {
      if (line.trim()) {
        page.drawText(line, {
          x: 50,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
        y -= lineHeight
      } else {
        y -= lineHeight / 2 // Add space between paragraphs
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save()

    return new Response(
      JSON.stringify({ pdf: pdfBytes }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 