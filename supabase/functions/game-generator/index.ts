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
    const { topic, gradeLevel, gameType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating educational game with Lovable AI');

    let gamePrompt = '';
    
    switch (gameType) {
      case 'quiz':
        gamePrompt = `Create a fun quiz game about ${topic} for Grade ${gradeLevel}. Include 10 multiple choice questions with 4 options each and correct answers. Make it engaging and educational.`;
        break;
      case 'matching':
        gamePrompt = `Create a matching game about ${topic} for Grade ${gradeLevel}. Provide 10 pairs of items to match (e.g., terms and definitions, questions and answers). Make it culturally relevant for Indian students.`;
        break;
      case 'word-search':
        gamePrompt = `Create a word search puzzle about ${topic} for Grade ${gradeLevel}. Provide 15 key words related to the topic and brief descriptions. Include hints for each word.`;
        break;
      case 'fill-blanks':
        gamePrompt = `Create a fill-in-the-blanks game about ${topic} for Grade ${gradeLevel}. Provide 10 sentences with blanks and word banks. Make it educational and fun.`;
        break;
    }

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
            content: `${gamePrompt}

Format as JSON:
{
  "title": "Game title",
  "instructions": "How to play the game",
  "content": {
    // Game-specific content (questions, pairs, words, etc.)
  }
}

Make it engaging, educational, and appropriate for Indian students in rural schools. Use simple language and relatable examples.

Provide ONLY the JSON, no additional text.`
          }]
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Lovable AI error:', data);
      throw new Error(data.error?.message || 'Failed to generate game');
    }

    let gameData = data.choices[0].message.content;
    
    // Extract JSON from markdown code blocks if present
    if (gameData.includes('```json')) {
      gameData = gameData.split('```json')[1].split('```')[0].trim();
    } else if (gameData.includes('```')) {
      gameData = gameData.split('```')[1].split('```')[0].trim();
    }

    const game = JSON.parse(gameData);

    return new Response(
      JSON.stringify({ game }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in game-generator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});