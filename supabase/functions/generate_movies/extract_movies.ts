
import { Movie } from './types.ts';

export function extractMoviesFromResponse(response: string): Movie[] {
  if (!response || typeof response !== 'string') {
    return [];
  }

  // Split the response by numbered list items (1., 2., 3., etc.)
  const movieSections = response.split(/\n*\d+\.\s+/).filter(Boolean);
  
  const movies: Movie[] = [];
  
  movieSections.forEach(section => {
    // Extract movie title (first line of each section)
    const lines = section.trim().split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > 0) {
      // Trim the title and remove any "*" characters from the beginning and end
      const rawTitle = lines[0].trim();
      const title = rawTitle.replace(/^\*+|\*+$/g, '').trim();
      
      // Extract description (all remaining lines)
      const description = lines.slice(1).join(' ').trim();
      
      if (title) {
        // Create a movie object with title and description
        // Link and other properties will be added later by TMDB integration
        movies.push({
          title: title,
          description: description || `A film titled "${title}"`,
          link: '',
          // Initialize with empty streamingProviders array to prevent undefined errors
          streamingProviders: []
        });
      }
    }
  });
  
  // If we can't extract movies with the numbered list pattern, try a different approach
  if (movies.length === 0) {
    // Look for movie titles in quotes or in bold (e.g., **Title**)
    const titleMatches = response.match(/["']([^"']+)["']|\*\*([^\*]+)\*\*/g);
    
    if (titleMatches && titleMatches.length > 0) {
      titleMatches.slice(0, 3).forEach(match => {
        // Remove quotes, asterisks, and trim the title
        const rawTitle = match.replace(/["'\*]/g, '');
        const title = rawTitle.trim();
        
        movies.push({
          title: title,
          description: `A film titled "${title}"`,
          link: '',
          // Initialize with empty streamingProviders array to prevent undefined errors
          streamingProviders: []
        });
      });
    }
  }
  
  // If we still can't extract movies, try to find any capitalized phrases that might be titles
  if (movies.length === 0) {
    const lines = response.split('\n');
    
    for (const line of lines) {
      // Look for capitalized words that might be movie titles
      if (/^[A-Z][a-z]/.test(line.trim()) && movies.length < 3) {
        const possibleTitle = line.trim().split('.')[0];
        
        if (possibleTitle && possibleTitle.length > 3) {
          // Trim and remove any "*" characters
          const title = possibleTitle.replace(/^\*+|\*+$/g, '').trim();
          
          movies.push({
            title: title,
            description: `A film titled "${title}"`,
            link: '',
            // Initialize with empty streamingProviders array to prevent undefined errors
            streamingProviders: []
          });
        }
      }
    }
  }
  
  return movies;
}
