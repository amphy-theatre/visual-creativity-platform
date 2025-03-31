
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from "npm:openai";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://sdwuhuuyyrwzwyqdtdkb.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Use service role key if available (for bypassing RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

    // Start the background task for generating summary and saving to database
    const processCsvAndSaveSummary = async () => {
      try {
        // Initialize OpenAI client
        const openai = new OpenAI({
          apiKey: Deno.env.get('OPENAI_API_KEY')
        });

        // Call OpenAI API to generate summary
        console.log('Calling OpenAI API to summarize data...');
        const openAIData = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert in analyzing and summarizing CSV data. Provide a concise yet comprehensive summary of the CSV content."
            },
            {
              role: "user",
              content: csvData
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        // Process the response
        const summary = openAIData.choices[0]?.message?.content;
        
        if (!summary) {
          throw new Error('Failed to generate summary from OpenAI');
        }

        console.log('Successfully generated summary');
        
        // Store the summary in the database
        const { error } = await supabase
          .from('file_summaries')
          .upsert(
            { user_id: userId, summary },
            { onConflict: 'user_id' }
          );
          
        if (error) {
          console.error('Error storing summary in database:', error);
        } else {
          console.log('Successfully stored summary in database for user:', userId);
        }
      } catch (error) {
        console.error('Error in background task:', error);
      }
    };

    // Use EdgeRuntime.waitUntil to run the task in the background
    EdgeRuntime.waitUntil(processCsvAndSaveSummary());
    
    // Immediately return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Processing started' 
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
