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
Khakee: The Bengal Chapter: Lanka Dahan	3/24/25
Khakee: The Bengal Chapter: The Mole	3/24/25
Khakee: The Bengal Chapter: City of Bhoy	3/24/25
Khakee: The Bengal Chapter: Rakshabandhan	3/24/25
Khakee: The Bengal Chapter: Jay-Veeru	3/24/25
Khakee: The Bengal Chapter: Gurudakshina	3/23/25
Khakee: The Bengal Chapter: City of Joy	3/23/25
Superbad	3/22/25
Emergency	3/15/25
The Greatest Rivalry: India vs Pakistan: Rise of the Legends	2/9/25
The Roshans: We Found Him…	1/25/25
The Roshans: Didn’t know where I was going	1/24/25
The Roshans: Little we have, a bit more is needed	1/24/25
Black Warrant: Double Life Sentence	1/23/25
Black Warrant: The Blanket	1/23/25
Black Warrant: Prison Food	1/23/25
Black Warrant: Team Player	1/23/25
Black Warrant: Macho	1/23/25
Black Warrant: Gallows	1/23/25
Black Warrant: The Snake	1/23/25
The Roshans: Even If We Are Not There…	1/23/25
Double XL	12/19/24
Vicky Vidya ka Woh Wala Video	12/16/24
Rush Hour	12/14/24
That Christmas	12/12/24
Little Women	12/7/24
Ulajh	12/2/24
The Office (U.S.): Season 1: Pilot	12/1/24
JOY - The Birth of IVF	11/28/24
The Other Woman	11/18/24
Jake Paul vs. Mike Tyson	11/16/24
Clueless	11/16/24
Vijay 69	11/13/24
Student of the Year 2	11/10/24
Jack the Giant Slayer	11/10/24
Kingsman: The Golden Circle	11/9/24
The Diplomat: Season 2: Dreadnought	11/8/24
The Diplomat: Season 2: Our Lady of Immaculate Deception	11/8/24
The Diplomat: Season 2: The Other Army	11/8/24
The Diplomat: Season 2: The Ides of March	11/8/24
Kingsman: The Secret Service	11/7/24
The Diplomat: Season 2: St. Paul's	11/3/24
The Diplomat: Season 2: When a Stranger Calls	11/3/24
The Catcher Was a Spy	10/26/24
Khel Khel Mein	10/20/24
Superstore: Season 1: Magazine Profile	10/16/24
Superstore: Season 1: Pilot	10/14/24
Chopsticks	10/13/24
Masterpiece Contemporary: Page Eight	10/13/24
Duck Duck Goose	10/7/24
Maamla Legal Hai: Darwaza	10/4/24
Maamla Legal Hai: Egregious	10/2/24
SpongeBob SquarePants: Season 9: Extreme Spots/Squirrel Record	10/2/24
Rez Ball	10/2/24
Caught Out: Crime. Corruption. Cricket.	9/29/24
Hum Saath-Saath Hain	9/27/24
Pixels	9/24/24
Young Sheldon: Season 7: Memoir	9/23/24
Young Sheldon: Season 7: Funeral	9/23/24
Young Sheldon: Season 7: A New Home and a Traditional Texas Torture	9/23/24
Murder Mubarak	9/21/24
Young Sheldon: Season 7: Community Service and the Key to a Happy Marriage	9/19/24
Young Sheldon: Season 7: A Little Snip and Teaching Old Dogs	9/19/24
Young Sheldon: Season 7: A Fancy Article and a Scholarship for a Baby	9/19/24
Young Sheldon: Season 7: An Ankle Monitor and a Big Plastic Crap House	9/19/24
Young Sheldon: Season 7: A Proper Wedding and Skeletons in the Closet	9/19/24
Young Sheldon: Season 7: Baptists, Catholics and an Attempted Drowning	9/18/24
Young Sheldon: Season 7: A Frankenstein's Monster and a Crazy Church Guy	9/18/24
Young Sheldon: Season 7: Ants on a Log and a Cheating Winker	9/18/24
Young Sheldon: Season 7: A Strudel and a Hot American Boy Toy	9/18/24
Young Sheldon: Season 7: A Roulette Wheel and a Piano Playing Dog	9/18/24
Young Sheldon: Season 7: A Wiener Schnitzel and Underwear in a Tree	9/18/24
Mean Girls	9/16/24
Kalki 2898 AD (Hindi)	8/24/24
Hillbilly Elegy	8/10/24
Don't Look Up	8/8/24
Shirley	8/8/24
Leo	8/8/24
Mr. & Mrs. Mahi	7/31/24
Tribhuvan Mishra CA Topper: Family Function	7/30/24
Tribhuvan Mishra CA Topper: Guns N Roses	7/30/24
Tribhuvan Mishra CA Topper: Balls Of Steel	7/30/24
Tribhuvan Mishra CA Topper: Male Prostitute	7/30/24
Tribhuvan Mishra CA Topper: Sweet Union	7/30/24
Tribhuvan Mishra CA Topper: Bunty And Babli	7/30/24
Tribhuvan Mishra CA Topper: DilDesire.com	7/30/24
Tribhuvan Mishra CA Topper: Loser	7/30/24
Tribhuvan Mishra CA Topper: Romance, Action, and Drama	7/30/24
Savi	7/28/24
The Last Full Measure	7/23/24
The Long Game	7/21/24
Khakee: The Bihar Chapter: PHACE TO PHACE !	7/18/24
Khakee: The Bihar Chapter: MEETA JI KI LOVE STORY PART 2	7/18/24
Khakee: The Bihar Chapter: MEETA JI KI LOVE STORY !!!	7/18/24
Khakee: The Bihar Chapter: MOOH DIKHAI !!!	7/18/24
Khakee: The Bihar Chapter: AMIT KAUN ???	7/18/24
Khakee: The Bihar Chapter: CHANDANWA KA JANM !	7/17/24
Khakee: The Bihar Chapter: PATRA PARICHAY !	7/17/24
The Queen	7/17/24
Kathal - A Jackfruit Mystery	7/12/24
Srikanth	7/9/24
Only the Brave	7/4/24
Maharaj	7/3/24
Khufiya	7/2/24
The Romantics: Limited Series: Legacy	7/2/24
The Romantics: Limited Series: The New Guard	7/2/24
The Romantics: Limited Series: Prodigal Son	7/2/24
The Romantics: Limited Series: The Boy from Jalandhar	7/2/24
Michael Clayton	6/30/24
Laapataa Ladies	6/25/24
Crew	6/23/24
Kota Factory: Season 3: Product Delivery	6/22/24
Kota Factory: Season 3: Emergency Response	6/22/24
Kota Factory: Season 3: Benchmarking	6/22/24
Kota Factory: Season 3: Fault Mitigation	6/22/24
Kota Factory: Season 3: Mission Statement	6/22/24
Kota Factory: Season 1: Optimization	6/21/24
BlacKkKlansman	6/4/24
A Man in Full: Limited Series: Saddlebags	5/31/24
Morning Glory	5/24/24
Sajini Shinde Ka Viral Video	5/24/24
Operation Varsity Blues: The College Admissions Scandal	5/17/24
Selection Day: Episode 12	5/15/24
Selection Day: Episode 9	5/15/24
Selection Day: Episode 8	5/15/24
Selection Day: Episode 7	5/15/24
Selection Day: Episode 6	5/15/24
Selection Day: Episode 1	5/15/24
Scoop	4/27/24
Article 370	4/25/24
'83	4/18/24
The Rewrite	4/17/24
3 Body Problem: Season 1: Countdown	4/17/24
The Miracle Season	4/15/24
Draft Day	4/9/24
The Beautiful Game	4/2/24
Avatar The Last Airbender: Legends	3/10/24
Avatar The Last Airbender: Into the Dark	3/10/24
Kho Gaye Hum Kahan	3/2/24
Avatar The Last Airbender: Omashu	2/24/24
Avatar The Last Airbender: Warriors	2/24/24
Avatar The Last Airbender: Aang	2/23/24
42	2/21/24
Free State of Jones	2/11/24
Awakenings	2/3/24
Mahalia	1/20/24
A Beautiful Day in the Neighborhood	1/17/24
You Are What You Eat: A Twin Experiment: Limited Series: Episode 4	1/17/24
You Are What You Eat: A Twin Experiment: Limited Series: Episode 3	1/15/24
You Are What You Eat: A Twin Experiment: Limited Series: Episode 2	1/14/24
You Are What You Eat: A Twin Experiment: Limited Series: Episode 1	1/14/24
The Crown: Season 6: Sleep, Dearie Sleep	12/18/23
The Crown: Season 6: Hope Street	12/18/23
The Crown: Season 6: Ritz	12/17/23
The Crown: Season 6: Alma Mater	12/17/23
The Crown: Season 6: Ruritania	12/17/23
The Crown: Season 6: Willsmania	12/17/23
The Phantom of the Open	12/13/23
Bill Russell: Legend: Part 2	12/12/23
Bill Russell: Legend: Part 1	12/12/23
The Railway Men - The Untold Story Of Bhopal 1984: Limited Series: Episode 4	12/10/23
The Railway Men - The Untold Story Of Bhopal 1984: Limited Series: Episode 3	12/10/23
The Railway Men - The Untold Story Of Bhopal 1984: Limited Series: Episode 2	12/10/23
The Railway Men - The Untold Story Of Bhopal 1984: Limited Series: Episode 1	12/10/23
Rustin	12/7/23
Beckham: Limited Series: The Kick	12/7/23
The Last Czars: Limited Series: War	12/6/23
The Last Czars: Limited Series: Anarchy	12/6/23
The Last Czars: Limited Series: The Boy	12/6/23
The Last Czars: Limited Series: The Chosen One	12/6/23
Mission Raniganj: The Great Bharat Rescue	12/6/23
Best. Christmas. Ever!	12/4/23
Greater	11/29/23
The Crown: Season 6: Aftermath	11/21/23
The Crown: Season 6: Dis-Moi Oui	11/21/23
The Crown: Season 6: Two Photographs	11/21/23
The Crown: Season 6: Persona Non Grata	11/21/23
The Crown: Season 1: Wolferton Splash	11/20/23
The Diplomat: Season 1: The James Bond Clause	11/17/23
The Diplomat: Season 1: Keep Your Enemies Closer	11/17/23
The Diplomat: Season 1: Some Lusty Tornado	11/17/23
The Diplomat: Season 1: The Dogcatcher	11/17/23
The Diplomat: Season 1: He Bought a Hat	11/16/23
The Diplomat: Season 1: Lambs in the Dark	11/16/23
The Diplomat: Season 1: Don't Call It a Kidnapping	11/16/23
The Diplomat: Season 1: The Cinderella Thing	11/16/23
Official Secrets	11/9/23
NYAD	11/7/23
Spotlight	10/30/23
American Gangster	10/16/23
You Are So Not Invited to My Bat Mitzvah	10/15/23
Munich – The Edge of War	10/12/23
Riphagen - The Untouchable	10/12/23
Untouchable	10/12/23
American Made	9/24/23
The Judge	9/24/23
Toolsidas Junior	8/31/23
Painkiller: Limited Series: What’s in a Name?	8/27/23
Painkiller: Limited Series: Hot! Hot! Hot!	8/27/23
Painkiller: Limited Series: Is Believed	8/27/23
Painkiller: Limited Series: Blizzard of the Century	8/27/23
Painkiller: Limited Series: Jesus Gave Me Water	8/27/23
Painkiller: Limited Series: The One to Start With, The One to Stay With	8/27/23
1981	8/27/23
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
