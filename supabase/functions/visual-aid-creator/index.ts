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
    const { description } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Generating visual aid with Gemini:', description);

    // Use Gemini's image generation capability
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a simple, clear educational diagram or visual aid based on this description: ${description}

The image should be:
- Simple line drawing style, suitable for blackboard copying
- Clear and easy to understand
- Educational and appropriate for students
- Black and white or minimal colors

Please generate an image that matches this description.`
            }]
          }],
          generationConfig: {
            temperature: 0.4,
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Failed to generate visual aid');
    }

    // Check if image was generated
    if (data.candidates[0].content.parts[0].inlineData) {
      const imageData = data.candidates[0].content.parts[0].inlineData;
      const base64Image = `data:${imageData.mimeType};base64,${imageData.data}`;
      
      return new Response(
        JSON.stringify({ imageUrl: base64Image }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Fallback: provide a text-based description
      const textResponse = data.candidates[0].content.parts[0].text;
      return new Response(
        JSON.stringify({ 
          imageUrl: null,
          description: textResponse,
          message: "Image generation not available. Here's a description you can use to draw the visual aid."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in visual-aid-creator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
