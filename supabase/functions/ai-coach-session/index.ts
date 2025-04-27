import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from "https://esm.sh/openai@4.20.1"

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { user_id, session_type } = await req.json()

    if (!user_id || !session_type) {
      throw new Error('Missing required fields')
    }

    // Get user's profile and recent data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    const { data: recentSessions } = await supabaseClient
      .from('ai_coach_sessions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: skills } = await supabaseClient
      .from('user_skills')
      .select('*')
      .eq('user_id', user_id)

    // Construct the prompt based on session type
    let prompt = ''
    let systemMessage = ''

    switch (session_type) {
      case 'resume':
        systemMessage = `You are an expert resume coach. Provide detailed feedback on the user's resume, focusing on:
          - Structure and formatting
          - Content quality and relevance
          - Achievement descriptions
          - Skills presentation
          - Areas for improvement
          Be specific and actionable in your recommendations.`
        
        const { data: resume } = await supabaseClient
          .from('resumes')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        prompt = `Please review this resume and provide feedback:
          ${resume?.content || 'No resume found'}
          
          User's skills: ${skills?.map(s => s.skill_name).join(', ')}
          Recent roles: ${profile?.work_experience || 'No work experience provided'}`
        break

      case 'interview':
        systemMessage = `You are an expert interview coach. Provide guidance on:
          - Common interview questions for the user's target role
          - Best practices for answering behavioral questions
          - Technical interview preparation
          - Communication and presentation skills
          - Follow-up strategies
          Include specific examples and actionable tips.`

        prompt = `Please provide interview preparation guidance for:
          Target role: ${profile?.target_role || 'Not specified'}
          Current role: ${profile?.current_role || 'Not specified'}
          Skills: ${skills?.map(s => s.skill_name).join(', ')}
          
          Recent interview sessions: ${recentSessions?.filter(s => s.session_type === 'interview')
            .map(s => s.content.summary).join('\n')}`
        break

      case 'career':
        systemMessage = `You are an expert career coach. Provide guidance on:
          - Career path progression
          - Skill development roadmap
          - Industry trends and opportunities
          - Networking strategies
          - Professional development resources
          Be specific to the user's current situation and goals.`

        prompt = `Please provide career development guidance for:
          Current role: ${profile?.current_role || 'Not specified'}
          Target role: ${profile?.target_role || 'Not specified'}
          Experience: ${profile?.work_experience || 'Not specified'}
          Skills: ${skills?.map(s => s.skill_name).join(', ')}
          
          Recent career sessions: ${recentSessions?.filter(s => s.session_type === 'career')
            .map(s => s.content.summary).join('\n')}`
        break

      default:
        throw new Error('Invalid session type')
    }

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const aiResponse = completion.choices[0].message.content

    // Save session to database
    const { data: session, error } = await supabaseClient
      .from('ai_coach_sessions')
      .insert({
        user_id,
        session_type,
        content: {
          summary: aiResponse,
          prompt,
          system_message: systemMessage
        }
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify(session),
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