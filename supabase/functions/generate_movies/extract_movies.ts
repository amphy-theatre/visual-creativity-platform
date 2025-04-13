
import { Movie } from './types.ts';

export function extractMoviesFromResponse(response: string): Movie[] {
  if (!response || typeof response !== 'string') {
    return [];
  }

  // Split the response by numbered list items (1., 2., 3., etc.) 
  // This improved regex matches the number at the beginning of a line
  const movieSections = response.split(/\n*\d+\.\s+/).filter(Boolean);
  
  const movies: Movie[] = [];
  
  movieSections.forEach(section => {
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
  });
  
  // If we still couldn't extract movies using the numbered list approach,
  // try to extract them another way as a fallback
  if (movies.length === 0) {
    // Look for lines with capitalized words that might be movie titles
    const lines = response.split('\n');
    let currentTitle = '';
    let currentDescription = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // If the line starts with a number followed by a period, it's likely a new movie
      if (/^\d+\./.test(trimmedLine)) {
        // Save the previous movie if we have one
        if (currentTitle && movies.length < 3) {
          movies.push({
            title: currentTitle,
            description: currentDescription || `A film titled "${currentTitle}"`,
            link: '',
            streamingProviders: []
          });
        }
        
        // Start a new movie, removing the number prefix
        currentTitle = trimmedLine.replace(/^\d+\.\s*/, '');
        currentDescription = '';
      } 
      // If this line doesn't start with a number and we have a title, it's part of the description
      else if (currentTitle) {
        if (currentDescription) {
          currentDescription += ' ' + trimmedLine;
        } else {
          currentDescription = trimmedLine;
        }
      }
      // If we don't have a title yet, this might be a title without a number
      else if (/^[A-Z]/.test(trimmedLine)) {
        currentTitle = trimmedLine;
      }
    }
    
    // Add the last movie if we have one
    if (currentTitle && movies.length < 3) {
      movies.push({
        title: currentTitle,
        description: currentDescription || `A film titled "${currentTitle}"`,
        link: '',
        streamingProviders: []
      });
    }
  }
  
  return movies;
}
