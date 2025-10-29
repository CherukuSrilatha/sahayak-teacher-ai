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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating visual aid with Lovable AI:', description);

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [{
            role: 'user',
            content: `Generate a simple, clear educational diagram or visual aid based on this description: ${description}

The image should be:
- Simple line drawing style, suitable for blackboard copying
- Clear and easy to understand
- Educational and appropriate for students
- Black and white or minimal colors

Please generate an image that matches this description.`
          }],
          modalities: ['image', 'text']
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Lovable AI error:', data);
      
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to your Lovable workspace in Settings → Workspace → Usage.');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      
      throw new Error(data.error?.message || data.message || 'Failed to generate visual aid');
    }

    // Check if image was generated
    if (data.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
      const imageUrl = data.choices[0].message.images[0].image_url.url;
      
      return new Response(
        JSON.stringify({ imageUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Fallback: provide a text-based description
      const textResponse = data.choices[0].message.content;
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
