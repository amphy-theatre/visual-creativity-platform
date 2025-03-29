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
      tools: [{ type: "web_search_preview" }],
      instructions: `Search the web and generate EXACTLY 3 movie recommendations (include one indie movie) based on the quote, emotional state and list of movies provided.
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
            
            Recommend movies that connect with these themes and emotions. Take into account the following list of conten to understand the preferences of the user. DO NOT recommend any of the movies listed below. ONLY use them to understand the user's vibe.

            Title	Date
Interstellar	3/15/25
Cobra Kai: Season 6: Skeletons	2/20/25
Cobra Kai: Season 6: Rattled	2/20/25
Cobra Kai: Season 6: Into the Fire	2/18/25
Cobra Kai: Season 6: Peacetime in the Valley	2/13/25
Arrival	2/12/25
SAKAMOTO DAYS: Vs. Son Hee and Bacho	2/12/25
SAKAMOTO DAYS: The Legendary Hit Man	2/8/25
Selection Day: Episode 12	1/8/25
Selection Day: Episode 11	1/8/25
Selection Day: Episode 10	1/8/25
Selection Day: Episode 9	1/8/25
Selection Day: Episode 8	1/8/25
Selection Day: Episode 7	1/8/25
Selection Day: Episode 6	1/7/25
Selection Day: Episode 5	1/7/25
Selection Day: Episode 4	1/7/25
Selection Day: Episode 3	1/7/25
Selection Day: Episode 2	1/7/25
Selection Day: Episode 1	1/7/25
Ouran High School Host Club: The Job of a High School Host!	1/7/25
Chef's Table: Volume 7: Nok Suntaranon	1/7/25
Spider-Man: Into the Spider-Verse	1/7/25
Culinary Class Wars: Season 1: Episode 12	1/5/25
Culinary Class Wars: Season 1: Episode 11	1/5/25
Culinary Class Wars: Season 1: Episode 10	1/4/25
Culinary Class Wars: Season 1: Episode 9	1/4/25
Culinary Class Wars: Season 1: Episode 8	1/3/25
Culinary Class Wars: Season 1: Episode 7	12/30/24
Culinary Class Wars: Season 1: Episode 6	12/30/24
Culinary Class Wars: Season 1: Episode 5	12/30/24
BEEF: Figures of Light	12/28/24
BEEF: The Great Fabricator	12/28/24
BEEF: The Drama of Original Choice	12/28/24
BEEF: I Am a Cage	12/28/24
BEEF: We Draw a Magic Circle	12/27/24
BEEF: Such Inward Secret Creatures	12/27/24
BEEF: Just Not All at the Same Time	12/27/24
BEEF: I Am Inhabited by a Cry	12/27/24
BEEF: The Rapture of Being Alive	12/27/24
BEEF: The Birds Don't Sing, They Screech in Pain	12/27/24
Ranma1/2: Shampoo Cleans Up	12/27/24
DAN DA DAN: Let's Go to the Cursed House	12/27/24
Inglourious Basterds	12/23/24
Culinary Class Wars: Season 1: Episode 4	12/20/24
Culinary Class Wars: Season 1: Episode 3	12/20/24
Culinary Class Wars: Season 1: Episode 2	12/20/24
Culinary Class Wars: Season 1: Episode 1	12/19/24
Green Book	12/19/24
Bee and PuppyCat: Again for the First Time	12/13/24
Ranma1/2: Kiss of Death	12/13/24
DAN DA DAN: First Love	12/13/24
Chef's Table: Volume 6: Asma Khan	12/5/24
Chef's Table: Volume 1: Massimo Bottura	12/5/24
DAN DA DAN: Have You Ever Seen a Cattle Mutilation?	12/5/24
The F Word	12/4/24
Arcane: Season 2: The Dirt Under Your Nails	12/3/24
Arcane: Season 2: Killing Is a Cycle	12/3/24
Arcane: Season 1: Happy Progress Day!	12/3/24
Ranma1/2: I'll Never Let Go	12/2/24
Arcane: Season 2: Pretend Like It's the First Time	11/30/24
Arcane: Season 2: The Message Hidden Within the Pattern	11/30/24
Arcane: Season 2: Blisters and Bedrock	11/30/24
Arcane: Season 2: Finally Got the Name Right	11/30/24
Arcane: Season 2: Watch It All Burn	11/30/24
Arcane: Season 2: Paint the Town Blue	11/30/24
DAN DA DAN: Merge! Serpo Dover Demon Nessie!	11/28/24
Ranma1/2: Darling Charlotte	11/28/24
GTO: Great Teacher Onizuka: Episode 1	11/27/24
DAN DA DAN: I've Got This Funny Feeling	11/27/24
Ranma1/2: Hot Competition	11/16/24
Jake Paul vs. Mike Tyson	11/16/24
DAN DA DAN: To a Kinder World	11/15/24
Arcane: Season 2: Heavy Is the Crown	11/11/24
Arcane: Season 1: Welcome to the Playground	11/11/24
Starting 5: Season 1: Meet the Hoopers Part I	11/10/24
Ranma1/2: Kodachi, The Black Rose	11/10/24
DAN DA DAN: A Dangerous Woman Arrives	11/8/24
DAN DA DAN: Like, Where Are Your Balls?!	11/8/24
DAN DA DAN: Kicking Turbo Granny's Ass	11/8/24
Blue Box: If He Wins	11/7/24
Blue Box: You Have to Go to Nationals	11/7/24
House, M.D.: Season 1: The Socratic Method	11/6/24
House, M.D.: Season 1: Damned If You Do	11/6/24
Ranma1/2: Who Says You're Cute	11/5/24
Ranma1/2: The Hunter	11/5/24
Ranma1/2: Because Thereʼs Someone He Likes	11/5/24
Ranma1/2: I Hate Men!	11/5/24
Ranma1/2: Here's Ranma	11/5/24
Slam Dunk: Season 8: The Glorious Slam Dunk!	10/31/24
Slam Dunk: Season 8: The Man of Miracles, Hanamichi Sakuragi!	10/31/24
Slam Dunk: Season 8: Facing the Strongest Team, Shohoku in Danger!	10/31/24
Slam Dunk: Season 8: Fierce Battle Begins! Shohoku vs. Shoyo/Ryonan	10/31/24
Slam Dunk: Season 8: Mixed Feelings, Uozumi Returns	10/31/24
Slam Dunk: Season 5: Three-Day Super Training	10/30/24
Slam Dunk: Season 5: Baldy Strikes Back!	10/30/24
Slam Dunk: Season 5: Shohoku on the Edge	10/30/24
Slam Dunk: Season 5: Last 10 Seconds! A Perfect Conclusion	10/30/24
Slam Dunk: Season 5: Stubborn Guys!	10/30/24
Slam Dunk: Season 5: Anzai, Bet on Victory!	10/30/24
Slam Dunk: Season 5: Ace Maki, Full Throttle	10/30/24
Slam Dunk: Season 5: The Guy Who Dominates the Game	10/30/24
Slam Dunk: Season 5: King Kong's Younger Brother	10/30/24
Slam Dunk: Season 5: The Gorilla's Injury! Desperate Situation?	10/30/24
Slam Dunk: Season 5: Secret Weapon Against Sakuragi!	10/30/24
Slam Dunk: Season 5: Outside Calculation!? Hanamichi at His Best!	10/30/24
Slam Dunk: Season 5: Challenge to the King	10/29/24
Slam Dunk: Season 4: Takezono, Last Fight	10/29/24
Slam Dunk: Season 4: The Guy Who Pledged to Defeat Kainan	10/29/24
Slam Dunk: Season 4: Challenge From a Rival	10/29/24
Slam Dunk: Season 4: Hanamichi, Hot Dunk	10/29/24
Slam Dunk: Season 4: Imminent Walkout!? Hanamichi's Pinch	10/29/24
Slam Dunk: Season 4: Mitsui! Stormy 3 Points	10/29/24
Slam Dunk: Season 4: Has Mitsui Reached His Limit!?	10/29/24
Slam Dunk: Season 4: Shoyo Ace Fujima's Real Ability	10/29/24
Slam Dunk: Season 4: Shoyo's Ace Fujima Enters the Court	10/29/24
Slam Dunk: Season 4: Rebound King Hanamichi Sakuragi!	10/28/24
Slam Dunk: Season 4: Lightning Flash Ryota!	10/25/24
Slam Dunk: Season 4: Rukawa's Counterattack!	10/25/24
Slam Dunk: Season 4: Hanamichi, Hatsu Sutamen!	10/25/24
Slam Dunk: Season 4: A Well Seeded School, Enter Shoyo	10/25/24
Slam Dunk: Season 3: Hot Blooded Guys	10/25/24
Slam Dunk: Season 3: The Gorilla's Initiation! Kill with Your Eyes!	10/25/24
Slam Dunk: Season 3: Formidable Enemy Miuradai's Secret Weapon	10/24/24
Slam Dunk: Season 3: Genius Hanamichi! Certain Death Dunk	10/24/24
Slam Dunk: Season 3: The Introspective Army's Big Counterattack	10/24/24
Slam Dunk: Season 3: Hanamichi! Pennant Race Debut	10/24/24
Slam Dunk: Season 3: The Beginning of Interhigh Preliminaries	10/24/24
Slam Dunk: Season 2: Who Is This Guy?! Taoka’s Miscalculation	10/23/24
Slam Dunk: Season 2: Hanamichi’s Nervous Big Start!	10/22/24
Slam Dunk: Season 2: Super Basketball Match! Ryonan’s Attack of Angry Waves	10/22/24
Slam Dunk: Season 2: Shohoku vs Ryonan The Fired Up Captain!	10/22/24
Slam Dunk: Season 1: Beat Ryonan! Hard Training Before the Decisive Game	10/22/24
Slam Dunk: Season 1: I Will Play Basketball!	10/22/24
Slam Dunk: Season 1: Special Secret Love Training for Two!?	10/22/24
Slam Dunk: Season 1: The ‘Beginner's Shoot’… is Hard	10/22/24
Slam Dunk: Season 1: Hanamichi's Crisis! The Judo-man's Snare	10/22/24
Slam Dunk: Season 1: Hanamichi Debut!! Dunk Attack	10/22/24
Slam Dunk: Season 1: Rukawa vs. Akagi. The Real Showdown!	10/22/24
Slam Dunk: Season 1: A Gutless Afternoon	10/22/24
Slam Dunk: Season 1: Gorilla vs. Hanamichi! Big Showdown!!	10/21/24
Slam Dunk: Season 1: Basket Man Hanamichi Joins the Team	10/21/24
Slam Dunk: Season 1: Die Basketball! Hanamichi vs. Rukawa	10/21/24
Slam Dunk: Season 1: The Birth of a Genius Basketball Man?!	10/21/24
Arrested Development: Season 1: In God We Trust	10/9/24
Arrested Development: Season 1: My Mother, the Car	10/9/24
Arrested Development: Season 1: Visiting Ours	10/9/24
Arrested Development: Season 1: Charity Drive	10/9/24
Arrested Development: Season 1: Key Decisions	10/9/24
`,
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
