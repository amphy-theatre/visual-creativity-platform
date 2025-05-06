
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from "npm:openai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Parse and validate the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      throw new Error('Invalid JSON in request body');
    }

    const { prompt } = requestData;
    
    // Input validation
    if (!prompt) {
      throw new Error('Prompt is required');
    }
    
    // Sanitize input - trim and ensure it's a string
    const sanitizedPrompt = String(prompt).trim();
    
    // Add length limitation to prevent excessively long inputs
    if (sanitizedPrompt.length > 500) {
      throw new Error('Prompt text is too long (maximum 500 characters)');
    }

    // Check for empty input after trimming
    if (sanitizedPrompt === '') {
      throw new Error('Prompt cannot be empty');
    }

    console.log('Analyzing prompt:', sanitizedPrompt);
    
    const openai = new OpenAI({apiKey: Deno.env.get('OPENAI_API_KEY')});

    const openAIData = await openai.responses.create({
        model: "gpt-4.1-nano",
        instructions: 'Determine if a prompt is "figurative" (metaphorical, emotional, abstract) or "literal" (concrete, specific, direct request). Respond with ONLY the word "figurative" or "literal".',
        input: sanitizedPrompt,
        temperature: 0.2,
        max_output_tokens: 50,
    });

    const content = openAIData.output?.filter(op => op?.type == "message")[0].content[0].text;
    
    if (!content) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    // Extract the classification from the response
    const classification = content.toLowerCase().includes('literal') ? 'literal' : 'figurative';
    
    console.log(`Classification result: ${classification}`);

    return new Response(
      JSON.stringify({ type: classification }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  }
});
