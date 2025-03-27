import { extractMoviesFromResponse } from './extract_movies.ts';
import { Movie } from './types.ts';
import { getFallbackMovies } from './providers.ts';
import { enrichMoviesWithTMDBData } from './tmdb.ts';
import { OpenAI } from "npm:openai";
import { debug } from "../_utils/debug.ts";

const debugLog = debug("movie_gen_ai");

export async function getMovieRecommendations(
  selectedQuote?: string, 
  originalEmotion?: string,
  userPreferences?: string,
  previousMovies: string[] = []
): Promise<Movie[]> {
  // Input validation
  if (typeof selectedQuote !== 'string') {
    throw new Error('Valid quote text is required');
  }

  // Sanitize inputs
  const sanitizedQuote = String(selectedQuote).trim();
  const sanitizedEmotion = originalEmotion ? String(originalEmotion).trim() : undefined;
  const sanitizedUserPreferences = userPreferences ? String(userPreferences).trim() : undefined;
  const sanitizedPreviousMovies = Array.isArray(previousMovies) 
    ? previousMovies.filter(m => typeof m === 'string').map(m => String(m).trim())
    : [];


  // Length limitations to prevent excessively long inputs
  if (sanitizedQuote.length > 1000) {
    throw new Error('Quote text is too long (maximum 1000 characters)');
  }
  
  if (sanitizedEmotion && sanitizedEmotion.length > 500) {
    throw new Error('Emotion text is too long (maximum 500 characters)');
  }

  debugLog('Generating movie recommendations for quote:', sanitizedQuote);
  if (sanitizedEmotion) debugLog('Also considering emotion:', sanitizedEmotion);
  if (sanitizedUserPreferences) debugLog('User preferences from file summary:', sanitizedUserPreferences);
  if (sanitizedPreviousMovies.length > 0) debugLog('Excluding previously recommended movies:', sanitizedPreviousMovies);

  const openai = new OpenAI({apiKey: Deno.env.get('OPENAI_API_KEY')});

  try {
    // Build the input for OpenAI with improved instructions
    let instructions = `You are an expert AI movie curator. A user will submit a trope, mood, vibe or brief scene description, and might submit a quote. You must:
1. *Parse & Prioritize*
  - *For the User Input:*
  - Identify the core emotion or atmosphere (e.g. wistful nostalgia, high-octane suspense, bittersweet romance).
  - Detect any explicit tropes or motifs (e.g. “enemies-to-lovers,” “last-man-standing,” “road trip”).
  - Note any style cues (TONE, pacing, keywords).
  - Use the quote ONLY as a tool to interpret what the user meant by the peo

2. *Select 3 Highly Specific Films*
  - SEARCH THE WEB TO GENERATE exactly TWELVE DISTINCT titles that perfectly embody the user's input.
  - Avoid generic “genre-staples” AND DO NOT REPEAT films previously recommended in this session.
  - Ensure each pick is distinct in era, director, or cultural background to add richness.

3. *Output Requirements*
  - Return a JSON object with a top-level key "items", containing an array of three objects.
  - Each object must include:
    - "title": the official movie title
    - "year": release year
    - "description": a 2-3 sentence description of the movie that ties it directly to the user's mood/trope/vibe  
  - *Do not* include URLs, citations, or any extra commentary outside of the JSON.

4. *Session Memory*
  - The user will tell you which movies you have recommended before. Do not repeat those.
  - Keep track of recommendations made within the current session.
  - Never suggest the same film more than once in one session.

When the user types their prompt (trope, mood, quote, etc.), apply these rules to generate the perfect curated list.`

    // Build the input for OpenAI
    let input = `User input: ${sanitizedEmotion || 'Not specified'}`;
    input += sanitizedQuote != `` ? `\nQuote: ${sanitizedQuote}` : ``;
    
    // Add user preferences if available
    if (sanitizedUserPreferences) {
      input += `\nUser Preferences: ${sanitizedUserPreferences}`;
    }
    if (sanitizedPreviousMovies.length > 0) {
      input += `\nPreviously recommended movies: ${sanitizedPreviousMovies.join(', ')}`;
    }

    debugLog("Sending request to OpenAI with model: gpt-4o-mini");
    
    const openAIData = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [{
        type: "web_search_preview",
        search_context_size: "high",
        user_location: {
            "type": "approximate",
            "country": "US",
        }
      }],
      instructions: instructions,
      input: input,
      temperature: 1.3,
      max_output_tokens: 500,
      text: {
        format: {
          type: "json_schema",
          name: "movie_recommendations",
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { 
                      type: "string",
                      description: "Movie title only, no other text"
                    },
                    release_year: { 
                      type: "string",
                      description: "The YEAR the movie released only, no other text"
                    },
                    description: { 
                      type: "string",
                      description: "Brief description without any URLs, citations, or references"
                    },
                  },
                  required: ["title", "release_year", "description"],
                  additionalProperties: false,
                }
              }
            },
            required: ["items"],
            additionalProperties: false,
          }
        }
      }
    });

    const output = openAIData.output?.filter(op => op?.type === "message");
    if (!output) {
      ('Invalid or empty response from OpenAI API');
      throw new Error('Invalid response from OpenAI API');
    }
    
    const content = output?.[0]?.content?.[0]?.text;
    debugLog("Raw AI response:", content);

    // Extract movies from the content using our more robust extraction
    let movies = extractMoviesFromResponse(content);
    
    debugLog(`Extracted ${movies.length} movies from the response`);
    
    // Ensure we have exactly 3 movies
    if (movies.length < 3) {
      debugLog(`Only extracted ${movies.length} movies, adding fallback movies`);
      
      // Add fallback movies if we don't have enough
      const fallbackMovies = getFallbackMovies();
      
      // Add fallback movies as needed
      for (let i = movies.length; i < 3; i++) {
        // Pick a fallback movie not already in our list and not in previousMovies
        const availableFallbacks = fallbackMovies.filter(
          m => !movies.some(movie => movie.title === m.title) && 
              !sanitizedPreviousMovies.includes(m.title)
        );
        
        if (availableFallbacks.length > 0) {
          // Add a fallback movie that hasn't been recommended before
          movies.push(availableFallbacks[i % availableFallbacks.length]);
        } else {
          // If we're out of unique fallbacks, use any fallback
          const fallbackMovie = fallbackMovies[i % fallbackMovies.length];
          movies.push(fallbackMovie);
        }
      }
    } else if (movies.length > 3) {
      // Only keep the first 3 movies if we have more
      movies = movies.slice(0, 3);
    }

    // Final cleanup of movie titles to ensure no stray asterisks
    movies = movies.map(movie => ({
      ...movie,
      title: movie.title.replace(/^\*+|\*+$/g, '').trim()
    }));

    // Enrich movies with TMDB data (posters and streaming providers)
    movies = await enrichMoviesWithTMDBData(movies);

    return movies;
  } catch (error) {
    console.error('Error in getMovieRecommendations:', error);
    // Return fallback movies if OpenAI fails
    debugLog('Using fallback movies due to API error');
    const fallbackMovies = getFallbackMovies();
    return fallbackMovies.slice(0, 3);
  }
}
