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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Analyzing textbook page with Gemini vision');

    // Remove data URL prefix if present
    let base64Data = imageBase64;
    if (imageBase64.includes('base64,')) {
      base64Data = imageBase64.split('base64,')[1];
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
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
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Failed to analyze textbook page');
    }

    let worksheetsData = data.candidates[0].content.parts[0].text;
    
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
