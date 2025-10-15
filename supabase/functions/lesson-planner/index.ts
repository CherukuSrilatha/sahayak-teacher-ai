import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, grades, topics } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Generating lesson plan for:', subject, grades, topics);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert lesson planner for multi-grade classrooms in rural India. Create a detailed weekly lesson plan.

Subject: ${subject}
Grade Levels: ${grades}
Topics to Cover: ${topics}

Create a weekly plan (Monday-Friday) with:
- Specific activities for each day
- Time duration for each activity
- Differentiation strategies for different grade levels
- Practical, low-resource activities suitable for rural classrooms

Format the response as JSON with this structure:
{
  "week": "Week 1",
  "days": [
    {
      "day": "Monday",
      "activity": "activity description",
      "duration": "45 min",
      "notes": "differentiation notes"
    }
  ]
}

Provide ONLY the JSON, no additional text.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Failed to generate lesson plan');
    }

    let lessonPlan = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from markdown code blocks if present
    if (lessonPlan.includes('```json')) {
      lessonPlan = lessonPlan.split('```json')[1].split('```')[0].trim();
    } else if (lessonPlan.includes('```')) {
      lessonPlan = lessonPlan.split('```')[1].split('```')[0].trim();
    }

    const parsedPlan = JSON.parse(lessonPlan);

    return new Response(
      JSON.stringify({ lessonPlan: parsedPlan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in lesson-planner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
