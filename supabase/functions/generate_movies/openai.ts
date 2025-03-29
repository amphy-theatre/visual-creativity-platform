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
Blue Box: Chinatsu Senpai	10/9/24
Arrested Development: Season 1: Bringing Up Buster	10/2/24
Arrested Development: Season 1: Top Banana	10/2/24
Arrested Development: Season 1: Pilot	10/2/24
Shameless (U.S.): Season 1: Pilot	10/2/24
Rez Ball	10/2/24
Whiplash	9/27/24
5 Centimeters Per Second	9/7/24
Ford v. Ferrari	9/4/24
The Umbrella Academy: Season 4: The Unbearable Tragedy of Getting What You Want	9/4/24
My Hero Academia: Season 5: The High, Deep Blue Sky	8/30/24
Atlas	6/28/24
Tell Them You Love Me	6/22/24
Jujutsu Kaisen: Ryomen Sukuna	6/22/24
My Hero Academia: Season 3: Unrivaled	4/10/24
My Hero Academia: Season 3: A Season for Encounters	4/10/24
My Hero Academia: Season 3: Deku vs. Kacchan, Part 2	4/10/24
My Hero Academia: Season 3: A Talk about Your Quirk	4/10/24
My Hero Academia: Season 3: What's the Big Idea?	4/9/24
My Hero Academia: Season 3: The Test	4/9/24
My Hero Academia: Season 3: Create Those Ultimate Moves	4/9/24
My Hero Academia: Season 3: Moving into Dorms	4/9/24
My Hero Academia: Season 3: End of the Beginning, Beginning of the End	4/9/24
My Hero Academia: Season 3: One For All	4/9/24
My Hero Academia: Season 3: Symbol of Peace	4/9/24
My Hero Academia: Season 3: All For One	4/9/24
My Hero Academia: Season 3: From Iida to Midoriya	4/9/24
My Hero Academia: Season 3: What a Twist!	4/8/24
My Hero Academia: Season 3: Roaring Upheaval	4/8/24
My Hero Academia: Season 3: Drive It Home, Iron Fist!!!	4/8/24
My Hero Academia: Season 3: My Hero	4/8/24
My Hero Academia: Season 3: Kota	4/7/24
My Hero Academia: Season 3: Wild, Wild Pussycats	4/7/24
My Hero Academia: Season 3: Game Start	4/7/24
My Hero Academia: Season 2: Encounter	4/6/24
My Hero Academia: Season 2: Katsuki Bakugo: Origin	4/6/24
My Hero Academia: Season 2: Stripping the Varnish	4/6/24
My Hero Academia: Season 2: Yaoyorozu: Rising	4/6/24
My Hero Academia: Season 2: Gear up for Final Exams	4/6/24
My Hero Academia: Season 2: Listen Up!! A Tale from the Past	4/5/24
My Hero Academia: Season 2: Everyone's Internships	4/5/24
My Hero Academia: Season 2: The Aftermath of Hero Killer: Stain	4/5/24
My Hero Academia: Season 2: Climax	4/5/24
My Hero Academia: Season 2: Hero Killer: Stain vs U.A. Students	4/5/24
My Hero Academia: Season 2: Midoriya and Shigaraki	4/5/24
My Hero Academia: Season 2: Bizarre! Gran Torino Appears	4/5/24
My Hero Academia: Season 2: Time to Pick Some Names	4/5/24
My Hero Academia: Season 2: Todoroki vs. Bakugo	4/5/24
My Hero Academia: Season 2: Fight on, Iida	4/3/24
My Hero Academia: Season 2: Shoto Todoroki: Origin	4/3/24
My Hero Academia: Season 2: Bakugo vs. Uraraka	4/3/24
My Hero Academia: Season 2: Battle on, Challengers!	4/3/24
My Hero Academia: Season 2: Victory or Defeat	4/3/24
My Hero Academia: Season 2: The Boy Born with Everything	4/3/24
My Hero Academia: Season 2: Cavalry Battle Finale	4/2/24
My Hero Academia: Season 2: Strategy, Strategy, Strategy	4/2/24
My Hero Academia: Season 2: In Their Own Quirky Ways	4/2/24
My Hero Academia: Season 2: Roaring Sports Festival	4/2/24
My Hero Academia: Season 2: That's the Idea, Ochaco	4/2/24
My Hero Academia: Season 1: In Each of our Hearts	4/1/24
My Hero Academia: Season 1: All Might	4/1/24
My Hero Academia: Season 1: Game Over	4/1/24
My Hero Academia: Season 1: Encounter with the Unknown	4/1/24
My Hero Academia: Season 1: Yeah, Just Do Your Best, Iida!	3/31/24
My Hero Academia: Season 1: Bakugo's Start Line	3/31/24
My Hero Academia: Season 1: Deku vs. Kacchan	3/31/24
My Hero Academia: Season 1: Rage, You Damned Nerd	3/31/24
My Hero Academia: Season 1: What I Can Do For Now	3/31/24
My Hero Academia: Season 1: Start Line	3/31/24
My Hero Academia: Season 1: Roaring Muscles	3/31/24
My Hero Academia: Season 1: What It Takes to Be a Hero	3/31/24
My Hero Academia: Season 1: Izuku Midoriya: Origin	3/31/24
Yizo Yizo: Season 1: Episode 5	3/20/24
Yizo Yizo: Season 1: Episode 4	3/20/24
Yizo Yizo: Season 1: Episode 3	3/17/24
Yizo Yizo: Season 1: Episode 2	3/17/24
Yizo Yizo: Season 1: Episode 1	3/17/24
Avatar The Last Airbender: Legends	3/10/24
Avatar The Last Airbender: The North	3/9/24
Avatar The Last Airbender: Masks	3/9/24
Avatar The Last Airbender: Spirited Away	3/9/24
Avatar The Last Airbender: Into the Dark	3/2/24
Avatar The Last Airbender: Aang	3/2/24
The End of the F***ing World: Season 1: Episode 7	2/28/24
The End of the F***ing World: Season 1: Episode 6	2/28/24
The End of the F***ing World: Season 1: Episode 5	2/28/24
The End of the F***ing World: Season 1: Episode 4	2/28/24
BLUE EYE SAMURAI: The Tale of the Ronin and the Bride	2/2/24
BLUE EYE SAMURAI: Peculiarities	2/2/24
BLUE EYE SAMURAI: A Fixed Number of Paths	2/2/24
BLUE EYE SAMURAI: An Unexpected Element	2/1/24
BLUE EYE SAMURAI: Hammerscale	2/1/24
Zom 100: Bucket List of the Dead: Hometown of the Dead III	1/20/24
Zom 100: Bucket List of the Dead: Hometown of the Dead II	1/16/24
 : Episode 6	1/6/24
 : Episode 5	1/5/24
 : Episode 4	1/5/24
 : Episode 3	1/5/24
 : Episode 2	1/4/24
 : Episode 1	1/4/24
Haikyu!!: Haikyu!! TO THE TOP: Broken Heart	1/1/24
SPY x FAMILY: Season 2: Berlint in Love / Nightfall's Daily Life	12/29/23
SPY x FAMILY: Season 2: Part of the Family	12/29/23
SPY x FAMILY: Season 2: Enjoy the Resort to the Fullest / Bragging About Vacation	12/29/23
Trevor Noah: Where Was I	12/29/23
SPY x FAMILY: Season 1: Operation Strix	12/25/23
Johnny English Reborn	12/21/23
	12/20/23
Molly's Game	12/11/23
Bill Russell: Legend: Part 2	12/8/23
Bill Russell: Legend: Part 1	12/6/23
Greater	12/4/23
The Tom and Jerry Show: Cat Napped / Black Cat	12/4/23
The Nice Guys	12/3/23
Scott Pilgrim Takes Off: The World Vs Scott Pilgrim	12/1/23
Scott Pilgrim Takes Off: 2 Scott 2 Pilgrim	12/1/23
Scott Pilgrim Takes Off: WHODIDIT	12/1/23
Violet Evergarden: Episode 7	11/8/23
Violet Evergarden: Episode 6	11/7/23
Violet Evergarden: Episode 5	11/7/23
Violet Evergarden: Episode 4	11/6/23
Violet Evergarden: Episode 3	11/6/23
Violet Evergarden: Episode 2	11/6/23
Violet Evergarden: Episode 1	11/6/23
PLUTO: Episode 1	11/3/23
The Tom and Jerry Show: Pipeline / No Brain, No Gain	11/3/23
Kung Fu Hustle	10/26/23
GOOD NIGHT WORLD: LOG IN	10/26/23
Black Mirror: Season 4: Crocodile	10/26/23
Black Mirror: Season 4: Metalhead	10/16/23
Black Mirror: Season 6: Demon 79	10/16/23
Black Mirror: Season 4: Arkangel	10/15/23
Black Mirror: Season 6: Mazey Day	10/15/23
Black Mirror: Season 6: Beyond the Sea	10/13/23
Black Mirror: Season 6: Loch Henry	10/13/23
Black Mirror: Season 6: Joan Is Awful	10/13/23
The Wolf of Wall Street	10/2/23
Scissor Seven: Season 4: Green Phoenix's Revenge	9/30/23
Scissor Seven: Season 4: Showdown on the Chicken Island	9/30/23
Scissor Seven: Season 4: The Decision	9/30/23
Scissor Seven: Season 4: Red Tooth's Past	9/30/23
Scissor Seven: Season 4: Huilian's Past	9/30/23
Scissor Seven: Season 4: Crisis on the Island 2	9/28/23
Scissor Seven: Season 4: Overnight at the Store	9/28/23
Scissor Seven: Season 4: Saving Seven	9/28/23
My Happy Marriage: Season 1: Light in the Darkness	9/28/23
Scissor Seven: Season 4: Assassinating the Leader	9/28/23
Scissor Seven: Season 4: The Immortal Black Bird	9/28/23
Scissor Seven: Season 3: Who Is the One You Want to Protect	9/28/23
Scissor Seven: Season 3: Memories that You Don't Want to Forget Even in Pain	9/28/23
Scissor Seven: Season 3: Master Green Phoenix’s Scheme	9/28/23
Scissor Seven: Season 3: Sneaking into Xuanwu Country	9/28/23
Scissor Seven: Season 3: Superpower Country	9/28/23
Scissor Seven: Season 3: Rock Hard Country	9/28/23
Scissor Seven: Season 3: Tenderness of a Tough Man	9/28/23
Scissor Seven: Season 3: Excuse me, is this the Xuanwu Country?	9/28/23
Scissor Seven: Season 3: Dai Bo & Seven	9/28/23
Scissor Seven: Season 3: Farewell	9/28/23
Scissor Seven: Season 2: Fate	9/27/23
Scissor Seven: Season 2: Redtooth	9/27/23
Scissor Seven: Season 2: Two Heroes	9/27/23
Scissor Seven: Season 2: Plum Blossom Eleven	9/27/23
Scissor Seven: Season 2: Revenge of King Pheasant	9/27/23
Scissor Seven: Season 2: Again, We Meet Captain Jack	9/27/23
Scissor Seven: Season 2: The Stan Trip	9/27/23
Scissor Seven: Season 2: Protecting Mad Bark	9/27/23
Scissor Seven: Season 2: Thirteen vs Seven	9/26/23
Scissor Seven: Season 2: Super Scissors	9/26/23
Scissor Seven: Season 1: King of Chicken (Part III)	9/26/23
Scissor Seven: Season 1: King of Chicken (Part II)	9/26/23
Scissor Seven: Season 1: King of Chicken (Part I)	9/26/23
Scissor Seven: Season 1: Thirteen	9/26/23
Scissor Seven: Season 1: Thousand Demon Daggers	9/26/23
Scissor Seven: Season 1: Crisis on the Island	9/26/23
Scissor Seven: Season 1: Bodyguard Dachun	9/26/23
Scissor Seven: Season 1: Assassinating Captain Jack	9/26/23
Scissor Seven: Season 1: Assassinating a pretty girl	9/26/23
Scissor Seven: Season 1: Assassinating a Domineering Grannie	9/26/23
Scissor Seven: Season 1: Assassinating underpantsman	9/26/23
Black Mirror: Season 4: Hang the DJ	9/25/23
Black Mirror: Season 3: Playtest	9/25/23
Black Mirror: Season 3: Nosedive	9/25/23
Black Mirror: Season 2: Be Right Back	9/25/23
Zom 100: Bucket List of the Dead: Treehouse of the Dead	9/25/23
ONE PIECE: Sky Island: Skypiea: Episode 162	9/25/23
Black Mirror: Season 2: The Waldo Moment	9/24/23
Black Mirror: Season 4: USS Callister	9/22/23
Black Mirror: Season 3: Men Against Fire	9/22/23
Black Mirror: Season 3: San Junipero	9/22/23
Black Mirror: Season 5: Striking Vipers	9/21/23
Black Mirror: Season 2: White Christmas	9/20/23
ONE PIECE: Sky Island: Skypiea: Episode 161	9/20/23
Zom 100: Bucket List of the Dead: Sushi & Hot Springs of the Dead	9/20/23
Black Mirror: Season 1: The Entire History of You	9/17/23
Black Mirror: Season 1: Fifteen Million Merits	9/17/23
ONE PIECE: THE CHEF AND THE CHORE BOY	9/17/23
My Happy Marriage: Season 1: My Mother’s Legacy	9/17/23
ONE PIECE: EAT AT BARATIE!	9/16/23
ONE PIECE: THE PIRATES ARE COMING	9/16/23
ONE PIECE: TELL NO TALES	9/16/23
ONE PIECE: THE MAN IN THE STRAW HAT	9/16/23
ONE PIECE: ROMANCE DAWN	9/14/23
From Me to You: Kimi ni Todoke: Prologue	9/11/23
My Happy Marriage: Season 1: Summer Cherry Blossoms, and the Mistake	9/9/23
Zom 100: Bucket List of the Dead: Truck Stop of the Dead	9/6/23
Can You See Us?	8/31/23
My Happy Marriage: Season 1: Drowning in Dreams	8/31/23
The Witcher: Season 1: The End’s Beginning	8/30/23
When They See Us: Limited Series: Part One	8/29/23
Zom 100: Bucket List of the Dead: RV of the Dead	8/28/23
Black Mirror: Season 1: The National Anthem	8/28/23
Physical: 100: Season 1: The Pecking Order	8/27/23
JoJo's Bizarre Adventure: STONE OCEAN: Ultra Security House Unit	8/27/23
My Happy Marriage: Season 1: Nightmares and Ominous Shadows	8/25/23
My Happy Marriage: Season 1: Glamorous Lady of Summer	8/17/23
Zom 100: Bucket List of the Dead: Hero of the Dead	8/16/23
My Happy Marriage: Season 1: Determination and Thunder	8/10/23
My Happy Marriage: Season 1: Ripples	8/2/23
Zom 100: Bucket List of the Dead: Flight Attendant of the Dead	7/31/23
My Happy Marriage: Season 1: The Gift	7/26/23
Zom 100: Bucket List of the Dead: Best Friend of the Dead	7/25/23
My Happy Marriage: Season 1: Our First Date	7/20/23
My Happy Marriage: Season 1: About My Husband-to-Be	7/17/23
My Happy Marriage: Season 1: The Meeting	7/17/23
Zom 100: Bucket List of the Dead: Bucket List of the Dead	7/16/23
Zom 100: Bucket List of the Dead: Akira of the Dead	7/14/23
VINLAND SAGA: Season 2: Hometown	6/21/23
VINLAND SAGA: Season 2: Two Paths	6/15/23
VINLAND SAGA: Season 2: Emperor of Rebellion	6/6/23
VINLAND SAGA: Season 2: Courage	6/1/23
VINLAND SAGA: Season 2: Pain	5/24/23
Untold: Operation Flagrant Foul	5/15/23
VINLAND SAGA: Season 2: War at Ketil's Farm	5/15/23
Boogie	5/15/23
Justice League: Season 1: Secret Origins: Part 2	5/15/23
Justice League: Season 1: Secret Origins: Part 1	5/15/23
VINLAND SAGA: Season 2: The First Measure	5/8/23
VINLAND SAGA: Season 2: Way Home	5/8/23
VINLAND SAGA: Season 2: Cause	5/8/23
VINLAND SAGA: Season 2: Storm	4/19/23
VINLAND SAGA: Season 2: Freedom	4/13/23
Two Distant Strangers	4/7/23
Initial D	4/7/23
VINLAND SAGA: Season 2: Dark Clouds	4/4/23
VINLAND SAGA: Season 2: For The Love That Was Lost	3/28/23
VINLAND SAGA: Season 2: The King and the Sword	3/22/23
Community: Season 6: Basic Crisis Room Decorum	3/15/23
VINLAND SAGA: Season 2: Cursed Head	3/15/23
VINLAND SAGA: Season 2: Oath	3/10/23
VINLAND SAGA: Season 2: An Empty Man	3/10/23
About Time	3/3/23
Lookism: Wall	3/1/23
Lookism: Special Training	3/1/23
Lookism: Recommendation	3/1/23
Lookism: Kindness	3/1/23
Lookism: Mom	3/1/23
Lookism: Friends	3/1/23
Lookism: New Life	3/1/23
Lookism: Change	3/1/23
Neon Genesis Evangelion: The Beast That Shouted 'I' at the Heart of the World	3/1/23
Formula 1: Drive to Survive: Season 5: Bounce Back	3/1/23
Formula 1: Drive to Survive: Season 5: The New Dawn	2/24/23
VINLAND SAGA: Season 2: Iron Fist Ketil	2/24/23
VINLAND SAGA: Season 2: I Want a Horse	2/24/23
VINLAND SAGA: Season 2: The Path of Blood	2/24/23
VINLAND SAGA: Season 2: Awakening	2/24/23
VINLAND SAGA: Season 2: Snake	2/24/23
VINLAND SAGA: Season 2: Ketil's Farm	2/24/23
VINLAND SAGA: Season 2: Slave	2/24/23
VINLAND SAGA: Season 1: Episode 24	2/23/23
VINLAND SAGA: Season 1: Episode 23	2/23/23
VINLAND SAGA: Season 1: Episode 22	2/23/23
VINLAND SAGA: Season 1: Episode 21	2/23/23
VINLAND SAGA: Season 1: Episode 20	2/23/23
VINLAND SAGA: Season 1: Episode 19	2/23/23
VINLAND SAGA: Season 1: Episode 18	2/23/23
VINLAND SAGA: Season 1: Episode 17	2/23/23
VINLAND SAGA: Season 1: Episode 16	2/23/23
VINLAND SAGA: Season 1: Episode 15	2/23/23
VINLAND SAGA: Season 1: Episode 14	2/23/23
VINLAND SAGA: Season 1: Episode 13	2/23/23
VINLAND SAGA: Season 1: Episode 12	2/23/23
VINLAND SAGA: Season 1: Episode 11	2/23/23
VINLAND SAGA: Season 1: Episode 10	2/23/23
VINLAND SAGA: Season 1: Episode 9	2/22/23
VINLAND SAGA: Season 1: Episode 8	2/22/23
VINLAND SAGA: Season 1: Episode 7	2/22/23
VINLAND SAGA: Season 1: Episode 6	2/22/23
VINLAND SAGA: Season 1: Episode 5	2/22/23
VINLAND SAGA: Season 1: Episode 4	2/22/23
Eat the Rich: The GameStop Saga: Limited Series: I Like The Stock	1/21/23
Glass Onion: A Knives Out Mystery	12/28/22
The End of the F***ing World: Season 1: Episode 2	11/25/22
The End of the F***ing World: Season 1: Episode 1	11/25/22
How to Sell Drugs Online (Fast): Season 1: Nerd Today, Boss Tomorrow	11/25/22
Extraordinary Attorney Woo: Extraordinary Attorney Woo	11/25/22
Ozark: Season 2: Reparations	11/22/22
Ozark: Season 1: The Toll	11/21/22
Ozark: Season 1: Coffee, Black	11/21/22
Ozark: Season 1: Kaleidoscope	11/21/22
Ozark: Season 1: Nest Box	11/21/22
Ozark: Season 1: My Dripping Sleep	11/21/22
Ozark: Season 1: Blue Cat	11/21/22
Ozark: Season 1: Ruling Days	11/20/22
Ozark: Season 1: Tonight We Improvise	11/20/22
Ozark: Season 1: Sugarwood	11/19/22
1899: The Ship	11/19/22
Uncle from Another World: Guardian Heroes Shoulda Been Number One!	11/19/22
Uncle from Another World: I'm Finally Back From the Fantasy World of Granbahamal After 17 Long Years!	11/19/22
Young Sheldon: Season 5: A Pink Cadillac and a Glorious Tribal Dance	11/18/22
All Quiet on the Western Front	11/18/22
Young Sheldon: Season 5: A Lock-In, a Weather Girl and a Disgusting Habit	11/14/22
Young Sheldon: Season 5: An Expensive Glitch and a Goof-Off Room	11/14/22
Young Sheldon: Season 5: The Yips and an Oddly Hypnotic Bohemian	11/14/22
Young Sheldon: Season 5: The Grand Chancellor and a Den of Sin	11/13/22
Young Sheldon: Season 5: An Introduction to Engineering and a Glob of Hair Gel	11/13/22
Young Sheldon: Season 5: Money Laundering and a Cascade of Hormones	11/13/22
Young Sheldon: Season 5: Stuffed Animals and a Sweet Southern Syzygy	11/12/22
Triviaverse	11/11/22
Enola Holmes 2	11/9/22
Romantic Killer: Why Is there So Much Legalese in Magic!?	11/4/22
Kuroko's Basketball: Last Game	10/24/22
Kuroko's Basketball: Season 3: It is the Best Present	10/24/22
Kuroko's Basketball: Season 3: Many Times Over	10/23/22
Cyberpunk: Edgerunners: Stronger	10/23/22
Cyberpunk: Edgerunners: Girl on Fire	10/23/22
Kuroko's Basketball: Season 3: So It Was You	10/22/22
Kuroko's Basketball: Season 3: Why don't we give up	10/22/22
Kuroko's Basketball: Season 3: A Warning	10/22/22
Kuroko's Basketball: Season 3: In my own way, I'm desperate	10/22/22
Kuroko's Basketball: Season 3: Weight of Resolve	10/22/22
Kuroko's Basketball: Season 3: A miracle will not happen	10/22/22
Kuroko's Basketball: Season 3: Isn't it the Best	10/22/22
Kuroko's Basketball: Season 3: Final Tip-off	10/22/22
Kuroko's Basketball: Season 3: What is Victory	10/22/22
Kuroko's Basketball: Season 3: We No Longer	10/22/22
Kuroko's Basketball: Season 3: ....Sorry	10/22/22
Cyberpunk: Edgerunners: All Eyez On Me	10/22/22
Cyberpunk: Edgerunners: Smooth Criminal	10/22/22
Cyberpunk: Edgerunners: Like A Boy	10/22/22
Kuroko's Basketball: Season 3: A Day with Blue Skies	10/21/22
Kuroko's Basketball: Season 3: He is the Best Player	10/21/22
Kuroko's Basketball: Season 3: This Time, For Sure	10/21/22
Kuroko's Basketball: Season 3: In Order to Win	10/21/22
Kuroko's Basketball: Season 3: Don't Belittle Us!!	10/21/22
Kuroko's Basketball: Season 3: True Light	10/20/22
Kuroko's Basketball: Season 3: It Makes Me Laugh	10/20/22
Kuroko's Basketball: Season 3: I Will Offer Them	10/18/22
Kuroko's Basketball: Season 3: I Know None of That	10/18/22
Kuroko's Basketball: Season 3: I'll Take This For Now	10/18/22
Kuroko's Basketball: Season 3: Don't You Get In My Way	10/17/22
Kuroko's Basketball: Season 3: This Is Mine	10/17/22
Kuroko's Basketball: Season 3: I'm Just Going at Full Strength	10/17/22
Kuroko's Basketball: Season 2: Episode 50	10/17/22
Kuroko's Basketball: Season 2: Episode 49	10/17/22
Kuroko's Basketball: Season 2: Episode 48	10/17/22
Kuroko's Basketball: Season 2: Episode 47	10/16/22
Kuroko's Basketball: Season 2: Episode 46	10/16/22
Kuroko's Basketball: Season 2: Episode 45	10/16/22
Kuroko's Basketball: Season 2: Episode 44	10/15/22
Kuroko's Basketball: Season 2: Episode 43	10/15/22
Kuroko's Basketball: Season 2: Episode 42	10/15/22
Kuroko's Basketball: Season 2: Would You Mind Doing That Once More	10/15/22
Kuroko's Basketball: Season 2: Episode 41	10/15/22
Kuroko's Basketball: Season 2: Episode 40	10/15/22
Kuroko's Basketball: Season 2: Episode 39	10/15/22
Kuroko's Basketball: Season 2: Episode 38	10/15/22
Kuroko's Basketball: Season 2: Episode 37	10/15/22
Kuroko's Basketball: Season 2: Episode 36	10/15/22
Kuroko's Basketball: Season 2: Episode 35	10/15/22
Kuroko's Basketball: Season 2: Episode 34	10/15/22
Kuroko's Basketball: Season 2: Episode 33	10/15/22
Kuroko's Basketball: Season 2: Episode 32	10/15/22
Kuroko's Basketball: Season 2: Episode 31	10/15/22
Kuroko's Basketball: Season 2: Episode 30	10/15/22
Kuroko's Basketball: Season 2: Episode 29	10/14/22
Kuroko's Basketball: Season 2: Episode 28	10/14/22
Kuroko's Basketball: Season 2: Episode 27	10/14/22
Kuroko's Basketball: Season 2: Episode 26	10/14/22
Kuroko's Basketball: Season 1: Episode 25	10/14/22
Kuroko's Basketball: Season 1: Episode 24	10/14/22
Kuroko's Basketball: Season 1: Episode 23	10/14/22
Kuroko's Basketball: Season 1: Kuroko's Basketball: Tip Off	10/14/22
Kuroko's Basketball: Season 1: Episode 22	10/14/22
Kuroko's Basketball: Season 1: Episode 21	10/13/22
Kuroko's Basketball: Season 1: Episode 20	10/13/22
Kuroko's Basketball: Season 1: Episode 19	10/13/22
Kuroko's Basketball: Season 1: Episode 18	10/13/22
Kuroko's Basketball: Season 1: Episode 17	10/13/22
Kuroko's Basketball: Season 1: Episode 16	10/13/22
Kuroko's Basketball: Season 1: Episode 15	10/13/22
Kuroko's Basketball: Season 1: Episode 14	10/13/22
Kuroko's Basketball: Season 1: Episode 13	10/13/22
Kuroko's Basketball: Season 1: Episode 12	10/12/22
Kuroko's Basketball: Season 1: Episode 11	10/12/22
Kuroko's Basketball: Season 1: Episode 10	10/12/22
Kuroko's Basketball: Season 1: Episode 9	10/11/22
Kuroko's Basketball: Season 1: Episode 8	10/10/22
Kuroko's Basketball: Season 1: Episode 7	10/10/22
Kuroko's Basketball: Season 1: Episode 6	10/10/22
The Redeem Team	10/8/22
Kuroko's Basketball: Season 1: Episode 5	10/7/22
Kuroko's Basketball: Season 1: Episode 4	10/7/22
Kuroko's Basketball: Season 1: Episode 3	10/7/22
Kuroko's Basketball: Season 1: Episode 2	10/6/22
Kuroko's Basketball: Season 1: Episode 1	10/6/22
Rascal Does Not Dream of Bunny Girl Senpai: The Dawn After an Endless Night	10/5/22
Rascal Does Not Dream of Bunny Girl Senpai: Life in a Never-Ending Dream	10/5/22
Rascal Does Not Dream of Bunny Girl Senpai: The Kaede Quest	10/5/22
Rascal Does Not Dream of Bunny Girl Senpai: Complex Congratulations	10/5/22
Rascal Does Not Dream of Bunny Girl Senpai: A World Without You	10/5/22
Rascal Does Not Dream of Bunny Girl Senpai: On First Dates, Trouble Is Essential	9/29/22
Rascal Does Not Dream of Bunny Girl Senpai: My Senpai is a Bunny Girl	9/29/22
Young Sheldon: Season 5: Pish Posh and a Secret Back Room	9/27/22
Young Sheldon: Season 5: Potential Energy and Hooch on a Park Bench	9/27/22
Young Sheldon: Season 5: Snoopin' Around and the Wonder Twins of Atheism	9/27/22
Cyberpunk: Edgerunners: Let You Down	9/22/22
JoJo's Bizarre Adventure: STONE OCEAN: Smack of Love and Revenge (2)	9/20/22
Young Sheldon: Season 5: One Bad Night and Chaos of Selfish Desires	9/18/22
JoJo's Bizarre Adventure: STONE OCEAN: Smack of Love and Revenge (1)	9/17/22
JoJo's Bizarre Adventure: STONE OCEAN: Torrential Downpour Warning	9/17/22
Cobra Kai: Season 5: Head of the Snake	9/15/22
Cobra Kai: Season 5: Survivors	9/15/22
Cobra Kai: Season 5: Taikai	9/15/22
Cobra Kai: Season 5: Bad Eggs	9/15/22
Cobra Kai: Season 5: Ouroboros	9/15/22
Cobra Kai: Season 5: Extreme Measures	9/15/22
Cobra Kai: Season 5: Playing With Fire	9/15/22
Cobra Kai: Season 5: Downward Spiral	9/15/22
Cobra Kai: Season 5: Molé	9/15/22
Cobra Kai: Season 5: Long, Long Way From Home	9/12/22
Thus Spoke Kishibe Rohan: Season 1: At a Confessional	9/12/22
VINLAND SAGA: Season 1: Episode 3	9/10/22
VINLAND SAGA: Season 1: Episode 2	9/10/22
VINLAND SAGA: Season 1: Episode 1	9/10/22
Untold: The Rise and Fall of AND1	9/3/22
Breaking Bad: Season 1: Pilot	9/3/22
Brooklyn Nine-Nine: Season 7: Manhunter	9/3/22
JoJo's Bizarre Adventure: STONE OCEAN: Operation Savage Guardian (Head to the Courtyard!) (2)	9/2/22
JoJo's Bizarre Adventure: STONE OCEAN: Operation Savage Guardian (Head to the Courtyard!) (1)	9/2/22
JoJo's Bizarre Adventure: STONE OCEAN: Debt Collector Mary Lynn Manson	9/2/22
JoJo's Bizarre Adventure: STONE OCEAN: F.F.	9/2/22
JoJo's Bizarre Adventure: STONE OCEAN: There’s Six of Us!	9/2/22
JoJo's Bizarre Adventure: STONE OCEAN: Ermes’s Stickers	9/2/22
JoJo's Bizarre Adventure: STONE OCEAN: Prisoner of Love	9/2/22
JoJo's Bizarre Adventure: STONE OCEAN: The Visitor (2)	9/1/22
JoJo's Bizarre Adventure: STONE OCEAN: The Visitor (1)	8/31/22
JoJo's Bizarre Adventure: STONE OCEAN: Prisoner FE40536: Jolyne Cujoh	8/31/22
JoJo's Bizarre Adventure: STONE OCEAN: Stone Ocean	8/31/22
JoJo's Bizarre Adventure: Golden Wind: The Sleep Slave	8/31/22
JoJo's Bizarre Adventure: Golden Wind: Golden Wind Requiem	8/31/22
JoJo's Bizarre Adventure: Golden Wind: King of Kings	8/31/22
JoJo's Bizarre Adventure: Golden Wind: Diavolo Surfaces	8/31/22
JoJo's Bizarre Adventure: Golden Wind: The Requiem Quietly Plays Part 2	8/30/22
JoJo's Bizarre Adventure: Golden Wind: The Requiem Quietly Plays Part 1	8/30/22
JoJo's Bizarre Adventure: Golden Wind: His Name Is Diavolo	8/29/22
JoJo's Bizarre Adventure: Golden Wind: Green Tea and Sanctuary Part 3	8/29/22
JoJo's Bizarre Adventure: Golden Wind: Green Tea and Sanctuary Part 2	8/29/22
JoJo's Bizarre Adventure: Golden Wind: Babyhead	8/29/22
JoJo's Bizarre Adventure: Golden Wind: Green Tea and Sanctuary Part 1	8/29/22
JoJo's Bizarre Adventure: Golden Wind: Get to the Collessium in Rome!	8/28/22
JoJo's Bizarre Adventure: Golden Wind: Under a Sky That Could Come Falling at Any Moment	8/28/22
JoJo's Bizarre Adventure: Golden Wind: Emperor Crimson vs. Metallic	8/28/22
JoJo's Bizarre Adventure: Golden Wind: A Little Story From the Past ~My Name Is Doppio~	8/25/22
JoJo's Bizarre Adventure: Golden Wind: Spicy Lady	8/25/22
JoJo's Bizarre Adventure: Golden Wind: Notorious Chase	8/25/22
Grown Ups	8/22/22
JoJo's Bizarre Adventure: Golden Wind: Crush and Talking Mouth	8/20/22
The Sandman: Sleep of the Just	8/19/22
JoJo's Bizarre Adventure: Golden Wind: The G in Guts	8/19/22
JoJo's Bizarre Adventure: Golden Wind: The Mystery of Emperor Crimson	8/19/22
JoJo's Bizarre Adventure: Golden Wind: The Final Mission From the Boss	8/19/22
JoJo's Bizarre Adventure: Golden Wind: White Ice	8/19/22
JoJo's Bizarre Adventure: Golden Wind: Head to Venice!	8/19/22
JoJo's Bizarre Adventure: Golden Wind: Thankful Death Part 2	8/18/22
JoJo's Bizarre Adventure: Golden Wind: Thankful Death Part 1	8/18/22
JoJo's Bizarre Adventure: Golden Wind: Express Train to Florence	8/18/22
JoJo's Bizarre Adventure: Golden Wind: Mirror Man and Purple Smoke	8/18/22
JoJo's Bizarre Adventure: Golden Wind: The Second Mission From the Boss	8/16/22
JoJo's Bizarre Adventure: Golden Wind: Narancia's Li'l Bomber	8/16/22
JoJo's Bizarre Adventure: Golden Wind: Hitman Team	8/16/22
JoJo's Bizarre Adventure: Golden Wind: The First Mission From the Boss	8/14/22
JoJo's Bizarre Adventure: Golden Wind: Six Bullets Appears Part 2	8/10/22
JoJo's Bizarre Adventure: Golden Wind: Six Bullets Appears Part 1	8/10/22
JoJo's Bizarre Adventure: Golden Wind: Moody Jazz's Counterattack	8/10/22
JoJo's Bizarre Adventure: Golden Wind: Find Polpo's Fortune!	8/10/22
JoJo's Bizarre Adventure: Golden Wind: Gang Initiation	8/8/22
JoJo's Bizarre Adventure: Golden Wind: Meet the Gangster Behind the Wall	8/8/22
JoJo's Bizarre Adventure: Golden Wind: Bucciarati Is Coming	8/8/22
JoJo's Bizarre Adventure: Golden Wind: Golden Wind	8/6/22
Basketball or Nothing: Limited Series: Getting Defensive	8/3/22
Thunderstruck	8/3/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Goodbye, Morioh – The Heart of Gold	8/2/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Shining D (Diamond) is Unbreakable, Part 2	8/2/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Shining D (Diamond) is Unbreakable, Part 1	8/2/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Bites the Dust, Part 2	8/1/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Bites the Dust, Part 1	8/1/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: July 15th (Thurs), Part 4	8/1/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: July 15th (Thurs), Part 3	8/1/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: July 15th (Thurs), Part 2	8/1/22
Basketball or Nothing: Limited Series: Rezball	8/1/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: July 15th (Thurs), Part 1	7/30/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Cats Love Yoshikage Kira	7/29/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Highway Go Go, Part 2	7/29/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Highway Go Go, Part 1	7/29/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: I'm an Alien	7/29/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Janken Boy is Coming!	7/28/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Heart Father	7/28/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Heart Attack, Part 2	7/27/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Heart Attack, Part 1	7/27/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Yoshikage Kira Just Wants to Live Quietly, Part 2	7/27/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Yoshikage Kira Just Wants to Live Quietly, Part 1	7/27/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Yukako Yamagishi Dreams of Cinderella	7/27/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Shigechi's Harvest, Part 2	7/27/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Shigechi's Harvest, Part 1	7/27/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Rohan Kishibe's Adventure	7/27/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Let's Go Hunting!	7/27/22
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Let's Go to the Manga Artist's House, Part 2	7/26/22
Young Sheldon: Season 4: The Wild and Woolly World of Nonlinear Dynamics	7/23/22
Young Sheldon: Season 4: A Black Hole	7/23/22
Young Sheldon: Season 4: A Second Prodigy and the Hottest Tips for Pouty Lips	7/22/22
Young Sheldon: Season 4: A Virus, Heartbreak and a World of Possibilities	7/22/22
Young Sheldon: Season 4: Mitch's Son and the Unconditional Approval of a Government Agency	7/22/22
Young Sheldon: Season 4: The Geezer Bus and a New Model For Education	7/22/22
Young Sheldon: Season 4: A Box of Treasure and the Meemaw of Science	7/22/22
Cowboy Bebop: Gateway Shuffle	7/22/22
Cowboy Bebop: Honky Tonk Women	7/22/22
Cowboy Bebop: Stray Dog Strut	7/22/22
Young Sheldon: Season 4: A Pager, a Club and a Cranky Bag of Wrinkles	7/21/22
Young Sheldon: Season 4: Cowboy Aerobics and 473 Grease-Free Bolts	7/21/22
Young Sheldon: Season 4: Crappy Frozen Ice Cream and an Organ Grinder's Monkey	7/21/22
Young Sheldon: Season 4: An Existential Crisis and a Bear That Makes Bubbles	7/21/22
Young Sheldon: Season 4: A Philosophy Class and Worms That Can Chase You	7/21/22
Young Sheldon: Season 4: Freshman Orientation and the Invention of the Zipper	7/21/22
Young Sheldon: Season 4: A Musty Crypt and a Stick to Pee On	7/21/22
Young Sheldon: Season 4: Bible Camp and a Chariot of Love	7/21/22
Young Sheldon: Season 4: Training Wheels and an Unleashed Chicken	7/21/22
Song Exploder: Volume 2: Nine Inch Nails - Hurt	7/21/22
Young Sheldon: Season 4: A Docent, a Little Lady and a Bouncer Named Dalton	7/21/22
Young Sheldon: Season 4: Graduation	7/21/22
Young Sheldon: Season 3: A Secret Letter and a Lowly Disc of Processed Meat	7/21/22
Young Sheldon: Season 3: A Baby Tooth and the Egyptian God of Knowledge	7/21/22
Young Sheldon: Season 3: A Pineapple and the Bosom of Male Friendship	7/21/22
Young Sheldon: Season 3: Hobbitses, Physicses and a Ball with Zip	7/21/22
Komi Can't Communicate: It's just White Day. Plus more.	7/20/22
Komi Can't Communicate: It's just ripped tights. Plus more.	7/20/22
Cowboy Bebop: Asteroid Blues	7/14/22
Komi Can't Communicate: It's just Valentine's Day.	7/4/22
Komi Can't Communicate: It's just day 2 of the field trip.	7/4/22
Komi Can't Communicate: It's just the school field trip.	7/4/22
Komi Can't Communicate: It's just a misunderstanding. Plus more.	7/4/22
Komi Can't Communicate: It's just everyone's New Years. Plus more.	7/4/22
Komi Can't Communicate: It's just a snowman. Plus more.	7/4/22
The Umbrella Academy: Season 3: Oblivion	7/3/22
The Umbrella Academy: Season 3: Seven Bells	7/3/22
The Umbrella Academy: Season 3: Wedding at the End of the World	7/3/22
The Umbrella Academy: Season 3: Auf Wiedersehen	7/3/22
The Umbrella Academy: Season 3: Marigold	7/3/22
Komi Can't Communicate: It's just a merry Christmas.	7/2/22
Komi Can't Communicate: It's just a feeling. Plus more.	7/2/22
Komi Can't Communicate: It's just a typhoon. Plus more.	7/2/22
The Umbrella Academy: Season 3: Kindest Cut	7/1/22
The Umbrella Academy: Season 3: Kugelblitz	7/1/22
The Umbrella Academy: Season 3: Pocket Full of Lightning	7/1/22
Komi Can't Communicate: It's just the arrival of winter. Plus more.	6/28/22
The Umbrella Academy: Season 3: World's Biggest Ball of Twine	6/25/22
The Umbrella Academy: Season 3: Meet the Family	6/25/22
Hustle	6/15/22
How to Train Your Dragon	5/24/22
Violet Evergarden the Movie	4/28/22
Kotaro Lives Alone: Episode 2	4/25/22
Kotaro Lives Alone: Episode 1	4/25/22
Better Call Saul: Season 1: Uno	4/22/22
The Office (U.S.): Season 1: Pilot	4/22/22
Space Force: Season 1: THE LAUNCH	4/16/22
Love & Basketball	4/15/22
Trust No One: The Hunt for the Crypto King	4/15/22
Scissor Seven: Season 1: Seven VS Thirteen	4/12/22
Scissor Seven: Season 1: Blind your eyes	4/12/22
Scissor Seven: Season 1: How to get rich	4/12/22
Thermae Romae Novae: Lucius Builds a Spa Town	4/11/22
Thermae Romae Novae: Lucius Builds a Theme Bath	4/11/22
Thermae Romae Novae: Lucius Meets a Fellow Architect in Japan	4/11/22
Thermae Romae Novae: Lucius Learns Bathing Etiquette in Japan	4/11/22
Thermae Romae Novae: Lucius appears on the Tokaido Road in the Edo Period	4/11/22
Thermae Romae Novae: Lucius Builds a Hot Stone Spa	4/8/22
Thermae Romae Novae: Lucius Builds a Bath in Emperor Hadrian's Villa	4/8/22
KENGAN ASHURA: Part l: Super Human	4/6/22
KENGAN ASHURA: Part l: Kengan	4/6/22
Thermae Romae Novae: Lucius Builds an Indoor Bath	4/5/22
Thermae Romae Novae: Lucius Builds an Outdoor Bath	4/4/22
Thermae Romae Novae: The Thermae Architect Who Leapt Through Time	4/4/22
Thermae Romae Novae: All Baths Lead to Rome	4/4/22
Blue Period: When I Started to be Dyed in Color	4/2/22
Blue Period: The Start of the Second Exam	4/2/22
Blue Period: Our Color Blue	4/2/22
Blue Period: Wandering Knife	4/2/22
Blue Period: Brain-Racking	4/1/22
Blue Period: The Start of the First Exam	4/1/22
Blue Period: Serious Mental Breakdown	4/1/22
Blue Period: Helpless Even If I Know What To Do	4/1/22
Blue Period: Where Are We Headed?	3/31/22
Blue Period: Prep School Debut of the Dead	3/31/22
Blue Period: He's Not Tanned At All	3/31/22
Blue Period: Awakening to the Joy of Painting	3/31/22
Kakegurui: Episode 1	3/31/22
Moneyball	3/23/22
Formula 1: Drive to Survive: Season 4: Hard Racing	3/18/22
Formula 1: Drive to Survive: Season 4: Staying Alive	3/18/22
Formula 1: Drive to Survive: Season 4: Clash of the Titans	3/14/22
jeen-yuhs: A Kanye Trilogy: act iii: AWAKENING	3/10/22
Community: Season 6: Lawnmower Maintenance & Postnatal Care	2/28/22
Howl’s Moving Castle	2/26/22
jeen-yuhs: A Kanye Trilogy: act ii: PURPOSE	2/25/22
jeen-yuhs: A Kanye Trilogy: act i: VISION	2/24/22
Community: Season 6: Ladders	2/18/22
Arcane: Season 1: The Base Violence Necessary for Change	2/13/22
Arcane: Season 1: Some Mysteries Are Better Left Unsolved	2/13/22
Community: Season 5: Basic Sandwich	2/9/22
Community: Season 5: Basic Story	2/9/22
Community: Season 5: G.I. Jeff	2/9/22
Community: Season 5: Bondage and Beta Male Sexuality	2/1/22
Kapil Sharma: I'm Not Done Yet	1/30/22
Great Pretender: Season 2: Case 4_2: Wizard of Far East	1/19/22
Great Pretender: Season 2: Case 4_1: Wizard of Far East	1/19/22
Great Pretender: Season 1: Case 3_4: Snow of London	1/16/22
Great Pretender: Season 1: Case 3_3: Snow of London	1/16/22
Great Pretender: Season 1: Case 3_2: Snow of London	1/16/22
Great Pretender: Season 1: Case 3_1: Snow of London	1/16/22
Great Pretender: Season 1: Case 2_5: Singapore Sky	1/15/22
Great Pretender: Season 1: Case 2_4: Singapore Sky	1/15/22
Great Pretender: Season 1: Case 2_3: Singapore Sky	1/15/22
Great Pretender: Season 1: Case 2_2: Singapore Sky	1/7/22
Great Pretender: Season 1: Case 2_1: Singapore Sky	1/7/22
The Way of the Househusband: Season 1: Episode 6	1/5/22
Community: Season 5: Analysis of Cork-Based Networking	1/5/22
Community: Season 5: Geothermal Escapism	1/5/22
Community: Season 5: Cooperative Polygraphy	1/5/22
Community: Season 5: Basic Intergluteal Numismatics	1/3/22
Community: Season 5: Introduction to Teaching	1/3/22
Cobra Kai: Season 4: The Rise	1/3/22
Cobra Kai: Season 4: The Fall	1/3/22
Cobra Kai: Season 4: Party Time	1/3/22
Cobra Kai: Season 4: Minefields	1/3/22
Cobra Kai: Season 4: Kicks Get Chicks	1/3/22
Cobra Kai: Season 4: Match Point	1/3/22
Cobra Kai: Season 4: Bicephaly	1/3/22
Cobra Kai: Season 4: Then Learn Fly	1/3/22
Cobra Kai: Season 4: First Learn Stand	1/2/22
Cobra Kai: Season 4: Let's Begin	1/2/22
Cobra Kai - The Afterparty	1/2/22
Don't Look Up	1/1/22
Great Pretender: Season 1: Case 1_5: Los Angeles Connection	12/27/21
Great Pretender: Season 1: Case 1_4: Los Angeles Connection	12/27/21
Kung Fu Panda 2	12/27/21
Kung Fu Panda	12/27/21
Great Pretender: Season 1: Case 1_3: Los Angeles Connection	12/25/21
Great Pretender: Season 1: Case 1_2: Los Angeles Connection	12/25/21
Great Pretender: Season 1: Case 1_1: Los Angeles Connection	12/25/21
Komi Can't Communicate: It's just sports day. Plus more.	12/24/21
Community: Season 5: Repilot	12/23/21
Community: Season 4: Advanced Introduction to Finality	12/23/21
Community: Season 4: Heroic Origins	12/23/21
Community: Season 4: Basic Human Anatomy	12/23/21
Community: Season 4: Intro to Knots	12/23/21
Community: Season 4: Intro to Felt Surrogacy	12/23/21
Community: Season 4: Herstory of Dance	12/23/21
Komi Can't Communicate: It's just a country kid. Plus more.	12/23/21
Komi Can't Communicate: It's just, I wish I could speak.	12/23/21
Food Wars!: Shokugeki no Soma: An Endless Wasteland	12/21/21
Community: Season 4: Economics of Marine Biology	12/21/21
Community: Season 4: Advanced Documentary Filmmaking	12/18/21
Community: Season 4: Cooperative Escapism in Familial Relations	12/17/21
Untouchable	12/16/21
Super Crooks: Electro Boy	12/12/21
Komi Can't Communicate: It's just Obon. Plus more.	12/9/21
Komi Can't Communicate: It's just the pool. Plus more.	12/3/21
Komi Can't Communicate: It's just a joke. Plus more.	12/2/21
Komi Can't Communicate: It's just my summer uniform. Plus more.	12/2/21
Komi Can't Communicate: It's just a physical. Plus more.	11/30/21
Komi Can't Communicate: It's just stage fright. Plus more.	11/30/21
Arcane: Season 1: Oil and Water	11/29/21
Komi Can't Communicate: It's just a childhood friend. Plus more.	11/29/21
Arcane: Season 1: The Monster You Created	11/26/21
Arcane: Season 1: The Boy Savior	11/26/21
Community: Season 4: Alternative History of the German Invasion	11/26/21
Arcane: Season 1: When These Walls Come Tumbling Down	11/25/21
Arcane: Season 1: Everybody Wants to Be My Enemy	11/25/21
The Hangover: Part II	10/30/21
The Hangover	10/26/21
Spirited Away	10/22/21
Kim's Convenience: Season 5: Parking Pass	10/14/21
Squid Game: Season 1: One Lucky Day	10/10/21
Squid Game: Season 1: Front Man	10/10/21
Squid Game: Season 1: VIPS	10/10/21
Squid Game: Season 1: Gganbu	10/10/21
Squid Game: Season 1: A Fair World	10/9/21
Squid Game: Season 1: Stick to the Team	10/9/21
Squid Game: Season 1: The Man with the Umbrella	10/8/21
Squid Game: Season 1: Hell	10/8/21
Squid Game: Season 1: Red Light, Green Light	10/7/21
Community: Season 4: Conventions of Space and Time	10/2/21
Sex Education: Season 3: Episode 1	9/28/21
Nightcrawler	9/24/21
Schumacher	9/22/21
Dil Chahta Hai	9/18/21
Community: Season 4: Paranormal Parentage	9/14/21
Community: Season 4: History 101	9/9/21
Community: Season 3: Introduction to Finality	9/8/21
Community: Season 3: The First Chang Dynasty	9/8/21
Community: Season 3: Digital Estate Planning	9/8/21
Community: Season 3: Curriculum Unavailable	9/7/21
Community: Season 3: Course Listing Unavailable	9/7/21
Community: Season 3: Origins of Vampire Mythology	9/7/21
Community: Season 3: Pillows and Blankets	9/7/21
Community: Season 3: Digital Exploration of Interior Design	9/7/21
Untold: Malice at the Palace	9/4/21
Community: Season 3: Contemporary Impressionists	9/2/21
Community: Season 3: Urban Matrimony and the Sandwich Arts	9/2/21
Community: Season 3: Regional Holiday Music	9/2/21
Community: Season 3: Foosball and Nocturnal Vigilantism	9/2/21
Community: Season 3: Documentary Filmmaking: Redux	9/2/21
How I Met Your Mother: Pilot	9/2/21
Naruto Shippuden: Season 1: Homecoming	9/2/21
Community: Season 3: Studies in Modern Movement	9/1/21
Dark: Season 1: Secrets	9/1/21
Community: Season 3: Advanced Gay	9/1/21
Community: Season 2: Critical Film Studies	9/1/21
Gurren Lagann: All the Lights in the Sky Are Stars	8/30/21
Gurren Lagann: Let's Go, Comrades	8/30/21
Gurren Lagann: I Accept Your Dying Wish	8/30/21
Gurren Lagann: We Will Never Forget, This Minute and This Second	8/30/21
Gurren Lagann: Let's Go, The Final Battle	8/30/21
Gurren Lagann: This Is My Last Duty	8/30/21
Gurren Lagann: You Must Survive	8/30/21
Gurren Lagann: Oh, God, How Far Will You Test Us?	8/30/21
Gurren Lagann: We Shall Survive by Any Means Necessary	8/30/21
Gurren Lagann: I'll Make You Tell the Truth of the World	8/30/21
Gurren Lagann: You Understand Nothing	8/30/21
Gurren Lagann: Compilation Episode	8/30/21
Gurren Lagann: I'll Head Towards Tomorrow	8/30/21
Gurren Lagann: How Are You, Everyone?	8/30/21
Gurren Lagann: Everybody, Eat to Your Hearts Content	8/30/21
Gurren Lagann: Miss Yoko, I Have Something to Ask You	8/30/21
Gurren Lagann: Simon, Please Remove Your Hand	8/29/21
Gurren Lagann: Who Really Was Your Big Brother?	8/29/21
Gurren Lagann: Just What Is Exactly Human?	8/29/21
Gurren Lagann: Farewell Comrades	8/28/21
Gurren Lagann: You'll Be The One To Do That	8/28/21
Community: Season 2: Custody Law and Eastern European Diplomacy	8/28/21
Community: Season 2: Intro to Political Science	8/28/21
Community: Season 2: Intermediate Documentary Filmmaking	8/28/21
Community: Season 2: Early 21st Century Romanticism	8/27/21
Community: Season 2: Celebrity Pharmacology	8/27/21
Community: Season 2: Asian Population Studies	8/27/21
Gurren Lagann: There are Some Things I Just Have to See!!	8/27/21
Gurren Lagann: I Don't Understand It At All	8/27/21
Gurren Lagann: Does Having So Many Faces Make You Great?	8/27/21
Gurren Lagann: You Two-Faced Son of A Bitch	8/27/21
Gurren Lagann: I Said I'm Gonna Pilot That Thing	8/27/21
Gurren Lagann: Bust Through The Heavens With Your Drill	8/27/21
Community: Season 2: Abed's Uncontrollable Christmas	8/26/21
The End of Evangelion	8/26/21
Neon Genesis Evangelion: The Ending World	8/26/21
Neon Genesis Evangelion: The Last Cometh	8/26/21
Neon Genesis Evangelion: Tears	8/26/21
Neon Genesis Evangelion: Staying Human	8/26/21
Neon Genesis Evangelion: The Birth of Nerv	8/26/21
Neon Genesis Evangelion: Of the Shapes of Hearts and Humans	8/26/21
Neon Genesis Evangelion: A Man’s Battle	8/26/21
Neon Genesis Evangelion: Life and Death Decisions	8/26/21
Neon Genesis Evangelion: The Fourth to be Qualified	8/26/21
Neon Genesis Evangelion: The Sickness unto Death, and Then…	8/26/21
Neon Genesis Evangelion: Lies and Silence	8/26/21
Neon Genesis Evangelion: Seele, the Seat of the Soul	8/25/21
Neon Genesis Evangelion: The Silent Phone	8/25/21
Neon Genesis Evangelion: Unfamiliar Ceilings	8/25/21
Neon Genesis Evangelion: Angel Infiltration	8/25/21
Neon Genesis Evangelion: A Miracle’s Worth	8/25/21
Neon Genesis Evangelion: In the Still Darkness	8/25/21
Community: Season 2: Mixology Certification	8/25/21
Community: Season 2: Conspiracy Theories and Interior Design	8/25/21
Community: Season 2: Cooperative Calligraphy	8/25/21
Community: Season 2: Aerodynamics of Gender	8/25/21
Community: Season 2: Epidemiology	8/25/21
Community: Season 2: Messianic Myths and Ancient Peoples	8/25/21
Community: Season 2: Basic Rocket Science	8/25/21
Community: Season 2: The Psychology of Letting Go	8/25/21
Community: Season 2: Accounting for Lawyers	8/25/21
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Yukako Yamagishi Falls in Love, Part 1	8/24/21
Community: Season 2: Anthropology 101	8/24/21
Community: Pascal's Triangle Revisited	8/24/21
Community: Contemporary American Poultry	8/24/21
Community: The Science of Illusion	8/24/21
Neon Genesis Evangelion: The Magma Diver	8/24/21
Neon Genesis Evangelion: Mind, Matching, Moment	8/24/21
Neon Genesis Evangelion: Asuka Arrives in Japan	8/24/21
Neon Genesis Evangelion: The Works of Man	8/23/21
Neon Genesis Evangelion: Showdown in Tokyo-3	8/23/21
Neon Genesis Evangelion: Rei, Beyond the Heart	8/23/21
Community: Beginner Pottery	8/17/21
Community: Basic Genealogy	8/17/21
Community: Physical Education	8/17/21
Community: Interpretive Dance	8/17/21
Community: Communication Studies	8/15/21
Community: Romantic Expressionism	8/15/21
Dave Chappelle: Sticks & Stones	8/8/21
The Daily Life of the Immortal King: Episode 15	8/1/21
The Daily Life of the Immortal King: Episode 14	8/1/21
The Daily Life of the Immortal King: Episode 13	8/1/21
The Daily Life of the Immortal King: Episode 12	8/1/21
The Daily Life of the Immortal King: Episode 11	8/1/21
The Daily Life of the Immortal King: Episode 10	7/31/21
The Daily Life of the Immortal King: Episode 9	7/31/21
The Daily Life of the Immortal King: Episode 8	7/31/21
The Daily Life of the Immortal King: Episode 7	7/31/21
The Daily Life of the Immortal King: Episode 6	7/31/21
The Daily Life of the Immortal King: Episode 5	7/31/21
The Daily Life of the Immortal King: Episode 4	7/26/21
The Daily Life of the Immortal King: Episode 3	7/26/21
The Daily Life of the Immortal King: Episode 2	7/26/21
The Daily Life of the Immortal King: Episode 1	7/26/21
It Chapter Two	7/13/21
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Toshikazu Hazamada (Show Off)	7/9/21
JoJo's Bizarre Adventure: Diamond Is Unbreakable: Koichi Hirose (Reverb)	7/9/21
Demon Slayer: Kimetsu no Yaiba: Tanjiro Kamado, Unwavering Resolve Arc: Cruelty	7/9/21
JoJo's Bizarre Adventure: Stardust Crusaders: Anubis, Part 2	7/9/21
Kim's Convenience: Season 4: Bon Voyage	6/26/21
Kim's Convenience: Season 4: Knife Strife	6/26/21
Kim's Convenience: Season 4: Birds of a Feather	6/26/21
Kim's Convenience: Season 4: In the Bedroom	6/26/21
Kim's Convenience: Season 4: Which Witch is Which	6/26/21
Lupin: Part 1: Chapter 1	6/17/21
Kim's Convenience: Season 4: Chammo!	5/26/21
Kim's Convenience: Season 4: Beacon of Truth	5/26/21
Kim's Convenience: Season 4: Soccer Dad	5/26/21
Kim's Convenience: Season 4: Thinkin’ ‘bout Inkin’	5/26/21
Kim's Convenience: Season 4: Happy Ummaversary	5/21/21
Kim's Convenience: Season 4: The Help	5/21/21
Kim's Convenience: Season 4: Couch Surfing	5/21/21
Kim's Convenience: Season 4: The Trollop	5/21/21
Kim's Convenience: Season 3: Lord of the Ring	5/21/21
Kim's Convenience: Season 3: Hit 'n' Fun	5/21/21
Kim's Convenience: Season 3: Appanticitis	5/21/21
Kim's Convenience: Season 3: Elephant in the Room	5/14/21
Kim's Convenience: Season 3: Blabber Talker	5/14/21
Kim's Convenience: Season 3: To Him It May Concern	5/13/21
Kim's Convenience: Season 3: Appanoon Delight	5/13/21
Kim's Convenience: Season 3: The Kim Cup	5/13/21
Kim's Convenience: Season 3: Army Spoon	5/13/21
Kim's Convenience: Season 3: Thy Neighbour's Wifi	5/13/21
Kim's Convenience: Season 3: Open Kimunication	5/13/21
Kim's Convenience: Season 3: Cutie Pie	5/12/21
Kim's Convenience: Season 3: New Appa-liance	5/12/21
Kim's Convenience: Season 2: Handy Graduation	5/12/21
Kim's Convenience: Season 2: Appa’s First Text	5/12/21
Kim's Convenience: Season 2: New TV	5/12/21
Kim's Convenience: Season 2: Silent Auction	5/8/21
Kim's Convenience: Season 2: Sneak Attack	5/8/21
Kim's Convenience: Season 2: Resting Place	5/8/21
Kim's Convenience: Season 2: Date Night	5/6/21
Kim's Convenience: Season 2: Cardboard Jung	5/6/21
Kim's Convenience: Season 2: House Guest	5/6/21
Kim's Convenience: Season 2: Business Award	5/6/21
Kim's Convenience: Season 2: Janet’s Roommate	5/6/21
Kim's Convenience: Family Singing Contest	5/5/21
Kim's Convenience: Appa's Lump	5/5/21
Kim's Convenience: Handyman	5/5/21
Kim's Convenience: Janet's New Job	5/5/21
Kim's Convenience: Best Before	5/4/21
Kim's Convenience: Service	5/4/21
Kim's Convenience: Hapkido	5/3/21
Kim's Convenience: Rude Kid	5/3/21
Kim's Convenience: Wingman	5/3/21
Kim's Convenience: Frank & Nayoung	5/3/21
Kim's Convenience: Ddong Chim	5/3/21
Kim's Convenience: Janet's Photos	5/3/21
Kim's Convenience: Gay Discount	5/3/21
Zero: Episode 8	4/28/21
Zero: Episode 7	4/28/21
Zero: Episode 6	4/28/21
Zero: Episode 5	4/28/21
Zero: Episode 4	4/28/21
Zero: Episode 3	4/28/21
Zero: Episode 2	4/28/21
Zero: Episode 1	4/28/21
Jo Koy: Live from Seattle	4/26/21
The Way of the Househusband: Season 1: Episode 1	4/23/21
The Way of the Househusband: Season 1: Episode 5	4/23/21
The Way of the Househusband: Season 1: Episode 4	4/23/21
The Way of the Househusband: Season 1: Episode 3	4/23/21
The Way of the Househusband: Season 1: Episode 2	4/23/21
Space Jam	4/20/21
Last Chance U: Basketball: Season 1: Bound for Promised Land	4/19/21
Last Chance U: Basketball: Season 1: Lifers	4/15/21
Last Chance U: Basketball: Season 1: Get Thee Behind Me	4/14/21
Last Chance U: Basketball: Season 1: Colby Ranch	4/10/21
The Departed	4/7/21
Pulp Fiction	4/4/21
Good Will Hunting	3/28/21
Gladiator	3/28/21
Formula 1: Drive to Survive: Season 2: Lights Out	3/23/21
Formula 1: Drive to Survive: Season 3: Down to the Wire	3/23/21
Formula 1: Drive to Survive: Season 3: Man On Fire	3/22/21
Formula 1: Drive to Survive: Season 3: No Regrets	3/22/21
Formula 1: Drive to Survive: Season 3: Guenther's Choice	3/22/21
Formula 1: Drive to Survive: Season 3: The Comeback Kid	3/22/21
Formula 1: Drive to Survive: Season 3: The End of the Affair	3/22/21
Formula 1: Drive to Survive: Season 3: We Need to Talk About Ferrari	3/21/21
Formula 1: Drive to Survive: Season 3: Nobody's Fool	3/21/21
Enola Holmes	3/20/21
Wonder Park	3/20/21
Jingle Jangle: A Christmas Journey	3/20/21
Formula 1: Drive to Survive: Season 3: Back On Track	3/19/21
Formula 1: Drive to Survive: Season 3: Cash Is King	3/19/21
Formula 1: Drive to Survive: Season 1: The King of Spain	3/19/21
Last Chance U: Basketball: Season 1: In My Father's House	3/19/21
We're the Millers	3/18/21
Last Chance U: Basketball: Season 1: Jenny	3/17/21
Last Chance U: Basketball: Season 1: Hooper	3/16/21
Last Chance U: Basketball: Season 1: The Window	3/16/21
Outside the Wire	3/14/21
The Karate Kid	3/14/21
David Attenborough: A Life on Our Planet	3/12/21
Harold and Kumar Get the Munchies	3/7/21
Lost in Space: Season 1: The Robinsons Were Here	3/7/21
Age of Samurai: Battle for Japan: Limited Series: The Rise of Nobunaga	3/5/21
Tribes of Europa: Chapter 1	2/26/21
ONE PIECE: Alabasta: Episode 130	2/22/21
ONE PIECE: Alabasta: Episode 129	2/22/21
ONE PIECE: Alabasta: Episode 128	2/21/21
ONE PIECE: Alabasta: Episode 127	2/21/21
ONE PIECE: Alabasta: Episode 126	2/21/21
ONE PIECE: Alabasta: Episode 125	2/20/21
ONE PIECE: Alabasta: Episode 124	2/20/21
ONE PIECE: Alabasta: Episode 123	2/19/21
ONE PIECE: Alabasta: Episode 122	2/19/21
ONE PIECE: Alabasta: Episode 121	2/19/21
ONE PIECE: Alabasta: Episode 120	2/19/21
ONE PIECE: Alabasta: Episode 119	2/19/21
ONE PIECE: Alabasta: Episode 118	2/19/21
ONE PIECE: Alabasta: Episode 117	2/19/21
ONE PIECE: Alabasta: Episode 116	2/19/21
ONE PIECE: Alabasta: Episode 115	2/19/21
ONE PIECE: Alabasta: Episode 114	2/18/21
ONE PIECE: Alabasta: Episode 113	2/18/21
ONE PIECE: Alabasta: Episode 112	2/17/21
ONE PIECE: Alabasta: Episode 111	2/17/21
ONE PIECE: Alabasta: Episode 110	2/17/21
ONE PIECE: Alabasta: Episode 109	2/17/21
ONE PIECE: Alabasta: Episode 108	2/17/21
ONE PIECE: Alabasta: Episode 107	2/17/21
ONE PIECE: Alabasta: Episode 106	2/17/21
ONE PIECE: Alabasta: Episode 105	2/17/21
Headspace Guide to Meditation: How to Get Started	2/13/21
Madagascar	2/13/21
Lost in Space: Season 1: Infestation	2/12/21
ONE PIECE: Alabasta: Episode 104	2/11/21
ONE PIECE: Alabasta: Episode 103	2/10/21
ONE PIECE: Alabasta: Episode 102	2/10/21
ONE PIECE: Alabasta: Episode 101	2/10/21
ONE PIECE: Alabasta: Episode 100	2/9/21
ONE PIECE: Alabasta: Episode 99	2/7/21
ONE PIECE: Alabasta: Episode 98	2/7/21
ONE PIECE: Alabasta: Episode 97	2/7/21
ONE PIECE: Alabasta: Episode 96	2/6/21
ONE PIECE: Alabasta: Episode 95	2/6/21
ONE PIECE: Alabasta: Episode 94	2/6/21
ONE PIECE: Alabasta: Episode 93	2/6/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 92	2/5/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 91	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 90	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 89	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 88	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 87	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 86	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 85	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 84	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 83	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 82	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 81	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 80	2/4/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 79	2/4/21
Cobra Kai: Season 3: December 19	2/2/21
Cobra Kai: Season 3: Feel the Night	2/2/21
Cobra Kai: Season 3: The Good, The Bad, and The Badass	2/2/21
Cobra Kai: Season 3: Obstáculos	2/2/21
Cobra Kai: Season 3: King Cobra	2/2/21
Cobra Kai: Season 3: Miyagi-Do	2/2/21
Cobra Kai: Season 3: The Right Path	2/1/21
Cobra Kai: Season 3: Now You’re Gonna Pay	2/1/21
Sherlock: The Blind Banker	2/1/21
Cobra Kai: Season 3: Nature Vs. Nurture	2/1/21
Cobra Kai: Season 3: Aftermath	2/1/21
Cobra Kai: Season 2: No Mercy	2/1/21
Cobra Kai: Season 2: Pulpo	2/1/21
Cobra Kai: Season 2: Glory of Love	2/1/21
Cobra Kai: Season 2: Lull	2/1/21
Cobra Kai: Season 2: Take a Right	2/1/21
Cobra Kai: Season 2: All In	2/1/21
Cobra Kai: Season 2: The Moment of Truth	2/1/21
Superbad	2/1/21
Cobra Kai: Season 2: Fire and Ice	1/31/21
Cobra Kai: Season 2: Back in Black	1/31/21
Cobra Kai: Season 2: Mercy, Part II	1/31/21
Cobra Kai: Season 1: Mercy	1/31/21
Cobra Kai: Season 1: Different But Same	1/31/21
Cobra Kai: Season 1: Molting	1/31/21
Cobra Kai: Season 1: All Valley	1/31/21
Cobra Kai: Season 1: Quiver	1/31/21
Cobra Kai: Season 1: Counterbalance	1/31/21
Cobra Kai: Season 1: Cobra Kai Never Dies	1/30/21
Cobra Kai: Season 1: Esqueleto	1/30/21
Cobra Kai: Season 1: Strike First	1/30/21
Cobra Kai: Season 1: Ace Degenerate	1/30/21
ONE PIECE: Enter Chopper at the Winter Island: Episode 78	1/30/21
ONE PIECE: Entering into the Grand Line: Episode 77	1/30/21
ONE PIECE: Entering into the Grand Line: Episode 76	1/30/21
ONE PIECE: Entering into the Grand Line: Episode 75	1/30/21
ONE PIECE: Entering into the Grand Line: Episode 74	1/30/21
ONE PIECE: Entering into the Grand Line: Episode 73	1/30/21
ONE PIECE: Entering into the Grand Line: Episode 72	1/30/21
ONE PIECE: Entering into the Grand Line: Episode 71	1/27/21
ONE PIECE: Entering into the Grand Line: Episode 70	1/27/21
ONE PIECE: Entering into the Grand Line: Episode 69	1/26/21
ONE PIECE: Entering into the Grand Line: Episode 68	1/26/21
ONE PIECE: Entering into the Grand Line: Episode 67	1/26/21
ONE PIECE: Entering into the Grand Line: Episode 66	1/26/21
ONE PIECE: Entering into the Grand Line: Episode 65	1/26/21
ONE PIECE: Entering into the Grand Line: Episode 64	1/25/21
ONE PIECE: Entering into the Grand Line: Episode 63	1/25/21
ONE PIECE: Entering into the Grand Line: Episode 62	1/24/21
ONE PIECE: East Blue: Episode 61	1/24/21
ONE PIECE: East Blue: Episode 60	1/23/21
ONE PIECE: East Blue: Episode 59	1/23/21
ONE PIECE: East Blue: Episode 58	1/23/21
ONE PIECE: East Blue: Episode 57	1/23/21
ONE PIECE: East Blue: Episode 56	1/23/21
The White Tiger	1/23/21
ONE PIECE: East Blue: Episode 55	1/23/21
The Queen's Gambit: Limited Series: Openings	1/22/21
Dave Chappelle: Equanimity & The Bird Revelation: Collection: Dave Chappelle: The Bird Revelation	1/22/21
ONE PIECE: East Blue: Episode 54	1/22/21
ONE PIECE: East Blue: Episode 53	1/22/21
ONE PIECE: East Blue: Episode 52	1/21/21
ONE PIECE: East Blue: Episode 51	1/21/21
ONE PIECE: East Blue: Episode 50	1/21/21
ONE PIECE: East Blue: Episode 49	1/21/21
ONE PIECE: East Blue: Episode 48	1/21/21
ONE PIECE: East Blue: Episode 47	1/21/21
ONE PIECE: East Blue: Episode 46	1/20/21
ONE PIECE: East Blue: Episode 45	1/20/21
ONE PIECE: East Blue: Episode 44	1/20/21
ONE PIECE: East Blue: Episode 43	1/20/21
ONE PIECE: East Blue: Episode 42	1/20/21
ONE PIECE: East Blue: Episode 41	1/19/21
ONE PIECE: East Blue: Episode 40	1/19/21
ONE PIECE: East Blue: Episode 39	1/19/21
ONE PIECE: East Blue: Episode 38	1/19/21
ONE PIECE: East Blue: Episode 37	1/18/21
ONE PIECE: East Blue: Episode 36	1/18/21
ONE PIECE: East Blue: Episode 35	1/18/21
ONE PIECE: East Blue: Episode 34	1/18/21
ONE PIECE: East Blue: Episode 33	1/18/21
ONE PIECE: East Blue: Episode 32	1/17/21
ONE PIECE: East Blue: Episode 31	1/17/21
ONE PIECE: East Blue: Episode 30	1/17/21
ONE PIECE: East Blue: Episode 1	1/17/21
Alice in Borderland: Season 1: Episode 1	12/30/20
Lost in Space: Season 1: Diamonds In The Sky	12/30/20
Sherlock: A Study in Pink	12/20/20
The Matrix Reloaded	12/20/20
Brave Blue World: Racing to Solve Our Water Crisis	12/19/20
Mr. Iglesias: Part 3: Technically Speaking	12/17/20
Dave Chappelle: Equanimity & The Bird Revelation: Collection: Dave Chappelle: Equanimity	12/15/20
Start-Up: START-UP	12/7/20
Dr.STONE: Season 1: Episode 24	12/5/20
Dr.STONE: Season 1: Episode 23	12/5/20
Dr.STONE: Season 1: Episode 22	12/5/20
Dr.STONE: Season 1: Episode 21	12/5/20
Dr.STONE: Season 1: Episode 20	12/5/20
Dr.STONE: Season 1: Episode 19	12/5/20
Patriot Act with Hasan Minhaj: Volume 5: Trump's Worst Policy: Killing Asylum	12/5/20
Dr.STONE: Season 1: Episode 18	12/4/20
Dr.STONE: Season 1: Episode 17	12/4/20
Dr.STONE: Season 1: Episode 16	12/3/20
Dr.STONE: Season 1: Episode 15	12/3/20
Dr.STONE: Season 1: Episode 14	12/3/20
Dr.STONE: Season 1: Episode 13	12/3/20
Dr.STONE: Season 1: Episode 12	12/3/20
Dr.STONE: Season 1: Episode 11	12/3/20
Dr.STONE: Season 1: Episode 10	12/2/20
Dr.STONE: Season 1: Episode 9	12/2/20
Dr.STONE: Season 1: Episode 8	12/2/20
Dr.STONE: Season 1: Episode 7	12/2/20
Dr.STONE: Season 1: Episode 6	12/1/20
Dr.STONE: Season 1: Episode 5	12/1/20
Dr.STONE: Season 1: Episode 4	12/1/20
Dr.STONE: Season 1: Episode 3	12/1/20
Dr.STONE: Season 1: Episode 2	12/1/20
Dr.STONE: Season 1: Episode 1	12/1/20
The Disastrous Life of Saiki K.: Reawakened: Reawakening Saiki Kusuo	11/30/20
The Disastrous Life of Saiki K.: Reawakened: Bully Rescue! Mr. Iguchi	11/30/20
The Disastrous Life of Saiki K.: Reawakened: Terrifying! A Disastrous Transfer Student	11/30/20
The Disastrous Life of Saiki K.: Reawakened: New Teacher With an Outstanding Feature	11/30/20
Patriot Act with Hasan Minhaj: Volume 5: The Ugly Truth of Fast Fashion	11/30/20
The Disastrous Life of Saiki K.: Reawakened: Build The Most Powerful Deck!	11/29/20
The Disastrous Life of Saiki K.: Reawakened: Three Men, A Little Girl, A Police Officer and A Dog	11/26/20
The Disastrous Life of Saiki K.: Season 3: Episode 2	11/26/20
The Disastrous Life of Saiki K.: Season 3: Episode 1	11/26/20
The Disastrous Life of Saiki K.: Season 2: Episode 24	11/26/20
The Disastrous Life of Saiki K.: Season 2: Episode 23	11/25/20
The Disastrous Life of Saiki K.: Season 2: Episode 22	11/25/20
The Disastrous Life of Saiki K.: Season 2: Episode 21	11/25/20
The Disastrous Life of Saiki K.: Season 2: Episode 20	11/25/20
The Disastrous Life of Saiki K.: Season 2: Episode 19	11/24/20
The Disastrous Life of Saiki K.: Season 2: Episode 18	11/24/20
The Disastrous Life of Saiki K.: Season 2: Episode 17	11/24/20
The Disastrous Life of Saiki K.: Season 2: Episode 16	11/24/20
The Disastrous Life of Saiki K.: Season 2: Episode 15	11/24/20
The Disastrous Life of Saiki K.: Season 2: Episode 14	11/23/20
The Disastrous Life of Saiki K.: Season 2: Episode 13	11/23/20
The Disastrous Life of Saiki K.: Season 2: Episode 12	11/23/20
The Disastrous Life of Saiki K.: Season 2: Episode 11	11/23/20
The Disastrous Life of Saiki K.: Season 2: Episode 10	11/23/20
The Disastrous Life of Saiki K.: Season 2: Episode 9	11/22/20
The Disastrous Life of Saiki K.: Season 2: Episode 8	11/22/20
The Disastrous Life of Saiki K.: Season 2: Episode 7	11/21/20
The Disastrous Life of Saiki K.: Season 2: Episode 6	11/21/20
The Disastrous Life of Saiki K.: Season 2: Episode 5	11/21/20
The Disastrous Life of Saiki K.: Season 2: Episode 4	11/21/20
The Disastrous Life of Saiki K.: Season 2: Episode 3	11/19/20
The Disastrous Life of Saiki K.: Season 2: Episode 2	11/19/20
The Disastrous Life of Saiki K.: Season 2: Episode 1	11/19/20
The Disastrous Life of Saiki K.: Season 1: Episode 24	11/19/20
The Disastrous Life of Saiki K.: Season 1: Episode 23	11/19/20
The Disastrous Life of Saiki K.: Season 1: Episode 22	11/19/20
The Disastrous Life of Saiki K.: Season 1: Episode 21	11/19/20
The Disastrous Life of Saiki K.: Season 1: Episode 20	11/19/20
The Disastrous Life of Saiki K.: Season 1: Episode 19	11/19/20
The Disastrous Life of Saiki K.: Season 1: Episode 18	11/18/20
The Disastrous Life of Saiki K.: Season 1: Episode 17	11/18/20
The Disastrous Life of Saiki K.: Season 1: Episode 16	11/18/20
The Disastrous Life of Saiki K.: Season 1: Episode 15	11/18/20
The Disastrous Life of Saiki K.: Season 1: Episode 14	11/17/20
The Disastrous Life of Saiki K.: Season 1: Episode 13	11/17/20
The Disastrous Life of Saiki K.: Season 1: Episode 12	11/17/20
The Disastrous Life of Saiki K.: Season 1: Episode 11	11/16/20
The Disastrous Life of Saiki K.: Season 1: Episode 10	11/16/20
The Disastrous Life of Saiki K.: Season 1: Episode 9	11/16/20
The Disastrous Life of Saiki K.: Season 1: Episode 8	11/15/20
The Disastrous Life of Saiki K.: Season 1: Episode 7	11/14/20
The Disastrous Life of Saiki K.: Season 1: Episode 6	11/14/20
Lost in Space: Season 1: Impact	11/13/20
The Disastrous Life of Saiki K.: Season 1: Episode 5	11/12/20
The Disastrous Life of Saiki K.: Season 1: Episode 4	11/12/20
The Disastrous Life of Saiki K.: Season 1: Episode 3	11/11/20
The Disastrous Life of Saiki K.: Season 1: Episode 2	11/11/20
The Disastrous Life of Saiki K.: Season 1: Episode 1	11/11/20
Wonder	10/24/20
Ready Player One	10/24/20
Bill Burr: Paper Tiger	10/17/20
The Social Dilemma	10/3/20
Smurfs: The Lost Village	9/20/20
Mamma Mia! Here We Go Again	9/19/20
The Bucket List	9/19/20
The Matrix	9/5/20
Harold & Kumar Escape from Guantanamo Bay	9/2/20
Dirk Gently's Holistic Detective Agency: Season 1: Lost & Found	8/31/20
Dirk Gently's Holistic Detective Agency: Season 1: Horizons	8/31/20
Gone Girl	8/31/20
Kung Fu Panda: Secrets of the Scroll	8/30/20
The Sky Is Pink	8/29/20
Hunter X Hunter (2011): Season 6: Past × And × Future	8/28/20
Hunter X Hunter (2011): Season 6: Salvation × And × Future	8/28/20
Hunter X Hunter (2011): Season 6: Chairman × And × Release	8/28/20
Hunter X Hunter (2011): Season 6: Defeat × And × Reunion	8/28/20
Hunter X Hunter (2011): Season 6: Approval × And × Coalition	8/28/20
Hunter X Hunter (2011): Season 6: Sin × and × Claw	8/28/20
Hunter X Hunter (2011): Season 6: Needles × And × Debt	8/28/20
Hunter X Hunter (2011): Season 6: Magician × And × Butler	8/28/20
Transformers: War for Cybertron: Siege: Siege: Episode 2	8/28/20
Transformers: War for Cybertron: Siege: Siege: Episode 1	8/28/20
Hunter X Hunter (2011): Season 6: Join Battle × And × Open Battle	8/27/20
Hunter X Hunter (2011): Season 6: Alluka × And × Something	8/27/20
Hunter X Hunter (2011): Season 6: Request × And × Wish	8/27/20
Hunter X Hunter (2011): Season 6: Debate × Among × Zodiacs	8/27/20
Hunter X Hunter (2011): Season 5: Homecoming × And × Real Name	8/27/20
Hunter X Hunter (2011): Season 5: This Person × And × This Moment	8/27/20
Hunter X Hunter (2011): Season 5: Anger × And × Light	8/27/20
Hunter X Hunter (2011): Season 5: The Word × Is × You	8/27/20
Hunter X Hunter (2011): Season 5: Deadline × To × Live	8/27/20
Hunter X Hunter (2011): Season 5: Flash × And × Start	8/27/20
Hunter X Hunter (2011): Season 5: Magic × To × Destroy	8/26/20
Hunter X Hunter (2011): Season 5: Formidable Enemy × And × Clear Objective	8/26/20
Hunter X Hunter (2011): Season 5: Unparalleled Joy × And × Unconditional Love	8/26/20
Hunter X Hunter (2011): Season 5: Hostility × And × Determination	8/26/20
Hunter X Hunter (2011): Season 5: Zero × And × Rose	8/26/20
Hunter X Hunter (2011): Season 5: Great Power × And × Ultimate Power	8/26/20
Hunter X Hunter (2011): Season 5: Centipede × And × Memory	8/26/20
Hunter X Hunter (2011): Season 5: Breakdown × And × Awakening	8/26/20
Hunter X Hunter (2011): Season 5: Pose × And × Name	8/25/20
Hunter X Hunter (2011): Season 5: Defeat × And × Dignity	8/25/20
Hunter X Hunter (2011): Season 5: Fake × And × Real	8/25/20
Hunter X Hunter (2011): Season 5: Duty × And × Question	8/25/20
Hunter X Hunter (2011): Season 5: Strong × Or × Weak	8/25/20
Hunter X Hunter (2011): Season 5: A × False × Revenge	8/25/20
Hunter X Hunter (2011): Season 5: Insult × And × Payback	8/25/20
Hunter X Hunter (2011): Season 5: Revenge × And × Recovery	8/25/20
Hunter X Hunter (2011): Season 5: Divide × And × Conquer	8/24/20
Hunter X Hunter (2011): Season 5: An × Indebted × Insect	8/24/20
Hunter X Hunter (2011): Season 5: Monster × And × Monster	8/24/20
Hunter X Hunter (2011): Season 5: Charge × And × Invade	8/24/20
Hunter X Hunter (2011): Season 5: Confusion × And × Expectation	8/24/20
Hunter X Hunter (2011): Season 5: Taking Stock × And × Taking Action	8/24/20
Hunter X Hunter (2011): Season 5: Komugi × And × Gungi	8/24/20
Hunter X Hunter (2011): Season 5: Return × And × Retire	8/24/20
Hunter X Hunter (2011): Season 5: Knov × And × Morel	8/23/20
Hunter X Hunter (2011): Season 5: Resolve × And × Awakening	8/22/20
Hunter X Hunter (2011): Season 5: Doubt × And × Hesitation	8/22/20
Hunter X Hunter (2011): Season 5: Check × And × Mate	8/22/20
Hunter X Hunter (2011): Season 5: Power × and × Games	8/22/20
Hunter X Hunter (2011): Season 5: Ikalgo × and × Lightning	8/21/20
The Umbrella Academy: Season 2: The End of Something	8/20/20
The Umbrella Academy: Season 2: 743	8/20/20
The Umbrella Academy: Season 2: The Seven Stages	8/20/20
The Umbrella Academy: Season 2: Öga for Öga	8/20/20
The Umbrella Academy: Season 2: A Light Supper	8/20/20
The Umbrella Academy: Season 2: Valhalla	8/20/20
The Umbrella Academy: Season 2: The Majestic 12	8/20/20
Hunter X Hunter (2011): Season 5: Tracking x and x Pursuit	8/18/20
The Umbrella Academy: Season 2: The Swedish Job	8/18/20
The Umbrella Academy: Season 2: The Frankel Footage	8/18/20
The Umbrella Academy: Season 2: Right Back Where We Started	8/18/20
The Umbrella Academy: Season 1: We Only See Each Other at Weddings and Funerals	8/18/20
Hunter X Hunter (2011): Season 5: Combination x and x Evolution	8/17/20
Hunter X Hunter (2011): Season 5: Infiltration x and x Selection	8/16/20
Hunter X Hunter (2011): Season 5: Grudge x and x Dread	8/16/20
Hunter X Hunter (2011): Season 5: Carnage x and x Devastation	8/16/20
Hunter X Hunter (2011): Season 5: A x Lawless x Home	8/16/20
Hunter X Hunter (2011): Season 5: Friend x and x Journey	8/15/20
Hunter X Hunter (2011): Season 5: Date x with x Palm	8/15/20
Hunter X Hunter (2011): Season 5: Rock-Paper-Scissors x and x Weakness	8/15/20
Hunter X Hunter (2011): Season 5: One Wish x and x Two Promises	8/14/20
Hunter X Hunter (2011): Season 5: The Strong x and x the Weak	8/14/20
Hunter X Hunter (2011): Season 5: Interest x and x Curse	8/14/20
Hunter X Hunter (2011): Season 5: Compassion x and x Strength	8/14/20
Hunter X Hunter (2011): Season 5: Duel x and x Escape	8/13/20
Hunter X Hunter (2011): Season 5: Promise x and x Reunion	8/13/20
Hunter X Hunter (2011): Season 5: Light x and x Darkness	8/13/20
Hunter X Hunter (2011): Season 5: A x Fated x Awakening	8/13/20
Hunter X Hunter (2011): Season 5: Inspiration x to x Evolve	8/13/20
Hunter X Hunter (2011): Season 5: Kite x and x Slots	8/13/20
Hunter X Hunter (2011): Season 5: The x Fight x Begins	8/13/20
Hunter X Hunter (2011): Season 5: Evil x and x Terrible	8/13/20
Hunter X Hunter (2011): Season 5: No x Good x NGL	8/13/20
Hunter X Hunter (2011): Season 5: Very x Rapid x Reproduction	8/12/20
Hunter X Hunter (2011): Season 5: Unease x and x Sighting	8/12/20
Hunter X Hunter (2011): Season 5: Reunion x and x Understanding	8/12/20
Hunter X Hunter (2011): Season 4: Ging's Friends x and x True Friends	8/12/20
Hunter X Hunter (2011): Season 4: Victor x and x Loser	8/12/20
Hunter X Hunter (2011): Season 4: Insanity x and x Sanity	8/12/20
Hunter X Hunter (2011): Season 4: Chase x and x Chance	8/12/20
Hunter X Hunter (2011): Season 4: Bargain x and x Deal	8/12/20
Hunter X Hunter (2011): Season 4: Guts x and x Courage	8/12/20
Hunter X Hunter (2011): Season 4: A x Heated x Showdown	8/11/20
Hunter X Hunter (2011): Season 4: Pirates x and x Guesses	8/11/20
Hunter X Hunter (2011): Season 4: 15 x 15	8/11/20
Hunter X Hunter (2011): Season 4: Strategy x and x Scheme	8/11/20
Hunter X Hunter (2011): Season 4: Evil Fist x and x Rock-Paper-Scissors	8/11/20
Hunter X Hunter (2011): Season 4: Strengthen x and x Threaten	8/11/20
Hunter X Hunter (2011): Season 4: A x Hard x Master?	8/11/20
Hunter X Hunter (2011): Season 4: Reality? x and x Raw	8/11/20
Hunter X Hunter (2011): Season 4: Invitation x and x Friend	8/10/20
Hunter X Hunter (2011): Season 4: End x and x Beginning	8/10/20
Hunter X Hunter (2011): Season 3: Signal x to x Retreat	8/10/20
Hunter X Hunter (2011): Season 4: Bid x and x Haste	8/10/20
Hunter X Hunter (2011): Season 3: Initiative x and x Law	8/10/20
Hunter X Hunter (2011): Season 3: Beloved x and x Beleaguered	8/10/20
Hunter X Hunter (2011): Season 3: Alies x and x Lies	8/10/20
Hunter X Hunter (2011): Season 3: Fortunes x Aren't x Right?	8/10/20
Hunter X Hunter (2011): Season 3: Fake x and x Psyche	8/10/20
Hunter X Hunter (2011): Season 3: Assault x and x Impact	8/10/20
Hunter X Hunter (2011): Season 3: A x Brutal x Battlefield	8/10/20
Hunter X Hunter (2011): Season 3: Ally x and x Sword	8/10/20
Hunter X Hunter (2011): Season 3: Pursuit x and x Analysis	8/9/20
A Silent Voice	8/9/20
Raat Akeli Hai	8/7/20
Taare Zameen Par	8/7/20
Hunter X Hunter (2011): Season 3: Very x Sharp x Eye	8/7/20
Hunter X Hunter (2011): Season 3: Condition x and x Condition	8/6/20
Hunter X Hunter (2011): Season 3: Chasing x and x Waiting	8/6/20
Hunter X Hunter (2011): Season 3: Restraint x and x Vow	8/6/20
Hunter X Hunter (2011): Season 3: Buildup x to a x Fierce Battle	8/6/20
Hunter X Hunter (2011): Season 3: A x Shocking x Tragedy	8/6/20
Hunter X Hunter (2011): Season 3: Defend x and x Attack	8/6/20
Hunter X Hunter (2011): Season 3: Gathering x of x Heroes	8/6/20
Hunter X Hunter (2011): Season 3: Nen x Users x Unite?	8/5/20
Hunter X Hunter (2011): Season 3: Wish x and x Promise	8/5/20
Hunter X Hunter (2011): Season 2: Reply x from x Dad	8/5/20
Hunter X Hunter (2011): Season 2: Ging x and x Gon	8/4/20
Hunter X Hunter (2011): Season 2: A Big Debt x and x a Small Kick	8/4/20
Hunter X Hunter (2011): Season 2: The x True x Pass	8/4/20
Hunter X Hunter (2011): Season 2: Power x to x Avenge	8/4/20
Hunter X Hunter (2011): Season 2: An x Empty x Threat	8/4/20
Hunter X Hunter (2011): Season 2: A x Surprising x Win	8/3/20
Hunter X Hunter (2011): Season 2: Destiny x and x Tenacity	8/2/20
Hunter X Hunter (2011): Season 2: Fierce x and x Ferocious	8/1/20
Hunter X Hunter (2011): Season 2: Awakening x and x Potential	8/1/20
Hunter X Hunter (2011): Season 2: Nen x and x Nen	8/1/20
Hunter X Hunter (2011): Season 2: Arrival x at x the Arena	8/1/20
Hunter X Hunter (2011): Season 1: Then x and x After	8/1/20
Hunter X Hunter (2011): Season 1: Can't See x if x You're Blind	8/1/20
Hunter X Hunter (2011): Season 1: The x Zoldyck x Family	8/1/20
Hunter X Hunter (2011): Season 1: The x Guard's x Duty	8/1/20
Silver Linings Playbook	7/31/20
Hunter X Hunter (2011): Season 1: A x Dangerous x Watchdog	7/31/20
Hunter X Hunter (2011): Season 1: Some x Brother x Trouble	7/31/20
Hunter X Hunter (2011): Season 1: Baffling Turn x of x Events	7/31/20
Hunter X Hunter (2011): Season 1: Can't Win x But x Can't Lose	7/28/20
Hunter X Hunter (2011): Season 1: Big x Time x Interview	7/27/20
Hunter X Hunter (2011): Season 1: Trap x in x the Hole	7/27/20
Hunter X Hunter (2011): Season 1: Defeat x and x Disgrace	7/27/20
Hunter X Hunter (2011): Season 1: Scramble x of x Deception	7/27/20
Hunter X Hunter (2011): Season 1: Hit x the x Target	7/27/20
Hunter X Hunter (2011): Season 1: Letter x from x Gon	7/27/20
Hunter X Hunter (2011): Season 1: Last Test x of x Resolve	7/27/20
Happy Gilmore	7/26/20
Hunter X Hunter (2011): Season 1: Trouble x with x the Gamble	7/26/20
Hunter X Hunter (2011): Season 1: Trick x to x the Trick	7/26/20
Hunter X Hunter (2011): Season 1: Beware x of x Prisoners	7/25/20
Hunter X Hunter (2011): Season 1: Solution x Is x Majority Rules?	7/25/20
Hunter X Hunter (2011): Season 1: Showdown x on x the Airship	7/25/20
Hunter X Hunter (2011): Season 1: A x Surprising x Challenge	7/25/20
Hunter X Hunter (2011): Season 1: Hisoka x Is x Sneaky	7/25/20
Hunter X Hunter (2011): Season 1: Hope x and x Ambition	7/25/20
Hunter X Hunter (2011): Season 1: Rivals x for x Survival	7/25/20
Hunter X Hunter (2011): Season 1: Test x of x Tests	7/25/20
Hunter X Hunter (2011): Season 1: Departure x and x Friends	7/25/20
Mr. Iglesias: Part 2: Wherefore Art Thou, Counselor?	7/19/20
Mr. Iglesias: Part 2: Food for Thought	7/19/20
Mr. Iglesias: Part 2: Generation Why	7/19/20
Mr. Iglesias: Part 2: Party of One	7/19/20
Mr. Iglesias: Part 2: Taming the Carlos	7/19/20
Love, Death & Robots: Volume 1: ZIMA BLUE	7/18/20
Love, Death & Robots: Volume 1: BLINDSPOT	7/18/20
Love, Death & Robots: Volume 1: LUCKY 13	7/18/20
Love, Death & Robots: Volume 1: ALTERNATE HISTORIES	7/18/20
Love, Death & Robots: Volume 1: HELPING HAND	7/18/20
Love, Death & Robots: Volume 1: FISH NIGHT	7/18/20
Love, Death & Robots: Volume 1: SHAPE-SHIFTERS	7/18/20
Love, Death & Robots: Volume 1: THE DUMP	7/18/20
Love, Death & Robots: Volume 1: GOOD HUNTING	7/18/20
Love, Death & Robots: Volume 1: SUITS	7/18/20
Love, Death & Robots: Volume 1: THE WITNESS	7/18/20
Love, Death & Robots: Volume 1: SUCKER OF SOULS	7/18/20
Love, Death & Robots: Volume 1: THE SECRET WAR	7/18/20
Love, Death & Robots: Volume 1: WHEN THE YOGURT TOOK OVER	7/18/20
Love, Death & Robots: Volume 1: SONNIE'S EDGE	7/18/20
Love, Death & Robots: Volume 1: ICE AGE	7/18/20
Love, Death & Robots: Volume 1: BEYOND THE AQUILA RIFT	7/18/20
Love, Death & Robots: Volume 1: THREE ROBOTS	7/18/20
Mr. Iglesias: Part 2: True Calling	7/17/20
Mr. Iglesias: Part 1: Academic Decathlon	7/17/20
Mr. Iglesias: Part 1: Oh Boy, Danny	7/17/20
Mr. Iglesias: Part 1: Teachers' Strike	7/17/20
Mr. Iglesias: Part 1: Talent Show	7/17/20
Mr. Iglesias: Part 1: Bullying	7/16/20
Mr. Iglesias: Part 1: Everybody Hates Gabe	7/16/20
Mr. Iglesias: Part 1: The Wagon	7/16/20
Spenser Confidential	7/15/20
Mr. Iglesias: Part 1: Full Hearts, Clear Backpacks	7/15/20
Mr. Iglesias: Part 1: Summer School	7/15/20
Mr. Iglesias: Part 1: Some Children Left Behind	7/14/20
The Old Guard	7/14/20
Mr. Deeds	7/14/20
Gabriel lglesias: I’m Sorry For What I Said When I Was Hungry	7/12/20
Secret Superstar	7/12/20
London Has Fallen	7/10/20
Made of Honour	7/10/20
All Hail King Julien: King Me	7/10/20
The Wrong Missy	7/9/20
ARQ	7/8/20
Extinction	7/8/20
Europa Report	7/8/20
Murder Mystery	7/7/20
IO	7/4/20
Snowpiercer	7/4/20
Billy Madison	7/4/20
Coming to America	7/2/20
Catch Me If You Can	6/29/20
Justice League	6/26/20
12 Years a Slave	6/24/20
Django Unchained	6/24/20
Formula 1: Drive to Survive: Season 1: All to Play For	6/22/20
6 Underground	6/22/20
JoJo's Bizarre Adventure: Stardust Crusaders: Anubis, Part 1	6/18/20
JoJo's Bizarre Adventure: Stardust Crusaders: Khnum's Oingo and Thoth's Boingo	6/18/20
Patriot Act with Hasan Minhaj: Volume 6: Is College Still Worth It?	6/17/20
JoJo's Bizarre Adventure: Stardust Crusaders: Iggy the Fool and Geb's N'Doul, Part 2	6/16/20
JoJo's Bizarre Adventure: Stardust Crusaders: Iggy the Fool and Geb's N'Doul, Part 1	6/16/20
JoJo's Bizarre Adventure: Stardust Crusaders: High Priestess, Part 2	6/15/20
JoJo's Bizarre Adventure: Stardust Crusaders: High Priestess, Part 1	6/15/20
JoJo's Bizarre Adventure: Stardust Crusaders: Judgement, Part 2	6/15/20
JoJo's Bizarre Adventure: Stardust Crusaders: Judgement, Part 1	6/15/20
JoJo's Bizarre Adventure: Stardust Crusaders: Death 13, Part 2	6/15/20
JoJo's Bizarre Adventure: Stardust Crusaders: Death 13, Part 1	6/15/20
JoJo's Bizarre Adventure: Stardust Crusaders: The Sun	6/15/20
JoJo's Bizarre Adventure: Stardust Crusaders: The Lovers, Part 2	6/15/20
JoJo's Bizarre Adventure: Stardust Crusaders: The Lovers, Part 1	6/15/20
JoJo's Bizarre Adventure: Stardust Crusaders: Justice, Part 2	6/15/20
Dangal	6/14/20
JoJo's Bizarre Adventure: Stardust Crusaders: Justice, Part 1	6/12/20
JoJo's Bizarre Adventure: Stardust Crusaders: Wheel of Fortune	6/12/20
Kenny Sebastian: The Most Interesting Person in the Room	6/12/20
Another Life: Season 1: Across the Universe	6/12/20
JoJo's Bizarre Adventure: Stardust Crusaders: The Empress	6/11/20
JoJo's Bizarre Adventure: Stardust Crusaders: The Emperor and the Hanged Man, Part 2	6/11/20
JoJo's Bizarre Adventure: Stardust Crusaders: The Emperor and the Hanged Man, Part 1	6/11/20
Coach Carter	6/9/20
 : Episode 1	6/7/20
Star Trek	6/7/20
Apollo 13	6/7/20
Merlin: The Dragon's Call	6/5/20
Lagaan	5/24/20
The Lunchbox	5/23/20
Assassin's Creed	5/22/20
Patriot Act with Hasan Minhaj: Volume 6: What Happens If You Can't Pay Rent?	5/19/20
The Last Dance: Limited Series: Episode IX	5/18/20
The Last Dance: Limited Series: Episode VIII	5/11/20
The Last Dance: Limited Series: Episode VII	5/11/20
The Last Dance: Limited Series: Episode VI	5/4/20
The Last Dance: Limited Series: Episode V	5/4/20
The Last Dance: Limited Series: Episode IV	5/4/20
Yours Sincerely, Kanan Gill	4/28/20
The Last Dance: Limited Series: Episode III	4/27/20
The Last Dance: Limited Series: Episode II	4/27/20
The Last Dance: Limited Series: Episode I	4/27/20
STEINS;GATE: Steins;Gate: Egoistic Poriomania	4/22/20
STEINS;GATE: Steins;Gate: The Prologue Begins with the End	4/22/20
STEINS;GATE: Steins;Gate: Open the Steins Gate	4/21/20
STEINS;GATE: Steins;Gate: Being Meltdown	4/21/20
STEINS;GATE: Steins;Gate: Paradox Meltdown	4/21/20
STEINS;GATE: Steins;Gate: Finalize Apoptosis	4/21/20
STEINS;GATE: Steins;Gate: Endless Apoptosis	4/21/20
STEINS;GATE: Steins;Gate: Fractal Androgynous	4/21/20
STEINS;GATE: Steins;Gate: Made in Complex	4/21/20
STEINS;GATE: Steins;Gate: Sacrificial Necrosis	4/20/20
STEINS;GATE: Steins;Gate: Missing Link Necrosis	4/20/20
STEINS;GATE: Steins;Gate: Physical Necrosis	4/20/20
STEINS;GATE: Steins;Gate: Metaphysical Necrosis	4/20/20
STEINS;GATE: Steins;Gate: Dogma of Static Limit	4/20/20
STEINS;GATE: Steins;Gate: Dogma of Space-Time Boundary	4/20/20
STEINS;GATE: Steins;Gate: Homeostasis of Complements	4/20/20
STEINS;GATE: Steins;Gate: Homeostasis of Illusions	4/20/20
STEINS;GATE: Steins;Gate: Homeostasis of Dreams	4/20/20
STEINS;GATE: Steins;Gate: Divergence of Fault	4/20/20
STEINS;GATE: Steins;Gate: Divergence of Butterfly Effect	4/20/20
STEINS;GATE: Steins;Gate: Rendezvous of Electrical Charge Conflict	4/20/20
STEINS;GATE: Steins;Gate: Rendezvous of Abstract Fluctuation	4/20/20
STEINS;GATE: Steins;Gate: Paranoia of Parallel Process	4/20/20
STEINS;GATE: Steins;Gate: Paranoia of Time Leaps	4/20/20
Sex Education: Season 2: Episode 7	4/18/20
Sex Education: Season 2: Episode 8	4/17/20
Sex Education: Season 2: Episode 6	4/17/20
Sex Education: Season 2: Episode 5	4/17/20
Sex Education: Season 2: Episode 4	4/17/20
Sex Education: Season 2: Episode 3	4/17/20
Sex Education: Season 2: Episode 2	4/17/20
Sex Education: Season 2: Episode 1	4/17/20
Sex Education: Season 1: Episode 8	4/17/20
Sex Education: Season 1: Episode 7	4/17/20
Sex Education: Season 1: Episode 6	4/17/20
Sex Education: Season 1: Episode 5	4/16/20
Sex Education: Season 1: Episode 4	4/16/20
Sex Education: Season 1: Episode 3	4/16/20
Sex Education: Season 1: Episode 2	4/16/20
Sex Education: Season 1: Episode 1	4/16/20
Peaky Blinders: Season 5: Mr Jones	4/11/20
Peaky Blinders: Season 5: The Shock	4/11/20
Peaky Blinders: Season 5: The Loop	4/11/20
Peaky Blinders: Season 5: Strategy	4/11/20
Peaky Blinders: Season 5: Black Cats	4/11/20
Peaky Blinders: Season 5: Black Tuesday	4/10/20
Peaky Blinders: Season 4: The Company	4/9/20
Peaky Blinders: Season 4: The Duel	4/9/20
Peaky Blinders: Season 4: Dangerous	4/9/20
Peaky Blinders: Season 4: Blackbird	4/8/20
Peaky Blinders: Season 4: Heathens	4/8/20
Peaky Blinders: Season 4: The Noose	4/7/20
Peaky Blinders: Season 3: Episode 6	4/7/20
Peaky Blinders: Season 3: Episode 5	4/7/20
Peaky Blinders: Season 3: Episode 4	4/7/20
Peaky Blinders: Season 3: Episode 3	4/6/20
Peaky Blinders: Season 3: Episode 2	4/6/20
Brooklyn Nine-Nine: Season 6: The Suicide Squad	4/6/20
Brooklyn Nine-Nine: Season 6: Sicko	4/6/20
Brooklyn Nine-Nine: Season 6: Cinco de Mayo	4/6/20
Brooklyn Nine-Nine: Season 6: Return of the King	4/6/20
Brooklyn Nine-Nine: Season 6: Ticking Clocks	4/6/20
Brooklyn Nine-Nine: Season 6: The Bimbo	4/6/20
Brooklyn Nine-Nine: Season 6: Casecation	4/5/20
Brooklyn Nine-Nine: Season 6: The Therapist	4/5/20
Brooklyn Nine-Nine: Season 6: Gintars	4/5/20
Brooklyn Nine-Nine: Season 6: The Golden Child	4/5/20
Brooklyn Nine-Nine: Season 6: He Said, She Said	4/5/20
Brooklyn Nine-Nine: Season 6: The Honeypot	4/5/20
Brooklyn Nine-Nine: Season 6: The Crime Scene	4/5/20
Brooklyn Nine-Nine: Season 6: A Tale of Two Bandits	4/5/20
Brooklyn Nine-Nine: Season 6: Four Movements	4/4/20
Brooklyn Nine-Nine: Season 6: The Tattler	4/4/20
Brooklyn Nine-Nine: Season 6: Hitchcock & Scully	4/4/20
Brooklyn Nine-Nine: Season 6: Honeymoon	4/4/20
Brooklyn Nine-Nine: Season 5: Jake & Amy	4/4/20
Brooklyn Nine-Nine: Season 5: White Whale	4/4/20
Brooklyn Nine-Nine: Season 5: Show Me Going	4/4/20
Brooklyn Nine-Nine: Season 5: Bachelor/ette Party	4/4/20
Brooklyn Nine-Nine: Season 5: Gray Star Mutual	4/4/20
Brooklyn Nine-Nine: Season 5: DFW	4/4/20
Brooklyn Nine-Nine: Season 5: NutriBoom	4/4/20
Brooklyn Nine-Nine: Season 5: The Puzzle Master	4/4/20
Brooklyn Nine-Nine: Season 5: The Box	4/4/20
Brooklyn Nine-Nine: Season 5: The Negotiation	4/3/20
Brooklyn Nine-Nine: Season 5: Safe House	4/3/20
Brooklyn Nine-Nine: Season 5: The Favor	4/3/20
Brooklyn Nine-Nine: Season 5: Game Night	4/3/20
Brooklyn Nine-Nine: Season 5: 99	4/3/20
Brooklyn Nine-Nine: Season 5: Return to Skyfire	4/3/20
Brooklyn Nine-Nine: Season 5: Two Turkeys	4/3/20
Brooklyn Nine-Nine: Season 5: The Venue	4/3/20
Brooklyn Nine-Nine: Season 5: Bad Beat	4/3/20
Brooklyn Nine-Nine: Season 5: HalloVeen	4/3/20
Brooklyn Nine-Nine: Season 5: Kicks	4/3/20
Brooklyn Nine-Nine: Season 5: The Big House: Part 2	4/2/20
Brooklyn Nine-Nine: Season 5: The Big House: Part 1	4/2/20
Brooklyn Nine-Nine: Season 4: Crime & Punishment	4/2/20
Brooklyn Nine-Nine: Season 4: The Bank Job	4/2/20
Brooklyn Nine-Nine: Season 4: The Slaughterhouse	4/2/20
Brooklyn Nine-Nine: Season 4: Your Honor	4/2/20
Brooklyn Nine-Nine: Season 4: Chasing Amy	4/2/20
Brooklyn Nine-Nine: Season 4: Cop-Con	4/2/20
Brooklyn Nine-Nine: Season 4: Moo Moo	4/2/20
Brooklyn Nine-Nine: Season 4: The Last Ride	4/1/20
Brooklyn Nine-Nine: Season 4: Serve & Protect	4/1/20
Brooklyn Nine-Nine: Season 4: The Audit	4/1/20
Brooklyn Nine-Nine: Season 4: The Fugitive: Part 2	4/1/20
Brooklyn Nine-Nine: Season 4: The Fugitive: Part 1	4/1/20
Brooklyn Nine-Nine: Season 4: Captain Latvia	4/1/20
Brooklyn Nine-Nine: Season 4: The Overmining	4/1/20
Brooklyn Nine-Nine: Season 4: Skyfire Cycle	4/1/20
Brooklyn Nine-Nine: Season 4: Mr. Santiago	4/1/20
Brooklyn Nine-Nine: Season 4: Monster in the Closet	4/1/20
Brooklyn Nine-Nine: Season 4: Halloween IV	4/1/20
Brooklyn Nine-Nine: Season 4: The Night Shift	3/31/20
Brooklyn Nine-Nine: Season 4: Coral Palms: Part 3	3/31/20
Brooklyn Nine-Nine: Season 4: Coral Palms: Part 2	3/31/20
Brooklyn Nine-Nine: Season 4: Coral Palms: Part 1	3/31/20
Brooklyn Nine-Nine: Season 3: Greg and Larry	3/31/20
Brooklyn Nine-Nine: Season 3: The Bureau	3/31/20
Brooklyn Nine-Nine: Season 3: Maximum Security	3/31/20
Brooklyn Nine-Nine: Season 3: Paranoia	3/31/20
Brooklyn Nine-Nine: Season 3: Terry Kitties	3/31/20
Brooklyn Nine-Nine: Season 3: Cheddar	3/31/20
Brooklyn Nine-Nine: Season 3: Adrian Pimento	3/31/20
Brooklyn Nine-Nine: Season 3: House Mouses	3/30/20
Brooklyn Nine-Nine: Season 3: The 9-8	3/30/20
Brooklyn Nine-Nine: Season 3: Karen Peralta	3/30/20
Brooklyn Nine-Nine: Season 3: The Cruise	3/30/20
Brooklyn Nine-Nine: Season 3: 9 Days	3/30/20
Brooklyn Nine-Nine: Season 3: Hostage Situation	3/30/20
Brooklyn Nine-Nine: Season 3: Yippie Kayak	3/30/20
Brooklyn Nine-Nine: Season 3: The Swedes	3/30/20
Brooklyn Nine-Nine: Season 3: Ava	3/30/20
Brooklyn Nine-Nine: Season 3: The Mattress	3/29/20
Brooklyn Nine-Nine: Season 3: Into the Woods	3/29/20
Brooklyn Nine-Nine: Season 3: Halloween Part III	3/29/20
Brooklyn Nine-Nine: Season 3: The Oolong Slayer	3/29/20
Brooklyn Nine-Nine: Season 3: Boyle's Hunch	3/29/20
Brooklyn Nine-Nine: Season 3: The Funeral	3/29/20
Brooklyn Nine-Nine: Season 3: New Captain	3/29/20
Brooklyn Nine-Nine: Season 2: Johnny and Dora	3/28/20
Brooklyn Nine-Nine: Season 2: The Chopper	3/28/20
Brooklyn Nine-Nine: Season 2: Det. Dave Majors	3/28/20
Brooklyn Nine-Nine: Season 2: AC/DC	3/28/20
Brooklyn Nine-Nine: Season 2: Sabotage	3/28/20
Brooklyn Nine-Nine: Season 2: Captain Peralta	3/28/20
Mac & Devin Go to High School	3/28/20
Brooklyn Nine-Nine: Season 2: Boyle-Linetti Wedding	3/25/20
Brooklyn Nine-Nine: Season 2: The Wednesday Incident	3/25/20
Brooklyn Nine-Nine: Season 2: Windbreaker City	3/25/20
Brooklyn Nine-Nine: Season 2: The Defense Rests	3/25/20
Brooklyn Nine-Nine: Season 2: Payback	3/25/20
Brooklyn Nine-Nine: Season 2: Beach House	3/25/20
Brooklyn Nine-Nine: Season 2: Stakeout	3/25/20
Brooklyn Nine-Nine: Season 2: The Pontiac Bandit Returns	3/24/20
Brooklyn Nine-Nine: Season 2: The Road Trip	3/24/20
Brooklyn Nine-Nine: Season 2: USPIS	3/23/20
Brooklyn Nine-Nine: Season 2: Lockdown	3/23/20
Brooklyn Nine-Nine: Season 2: Jake and Sophia	3/23/20
Brooklyn Nine-Nine: Season 2: The Mole	3/23/20
Brooklyn Nine-Nine: Season 2: Halloween II	3/23/20
Brooklyn Nine-Nine: Season 2: The Jimmy Jab Games	3/23/20
Brooklyn Nine-Nine: Season 2: Chocolate Milk	3/23/20
Brooklyn Nine-Nine: Season 2: Undercover	3/23/20
Brooklyn Nine-Nine: Season 1: Charges and Specs	3/22/20
Brooklyn Nine-Nine: Season 1: Unsolvable	3/22/20
Brooklyn Nine-Nine: Season 1: Fancy Brudgom	3/22/20
Brooklyn Nine-Nine: Season 1: Tactical Village	3/22/20
Brooklyn Nine-Nine: Season 1: The Apartment	3/22/20
Brooklyn Nine-Nine: Season 1: Full Boyle	3/22/20
Brooklyn Nine-Nine: Season 1: The Party	3/22/20
Brooklyn Nine-Nine: Season 1: Operation: Broken Feather	3/22/20
Brooklyn Nine-Nine: Season 1: The Ebony Falcon	3/22/20
Brooklyn Nine-Nine: Season 1: The Bet	3/22/20
Brooklyn Nine-Nine: Season 1: Pontiac Bandit	3/22/20
Brooklyn Nine-Nine: Season 1: Christmas	3/22/20
Brooklyn Nine-Nine: Season 1: Thanksgiving	3/22/20
Brooklyn Nine-Nine: Season 1: Sal's Pizza	3/22/20
Brooklyn Nine-Nine: Season 1: Old School	3/22/20
Brooklyn Nine-Nine: Season 1: 48 Hours	3/22/20
Brooklyn Nine-Nine: Season 1: Halloween	3/22/20
Brooklyn Nine-Nine: Season 1: The Vulture	3/22/20
Brooklyn Nine-Nine: Season 1: M.E. Time	3/22/20
Brooklyn Nine-Nine: Season 1: The Slump	3/22/20
Brooklyn Nine-Nine: Season 1: The Tagger	3/22/20
Brooklyn Nine-Nine: Season 1: Pilot	3/22/20
Haikyu!!: The End & the Beginning	3/19/20
Peaky Blinders: Season 3: Episode 1	3/19/20
Peaky Blinders: Season 2: Episode 6	3/19/20
Peaky Blinders: Season 2: Episode 5	3/19/20
Peaky Blinders: Season 2: Episode 4	3/19/20
Peaky Blinders: Season 2: Episode 3	3/19/20
A Walk Among the Tombstones	3/19/20
Peaky Blinders: Season 2: Episode 2	3/17/20
Peaky Blinders: Season 2: Episode 1	3/17/20
Peaky Blinders: Season 1: Episode 6	3/17/20
Paradise PD: Part 1: Welcome to Paradise	3/12/20
Peaky Blinders: Season 1: Episode 5	3/11/20
Peaky Blinders: Season 1: Episode 4	3/11/20
Peaky Blinders: Season 1: Episode 3	3/11/20
Peaky Blinders: Season 1: Episode 2	3/11/20
Peaky Blinders: Season 1: Episode 1	3/11/20
Formula 1: Drive to Survive: Season 2: Checkered Flag	3/7/20
Formula 1: Drive to Survive: Season 2: Blood, Sweat & Tears	3/7/20
Formula 1: Drive to Survive: Season 2: Musical Chairs	3/4/20
Formula 1: Drive to Survive: Season 2: Seeing Red	3/3/20
Formula 1: Drive to Survive: Season 2: Raging Bulls	3/2/20
Formula 1: Drive to Survive: Season 2: Great Expectations	3/2/20
Formula 1: Drive to Survive: Season 2: Dark Days	3/2/20
Formula 1: Drive to Survive: Season 2: Dogfight	3/2/20
Formula 1: Drive to Survive: Season 2: Boiling Point	3/2/20
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
