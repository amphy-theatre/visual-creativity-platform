import { Movie, StreamingProvider } from './types.ts';
import { getProviderLogoUrl } from './providers.ts';
import { debug } from "../_utils/debug.ts";

const debugLog = debug("movie_tmdb");

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Search for a movie by title and return basic info
async function searchMovie(title: string, release_year: string): Promise<any> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&include_adult=false`,
    );
    
    if (!response.ok) {
      console.error(`TMDB search failed for "${title}": ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if(!data || !data.results || !(data.results.length > 0)) return null;
    const movies = data.results;
    debugLog(movies);

    for (const movie of movies) {
      if (movie.release_date) {
        const movieYear = Number(movie.release_date.split('-')[0]);
        const diff = movieYear - Number(release_year);
        if (diff * diff < 2) {
          return movie;
        }
      }
    }
  } catch (error) {
    console.error(`Error searching for movie "${title}":`, error);
    return null;
  }
  return null;
}

// Get IMDb rating for a movie
async function getMovieRating(movieId: number): Promise<number | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.vote_average || null;
  } catch (error) {
    console.error(`Error getting rating for movie ID ${movieId}:`, error);
    return null;
  }
}

// Get streaming providers for a movie with priority for Canadian providers
async function getMovieProviders(movieId: number, movieTitle: string): Promise<StreamingProvider[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`,
    );
    
    if (!response.ok) {
      console.error(`Failed to get providers for movie ID ${movieId}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    // Focus on Canadian providers first
    const results = data.results || {};
    const caProviders = results.CA?.flatrate || results.CA?.rent || [];
    
    if (caProviders.length > 0) {
      return mapProvidersData(caProviders, movieId, movieTitle);
    }
    
    // Fall back to US or any available region if no Canadian providers
    if (results.US?.flatrate?.length > 0) {
      return mapProvidersData(results.US.flatrate, movieId, movieTitle);
    }
    
    if (results.US?.rent?.length > 0) {
      return mapProvidersData(results.US.rent, movieId, movieTitle);
    }
    
    // Try to get providers from any available region as last resort
    for (const region in results) {
      if (results[region].flatrate?.length > 0) {
        return mapProvidersData(results[region].flatrate, movieId, movieTitle);
      }
      if (results[region].rent?.length > 0) {
        return mapProvidersData(results[region].rent, movieId, movieTitle);
      }
    }
    
    return [];
  } catch (error) {
    console.error(`Error getting providers for movie ID ${movieId}:`, error);
    return [];
  }
}

// Map provider data from TMDB format to our format
function mapProvidersData(providers: any[], movieId: number, movieTitle: string): StreamingProvider[] {
  if (!providers || !Array.isArray(providers)) {
    return [];
  }
  
  return providers.slice(0, 3).map(provider => {
    // Generate direct provider URL with the movie title
    const providerName = provider.provider_name;
    let url = '';
    
    // Define provider-specific deep links
    const providerDeepLinks: Record<string, string> = {
      'Netflix': `https://www.netflix.com/search?q=${encodeURIComponent(movieTitle)}`,
      'Disney Plus': `https://www.disneyplus.com/search?q=${encodeURIComponent(movieTitle)}`,
      'Amazon Prime Video': `https://www.primevideo.com/search/ref=atv_sr_sug_4?phrase=${encodeURIComponent(movieTitle)}`,
      'Crave': `https://www.crave.ca/search?q=${encodeURIComponent(movieTitle)}`,
      'Apple TV': `https://tv.apple.com/search?term=${encodeURIComponent(movieTitle)}`,
      'CBC Gem': `https://gem.cbc.ca/search?q=${encodeURIComponent(movieTitle)}`
    };
    
    // Use direct provider link if available, otherwise use TMDB watch page
    url = providerDeepLinks[providerName] || 
          `https://www.themoviedb.org/movie/${movieId}/watch?locale=CA`;
    
    return {
      name: providerName,
      url: url,
      logoUrl: provider.logo_path 
        ? `https://image.tmdb.org/t/p/original${provider.logo_path}`
        : getProviderLogoUrl(providerName)
    };
  });
}

// Enrich movies with TMDB data
export async function enrichMoviesWithTMDBData(movies: Movie[]): Promise<Movie[]> {
  const enrichedMovies: Movie[] = [];
  
  for (const movie of movies) {
    try {
      // Make sure the title is clean before searching
      const cleanTitle = movie.title.replace(/^\*+|\*+$/g, '').trim();
      const cleanRelease = movie.release_year.trim();
      
      // Find the movie in TMDB
      const tmdbMovie = await searchMovie(cleanTitle, cleanRelease);
      
      if (tmdbMovie) {
        // Get streaming providers
        const providers = await getMovieProviders(tmdbMovie.id, movie.title);
        
        // Get movie rating
        const rating = await getMovieRating(tmdbMovie.id);
        
        // Create TMDB link
        const tmdbLink = `https://www.themoviedb.org/movie/${tmdbMovie.id}`;
        
        // Get poster URL (if available)
        const posterUrl = tmdbMovie.poster_path 
          ? `https://image.tmdb.org/t/p/original${tmdbMovie.poster_path}`
          : undefined;
        
        enrichedMovies.push({
          ...movie,
          title: cleanTitle, // Use the clean title
          link: tmdbLink,
          posterUrl: posterUrl,
          streamingProviders: providers.length > 0 ? providers : undefined,
          rating: rating
        });
      } else {
        // If no TMDB data, keep original movie but add placeholder link
        enrichedMovies.push({
          ...movie,
          title: cleanTitle, // Use the clean title
          link: `https://www.google.com/search?q=${encodeURIComponent(cleanTitle)}+movie+watch+canada`,
        });
      }
    } catch (error) {
      console.error(`Error enriching movie "${movie.title}":`, error);
      // Keep original movie in case of error
      enrichedMovies.push(movie);
    }
  }
  
  return enrichedMovies;
}
