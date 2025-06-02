import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json()
      console.log('Request body:', JSON.stringify(body, null, 2))
    } catch (error) {
      console.error('Error parsing request body:', error)
      throw new Error('Invalid request body')
    }

    const { missingSkills, improvements, userId, refresh } = body

    // Validate input
    if (!missingSkills || !improvements) {
      console.error('Missing required fields:', { missingSkills, improvements })
      throw new Error('Missing required fields: missingSkills and improvements')
    }

    // Format skills and improvements
    let formattedSkills, formattedImprovements;
    try {
      formattedSkills = Array.isArray(missingSkills) 
        ? missingSkills.map(skill => typeof skill === 'string' ? skill : skill.word).join(', ')
        : typeof missingSkills === 'string' 
          ? missingSkills
          : JSON.stringify(missingSkills)

      formattedImprovements = Array.isArray(improvements)
        ? improvements.join(', ')
        : typeof improvements === 'string'
          ? improvements
          : JSON.stringify(improvements)

      console.log('Formatted input:', { formattedSkills, formattedImprovements })
    } catch (error) {
      console.error('Error formatting input:', error)
      throw new Error('Error formatting input data')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create cache key
    const cacheKey = `${userId}-${formattedSkills}-${formattedImprovements}`

    // Check cache first, unless refresh is true
    if (!refresh) {
      const { data: cachedResult } = await supabaseClient
        .from('learning_path_cache')
        .select('*')
        .eq('cache_key', cacheKey)
        .single()

      if (cachedResult) {
        console.log('Returning cached result')
        return new Response(
          JSON.stringify(cachedResult.learning_path),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }

    // Initialize OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      console.error('OpenAI API key not found in environment')
      throw new Error('Missing OpenAI API key')
    }

    // Function to get search URL for each platform
    function getPlatformSearchUrl(query: string, platform: string): string {
      const searchUrls: { [key: string]: string } = {
        'Coursera': `https://www.coursera.org/search?query=${encodeURIComponent(query)}`,
        'Udemy': `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`,
        'edX': `https://www.edx.org/search?q=${encodeURIComponent(query)}`,
        'Pluralsight': `https://www.pluralsight.com/search?q=${encodeURIComponent(query)}`,
        'freeCodeCamp': `https://www.freecodecamp.org/search?query=${encodeURIComponent(query)}`,
        'Codecademy': `https://www.codecademy.com/search?query=${encodeURIComponent(query)}`
      };
      return searchUrls[platform] || '';
    }

    // Create prompt for OpenAI with focus on technical skills
    const prompt = `You are a technical career development expert. Create a personalized learning path based on the candidate's missing skills and areas for improvement. Focus on practical, hands-on learning resources that directly address their skill gaps.

INPUT DATA:
Missing Technical Skills: ${formattedSkills}
Areas for Improvement: ${formattedImprovements}

REQUIRED PLATFORMS:
Use ONLY these learning platforms:
1. Coursera (https://www.coursera.org)
2. Udemy (https://www.udemy.com)
3. edX (https://www.edx.org)
4. Pluralsight (https://www.pluralsight.com)
5. freeCodeCamp (https://www.freecodecamp.org)
6. Codecademy (https://www.codecademy.com)

RESOURCE FORMAT REQUIREMENTS:
For each skill gap, provide exactly 5 resources in this order:
1. 3x beginner course (2-4 hours)
2. 2x intermediate/advanced course (4-8 hours)
3. 1x A practical project (2-4 hours)

Each resource must follow this exact JSON format:
{
  "title": "Course/Project Title",
  "provider": "Platform Name",
  "type": "course" or "project",
  "skillLevel": "beginner" or "intermediate" or "advanced",
  "estimatedHours": number (2-8),
  "url": "Search URL for the platform (will be replaced with actual course URL)",
  "description": "2-3 sentences about what they'll learn and how it relates to their skill gap",
  "relatedSkills": ["skill1", "skill2"],
  "category": "technical" or "design",
  "focus": "practical" or "theoretical"
}

IMPORTANT RULES:
1. Focus on resources that directly address the missing skills and improvements
2. Choose courses that match the candidate's current skill level
3. Include practical projects that apply the learned skills
4. Return ONLY an array of resources, NOT wrapped in any object
5. Do not include any additional fields or metadata`

    console.log('Sending prompt to OpenAI')

    // Call OpenAI API using fetch
    try {
      const completion = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: "You are a technical career development expert who creates personalized learning paths focused on practical, hands-on technical skills. Your recommendations should directly address the candidate's specific skill gaps and career goals. Always respond with a valid JSON array of resources, not wrapped in any object."
            },
            {
              role: "user",
              content: prompt
            }
          ],
        }),
      });

      if (!completion.ok) {
        const errorData = await completion.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const response = await completion.json();
      const content = response.choices[0]?.message?.content;

      if (!content) {
        console.error('No content in OpenAI response');
        throw new Error('No response from OpenAI');
      }

      console.log('OpenAI response:', content);

      try {
        // Clean the response content
        const cleanedContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        console.log('Cleaned content:', cleanedContent);

        const parsedContent = JSON.parse(cleanedContent);
        const learningPath = Array.isArray(parsedContent) ? parsedContent : parsedContent.resources;

        if (!Array.isArray(learningPath)) {
          throw new Error('Learning path must be an array or contain a resources array');
        }

        // Update URLs with search links
        for (const resource of learningPath) {
          if (!resource.title || !resource.provider || !resource.url) {
            throw new Error('Each resource must have title, provider, and url');
          }

          // Get search URL for the platform
          const searchUrl = getPlatformSearchUrl(resource.title, resource.provider);
          if (searchUrl) {
            resource.url = searchUrl;
          } else {
            console.warn(`Invalid platform: ${resource.provider}`);
            // Remove the resource if we can't find a valid platform
            learningPath.splice(learningPath.indexOf(resource), 1);
          }
        }

        // Cache the result
        await supabaseClient
          .from('learning_path_cache')
          .insert({
            cache_key: cacheKey,
            user_id: userId,
            learning_path: learningPath,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          });

        return new Response(
          JSON.stringify(learningPath),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.error('Invalid JSON:', content);
        throw new Error(`Invalid response format from OpenAI: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error in generate-learning-path:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
}); 