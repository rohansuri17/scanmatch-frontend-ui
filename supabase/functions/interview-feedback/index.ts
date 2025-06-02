import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const requestData = await req.json()
    const { question, answer, context, qa_history, question_type } = requestData

    // Validate required fields
    if (!question || !answer) {
      throw new Error('Missing required fields: question and answer are required')
    }

    // Initialize OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('Missing OpenAI API key')
    }

    // Create prompt for feedback
    const prompt = `You are an expert ${question_type} interviewer providing feedback on interview responses.
    
Question Context: ${context || 'No context provided'}
Question: ${question}
Candidate's Answer: ${answer}

${qa_history && qa_history.length > 0 ? `
Previous Q&A History:
${qa_history.map((qa: any) => `
Q: ${qa.question}
A: ${qa.user_answer}
`).join('\n')}
` : ''}

Provide detailed feedback on the candidate's answer, focusing on:
1. ${question_type === 'technical' ? 'Technical accuracy and depth' : 'Behavioral response quality and relevance to the question'}
2. Communication clarity and structure
3. Areas for improvement
4. Suggestions for better responses

For behavioral questions, focus on:
- How well the answer demonstrates the required behavioral competency
- Whether the response includes specific examples or situations
- The clarity of the situation, action, and result (if applicable)
- How well the response addresses the question's core behavioral aspect

Format the feedback in clear paragraphs with bullet points where appropriate.`

    console.log('Sending request to OpenAI...')

    // Call OpenAI API
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert ${question_type} interviewer providing constructive feedback on interview responses. For behavioral questions, focus on assessing how well the candidate demonstrates the required behavioral competencies through specific examples and clear communication.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!completion.ok) {
      const errorData = await completion.json().catch(() => ({}))
      console.error('OpenAI API Error:', errorData)
      throw new Error(`OpenAI API error: ${completion.status} ${completion.statusText}`)
    }

    const response = await completion.json()
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    const feedback = response.choices[0].message.content

    return new Response(
      JSON.stringify({ feedback }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}) 