
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from "npm:openai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { csvData, userId } = await req.json();
    
    if (!csvData) {
      throw new Error('CSV data is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Received CSV data to summarize, length:', csvData.length);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    // Call OpenAI API to generate summary
    console.log('Calling OpenAI API to summarize data...');
    const openAIData = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [],
      instructions: 'You are an expert in analyzing and summarizing CSV data. Provide a concise yet comprehensive summary of the CSV content.',
      input: csvData,
      temperature: 0.7,
      max_output_tokens: 500,
    });

    // Process the response
    const output = openAIData.output?.filter(op => op?.type === "message");
    const summary = output?.[0]?.content?.[0]?.text;
    
    if (!summary) {
      throw new Error('Failed to generate summary from OpenAI');
    }

    console.log('Successfully generated summary');

    // Format the response
    return new Response(
      JSON.stringify({ 
        summary,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  } catch (error) {
    console.error('Error in summarize_csv function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false
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
