
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractMoviesInfo } from "./extract_movies.ts";
import { callOpenAI } from "./openai.ts";
import { getProviders } from "./providers.ts";
import { MovieApiResponse, Movie } from "./types.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
      },
    });
  }

  try {
    const requestData = await req.json();
    const { 
      selectedQuote, 
      originalEmotion, 
      userPreferences, 
      previousMovies = [],
      genre
    } = requestData;

    // Check if we have at least one of the necessary inputs
    if (!selectedQuote && !originalEmotion && !genre) {
      return new Response(
        JSON.stringify({ error: "Missing required input: need quote, emotion, or genre" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    
    // Determine query approach based on available inputs
    let prompt;
    if (selectedQuote) {
      prompt = `Generate 3 movie recommendations that match the emotional tone of this quote: "${selectedQuote}"`;
      if (originalEmotion) {
        prompt += ` The quote was selected to match this mood/emotion: "${originalEmotion}".`;
      }
    } else if (genre) {
      // Handle direct genre-based recommendations
      prompt = `Generate 3 ${genre} movie recommendations`;
      if (originalEmotion) {
        prompt += ` that match this mood/description: "${originalEmotion}"`;
      }
    } else {
      // Fall back to emotion-based recommendations
      prompt += `Generate 3 movie recommendations for someone feeling: "${originalEmotion}"`;
    }
    
    // Add user preferences if available
    if (userPreferences) {
      prompt += ` Consider these user preferences: ${userPreferences}`;
    }
    
    // Avoid previously recommended movies
    if (previousMovies && previousMovies.length > 0) {
      prompt += ` Please don't include these movies that were already recommended: ${previousMovies.join(", ")}.`;
    }

    // Add final instructions for formatting
    prompt += ` For each movie, provide: title, description, link to more information, and a rating out of 10.`;
    
    // Send the prompt to OpenAI
    console.log("Sending prompt to OpenAI:", prompt);
    const response = await callOpenAI(prompt);
    console.log("Response from OpenAI:", response);

    // Extract movie data
    const movies = extractMoviesInfo(response);
    console.log("Extracted movie data:", movies);

    // Get streaming providers (can be mocked for now)
    const moviesWithProviders = await getProviders(movies);
    console.log("Movies with providers:", moviesWithProviders);
    
    // Return the movies with streaming providers
    return new Response(JSON.stringify({ movies: moviesWithProviders }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in generate_movies edge function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});
