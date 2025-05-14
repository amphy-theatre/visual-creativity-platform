
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from "npm:openai";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';
import { decode as decodeJWT } from 'https://deno.land/x/djwt@v2.8/mod.ts';

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
    const { csvData } = await req.json();
    
    if (!csvData) {
      throw new Error('CSV data is required');
    }

    // Extract and verify JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // The Authorization header contains "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    
    // Decode the JWT to get the user information
    // Note: This only decodes, it doesn't verify the signature
    // For production, you would want to add proper JWT verification
    const payload = decodeJWT(token)[1];
    const userId = payload.sub;
    
    if (!userId) {
      throw new Error('User ID not found in JWT token');
    }

    console.log('Received CSV data to summarize, length:', csvData.length);
    console.log('Authenticated user ID:', userId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Use service role key if available (for bypassing RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

    const {data, error } = await supabase.from("profiles")
      .select("subscription_tier")
      .eq("id", userId as string)
      .single();

    if( !data ) return new Response(null);

    if(data.subscription_tier !== `premium`) {
      return new Response(
        JSON.stringify({ 
          error: 'User is not premium',
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

    // Start the background task for generating summary and saving to database
    const processCsvAndSaveSummary = async () => {
      try {
        // Initialize OpenAI client
        const openai = new OpenAI({
          apiKey: Deno.env.get('OPENAI_API_KEY')
        });

        // Call OpenAI API to generate summary
        console.log('Calling OpenAI API to summarize data...');
        const openAIData = await openai.responses.create({
          model: "gpt-4o-mini",
          input: [
            {
              role: "system",
              content: `You will be provided with CSV data of a user's Netflix watch history. From this history, extract key insights about the type of content that the user likes to watch. Include information about the genres that the user likes, the type of plot that the user is drawn to, and other relevant information. Keep your responses VERY CONCISE and informative. answer in bullet points.`
            },
            {
              role: "system",
              content: 'DO NOT add any examples. DO NOT add any justification.'
            },
            {
              role: "system",
              content: `DO NOT use markdown to format your answer.`
            },
            {
              role: "user",
              content: csvData
            }
          ],
          temperature: 0.7,
          max_output_tokens: 500,
        });
        
        // Process the response
        const userPreferences = openAIData.output?.filter(op => op?.type == "message")[0].content[0].text;

        console.log(userPreferences);
        if (!userPreferences) {
          throw new Error('Failed to generate summary from OpenAI');
        }

        console.log('Successfully generated summary');
        
        // Store the summary in the database
        const { error } = await supabase
          .from('file_summaries')
          .upsert(
            { user_id: userId, summary: userPreferences },
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
