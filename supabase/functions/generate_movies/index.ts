import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getMovieRecommendations } from './openai.ts';

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
    const { selectedQuote, originalEmotion, userPreferences, previousMovies = [] } = await req.json();
    
    // Note: Prompt usage counting is handled in the client code
    // through incrementPromptUsage in the usePromptLimits hook
    const movies = await getMovieRecommendations(selectedQuote, originalEmotion, userPreferences, previousMovies);
    
    return new Response(
      JSON.stringify({ movies }),
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
