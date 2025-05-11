import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { debug } from "../_utils/debug.ts";

const debugLog = debug("movie_tmdb");

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Search for a movie by title and return basic info
async function getMovieDetails(tmdbId: string): Promise<any> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&include_adult=false`,
    );
    
    if (!response.ok) {
      console.error(`TMDB movie search failed for "${tmdbId}": ${response.status}`);
      return null;
    }
    const data = await response.json();
    console.log(data)
    if (!data) return null;

    const castResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}&include_adult=false`,
    );

    if (!castResponse.ok) {
        console.error(`TMDB cast search failed for "${tmdbId}": ${castResponse.status}`);
        return null;
    }
 
    const castCrew = await castResponse.json();
    console.log(castCrew)
    if (!castCrew) return null;

    const videoResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}&include_adult=false`,
    );

    if (!videoResponse.ok) {
        console.error(`TMDB video search failed for "${tmdbId}": ${videoResponse.status}`);
        return null;
    }

    const video = await videoResponse.json();
    console.log(video)
    if (!video) return null;

    const crew = castCrew.crew;
    const directors = crew.filter((person: any) => person.job === "Director").map(person => person.name);
    const leads = castCrew.cast.slice(0,5).map(person => person.name);
    const videoLink = video.results.filter(vid => vid.type == "Trailer")[0].key;
    const posterUrl = data.poster_path 
      ? `https://image.tmdb.org/t/p/original${data.poster_path}`
      : "https://picsum.photos/800/600";

    return {
        title: data.title,
        overview: data.overview,
        genres: data.genres.map(genre => genre.name),
        runtime: data.runtime,
        directors: directors,
        starring: leads,
        video: videoLink,
        backdrop: posterUrl,
    }
  } catch (error) {
    console.error(`Error searching for movie "${tmdbId}":`, error);
    return null;
  }
}

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
    const { tmdbId } = await req.json();
    const movies = await getMovieDetails(tmdbId);
    console.log(movies);
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
