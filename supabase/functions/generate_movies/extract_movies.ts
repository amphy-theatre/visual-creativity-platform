
import { Movie } from './types.ts';

export function extractMoviesFromResponse(response: string): Movie[] {
  if (!response || typeof response !== 'string') {
    return [];
  }

  try {
    // First, try to directly extract movie data without JSON parsing
    const movies: Movie[] = [];
    const movieTitleRegex = /"title":\s*"([^"]+)"/g;
    const movieDescriptionRegex = /"description":\s*"([^"]+)"/g;
    
    const titles: string[] = [];
    const descriptions: string[] = [];
    
    // Extract all titles
    let titleMatch;
    while ((titleMatch = movieTitleRegex.exec(response)) !== null) {
      titles.push(titleMatch[1].trim());
    }
    
    // Extract all descriptions
    let descMatch;
    while ((descMatch = movieDescriptionRegex.exec(response)) !== null) {
      descriptions.push(descMatch[1].trim());
    }
    
    // Create movie objects from extracted titles and descriptions
    for (let i = 0; i < Math.min(titles.length, descriptions.length); i++) {
      movies.push({
        title: titles[i].replace(/\\"/g, '"'),
        description: descriptions[i].replace(/\\"/g, '"'),
        link: '',
        streamingProviders: []
      });
    }
    
    console.log(`Extracted ${movies.length} movies using regex`);
    
    // If we successfully extracted movies with regex, return them
    if (movies.length > 0) {
      return movies;
    }
    
    // Fall back to split-based approach as a last resort
    // Split the response by numbered list items (1., 2., 3., etc.) 
    const movieSections = response.split(/\n*\d+\.\s+/).filter(Boolean);
    
    for (const section of movieSections) {
      // Split the section into lines
      const lines = section.trim().split('\n').filter(line => line.trim() !== '');
      
      if (lines.length > 0) {
        // First line is the title
        const title = lines[0].trim();
        
        // All remaining lines form the description
        const description = lines.slice(1).join(' ').trim();
        
        if (title) {
          movies.push({
            title: title,
            description: description || `A film titled "${title}"`,
            link: '',
            streamingProviders: []
          });
        }
      }
    }
    
    console.log(`Extracted ${movies.length} movies using fallback method`);
    return movies;
  } catch (error) {
    console.error('Error extracting movies from response:', error);
    return [];
  }
}
