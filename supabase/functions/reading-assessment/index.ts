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
    const { audio, expectedText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Processing reading assessment');

    // Step 1: Convert audio to text using Gemini's audio capabilities
    const transcriptionResponse = await fetch(
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
            content: `Transcribe this audio accurately. Return ONLY the transcribed text, nothing else.`
          }]
        })
      }
    );

    const transcriptionData = await transcriptionResponse.json();
    
    if (!transcriptionResponse.ok) {
      console.error('Transcription error:', transcriptionData);
      throw new Error(transcriptionData.error?.message || 'Failed to transcribe audio');
    }

    const transcription = transcriptionData.choices[0].message.content;

    // Step 2: Analyze the reading with AI
    const analysisResponse = await fetch(
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
            content: `You are an expert reading teacher. Compare the expected text with the student's reading transcription and provide a detailed assessment.

Expected Text:
${expectedText}

Student's Transcription:
${transcription}

Provide a detailed assessment in JSON format:
{
  "fluency_score": <number 1-10>,
  "accuracy_analysis": "<detailed analysis of accuracy>",
  "mistakes": ["<specific mistake 1>", "<specific mistake 2>", ...],
  "suggestions": ["<improvement suggestion 1>", "<improvement suggestion 2>", ...],
  "overall_feedback": "<encouraging feedback with specific praise and areas for improvement>"
}

Be specific, constructive, and encouraging. Identify pronunciation errors, omitted words, added words, and reading flow issues.

Provide ONLY the JSON, no additional text.`
          }]
        })
      }
    );

    const analysisData = await analysisResponse.json();
    
    if (!analysisResponse.ok) {
      console.error('Analysis error:', analysisData);
      throw new Error(analysisData.error?.message || 'Failed to analyze reading');
    }

    let reportText = analysisData.choices[0].message.content;
    
    // Extract JSON from markdown code blocks if present
    if (reportText.includes('```json')) {
      reportText = reportText.split('```json')[1].split('```')[0].trim();
    } else if (reportText.includes('```')) {
      reportText = reportText.split('```')[1].split('```')[0].trim();
    }

    const report = JSON.parse(reportText);

    return new Response(
      JSON.stringify({ 
        transcription,
        report 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in reading-assessment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});