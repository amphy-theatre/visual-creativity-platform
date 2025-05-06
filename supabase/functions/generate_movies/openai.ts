
import { extractMoviesFromResponse } from './extract_movies.ts';
import { Movie } from './types.ts';
import { getFallbackMovies } from './providers.ts';
import { enrichMoviesWithTMDBData } from './tmdb.ts';
// import { OpenAI } from "npm:openai";

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

  console.log('Generating movie recommendations for quote:', sanitizedQuote);
  if (sanitizedEmotion) console.log('Also considering emotion:', sanitizedEmotion);
  if (sanitizedUserPreferences) console.log('User preferences from file summary:', sanitizedUserPreferences);
  if (sanitizedPreviousMovies.length > 0) console.log('Excluding previously recommended movies:', sanitizedPreviousMovies);

  // const openai = new OpenAI({apiKey: Deno.env.get('OPENAI_API_KEY')});

  try {
    const url = 'https://api.perplexity.ai/chat/completions';
    const token : string = Deno.env.get('PPLX_API_KEY'); // Replace with your actual token

    // Build the input for OpenAI with improved instructions
    let instructions = `SEARCH THE WEB to generate EXACTLY 3 movie recommendations based on the input provided.
    
    Analyse the user's prompt with the following guidelines:
    - If the user references any movies, extract information about the TONE, plot devices, THEMES and characters.
    - How abstract or literal the prompt is,
    - How specific the prompt is.
    - The user's style of writing.

    The user may also provide a quote. If so, then analyze the quote for its meaning, themes and tone.
    
    Use the information from your analysis to generate the THREE MOST RELEVANT movies that you can.

    For each movie, provide ONLY the title, release year, and a brief description that is relevant to the prompt.
    
    MAKE SURE TO FIND ALL THREE PIECES OF INFORMATION FOR ALL OF THE MOVIES.`;
    
    if (sanitizedPreviousMovies.length > 0) {
      instructions += `\nDO NOT recommend any of these movies: ${sanitizedPreviousMovies.join(', ')}`;
    }

    // Build the input for OpenAI
    let input = sanitizedEmotion != `` ? `Quote: "${sanitizedQuote}"\n` : ``;
    input += `Emotion/Mood: ${sanitizedEmotion || 'Not specified'}`;
    
    // Add user preferences if available
    if (sanitizedUserPreferences) {
      input += `\nUser Preferences: ${sanitizedUserPreferences}`;
    }
    
    // console.log("Sending request to OpenAI with model: gpt-4o-mini");
    
    // const openAIData = await openai.responses.create({
    //   model: "gpt-4o-mini",
    //   tools: [{ type: "web_search_preview" }],
    //   instructions: instructions,
    //   input: input,
    //   temperature: 1.0,
    //   max_output_tokens: 500,
    //   text: {
    //     format: {
    //       type: "json_schema",
    //       name: "movie_recommendations",
    //       schema: {
    //         type: "object",
    //         properties: {
    //           items: {
    //             type: "array",
    //             items: {
    //               type: "object",
    //               properties: {
    //                 title: { 
    //                   type: "string",
    //                   description: "Movie title only, no other text"
    //                 },
    //                 release_year: { 
    //                   type: "string",
    //                   description: "The YEAR the movie released only, no other text"
    //                 },
    //                 description: { 
    //                   type: "string",
    //                   description: "Brief description without any URLs, citations, or references"
    //                 },
    //               },
    //               required: ["title", "release_year", "description"],
    //               additionalProperties: false,
    //             }
    //           }
    //         },
    //         required: ["items"],
    //         additionalProperties: false,
    //       }
    //     }
    //   }
    // });
  
    const requestData = {
      model: 'sonar',
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: input }
      ],
      temperature: 1.0,
      max_tokens: 300,
      response_format: {
        type: "json_schema",
        json_schema: {
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
                  additionalProperties: false
                }
              }
            },
            required: ["items"],
            additionalProperties: false
          }
        }
      },
      search_domain_filter: [
        "wikipedia.org",
        "imdb.com",
        "rottentomatoes.com",
        "metacritic.com",
        "letterboxd.com",
        "indiewire.com"
    ]
    };

    console.log("Sending request to Sonar");

    const pplxData = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    // Safely access the response content
    const output = await pplxData.json()
    
    if (!output) {
      console.error('Invalid or empty response from OpenAI API');
      throw new Error('Invalid response from PPLX API');
    }
    
    console.log("Raw PPLX response:", output);
  
    // Extract movies from the content using our more robust extraction
    let movies = extractMoviesFromResponse(output.choices[0].message.content);
    
    console.log(`Extracted ${movies.length} movies from the response`);
    
    // Ensure we have exactly 3 movies
    if (movies.length < 3) {
      console.log(`Only extracted ${movies.length} movies, adding fallback movies`);
      
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
    console.log('Using fallback movies due to API error');
    const fallbackMovies = getFallbackMovies();
    return fallbackMovies.slice(0, 3);
  }
}
