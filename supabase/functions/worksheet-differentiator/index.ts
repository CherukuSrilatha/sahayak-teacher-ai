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
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing textbook page with Lovable AI vision');

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this textbook page and create 3 differentiated worksheet versions for different grade levels in a multi-grade classroom:

1. Basic Level (Grades 1-2): Simplified vocabulary, basic concepts, visual aids
2. Intermediate Level (Grades 3-4): Standard concepts as shown in the textbook
3. Advanced Level (Grades 5-6): Extended concepts, critical thinking questions

For each level, provide:
- Grade range
- Difficulty level
- Detailed description of adaptations
- 3-5 specific questions or activities

Format as JSON:
{
  "worksheets": [
    {
      "grade": "Grade 1-2",
      "difficulty": "Basic",
      "description": "description",
      "activities": ["activity1", "activity2", "activity3"]
    }
  ]
}

Provide ONLY the JSON, no additional text.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Lovable AI error:', data);
      throw new Error(data.error?.message || 'Failed to analyze textbook page');
    }

    let worksheetsData = data.choices[0].message.content;
    
    // Extract JSON from markdown code blocks if present
    if (worksheetsData.includes('```json')) {
      worksheetsData = worksheetsData.split('```json')[1].split('```')[0].trim();
    } else if (worksheetsData.includes('```')) {
      worksheetsData = worksheetsData.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(worksheetsData);

    return new Response(
      JSON.stringify({ worksheets: parsed.worksheets }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in worksheet-differentiator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
