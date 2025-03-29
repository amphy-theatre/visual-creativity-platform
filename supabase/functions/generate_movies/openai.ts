import { extractMoviesFromResponse } from './extract_movies.ts';
import { Movie } from './types.ts';
import { getFallbackMovies } from './providers.ts';
import { enrichMoviesWithTMDBData } from './tmdb.ts';
import { OpenAI } from "npm:openai";

export async function getMovieRecommendations(
  selectedQuote: string, 
  originalEmotion?: string,
  previousMovies: string[] = []
): Promise<Movie[]> {
  // Input validation
  if (!selectedQuote || typeof selectedQuote !== 'string') {
    throw new Error('Valid quote text is required');
  }

  // Sanitize inputs
  const sanitizedQuote = String(selectedQuote).trim();
  const sanitizedEmotion = originalEmotion ? String(originalEmotion).trim() : undefined;
  const sanitizedPreviousMovies = Array.isArray(previousMovies) 
    ? previousMovies.filter(m => typeof m === 'string').map(m => String(m).trim())
    : [];

  // Check for empty quote after trimming
  if (sanitizedQuote === '') {
    throw new Error('Quote cannot be empty');
  }

  // Length limitations to prevent excessively long inputs
  if (sanitizedQuote.length > 1000) {
    throw new Error('Quote text is too long (maximum 1000 characters)');
  }
  
  if (sanitizedEmotion && sanitizedEmotion.length > 500) {
    throw new Error('Emotion text is too long (maximum 500 characters)');
  }

  console.log('Generating movie recommendations for quote:', sanitizedQuote);
  if (sanitizedEmotion) console.log('Also considering emotion:', sanitizedEmotion);
  if (sanitizedPreviousMovies.length > 0) console.log('Excluding previously recommended movies:', sanitizedPreviousMovies);

  const openai = new OpenAI({apiKey: Deno.env.get('OPENAI_API_KEY')});

  try {
    const openAIData = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [{
        type: "web_search_preview",
        search_context_size: "low",
      }],
      instructions: `Search the web and generate EXACTLY 3 movie recommendations (include one indie movie) based on the quote and emotional state provided.
        You must search the web, don't rely on in-built generation.
        For each movie, include:
        - The movie name (no prefixes like 'Title:')
        - A brief description (1-2 sentences, no label needed)

        DO NOT include any links, URLs, references, or citations in your response.
        DO NOT use phrases like "According to..." or "Based on...".
        Format each movie as a numbered list item (1., 2., 3.) with clear separation between movies.
        Do not use any special formatting characters like asterisks, quotes, stars, or brackets.
        
        ${sanitizedPreviousMovies.length > 0 ? `DO NOT recommend any of these movies: ${sanitizedPreviousMovies.join(', ')}` : ''}
        `,
      input: `Quote: "${sanitizedQuote}"
            Emotional state: ${sanitizedEmotion || 'Unknown'}
            
            Recommend movies that connect with these themes and emotions.`,
      temperature: 1.2,
      max_output_tokens: 300,
    });
  
    // Safely access the response content
    const output = openAIData.output?.filter(op => op?.type === "message");
    const content = output?.[0]?.content?.[0]?.text;
    
    if (!content) {
      console.error('Invalid or empty response from OpenAI API');
      throw new Error('Invalid response from OpenAI API');
    }
    
    console.log("Raw OpenAI response:", content);
  
    // Extract movies from the content
    let movies = extractMoviesFromResponse(content);
    
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
