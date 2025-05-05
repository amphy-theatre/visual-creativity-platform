
import { Movie } from './types.ts';

export function extractMoviesFromResponse(response: string): Movie[] {
  if (!response || typeof response !== 'string') {
    console.log('Invalid response received:', response);
    return [];
  }

  try {
    // Clean the response string - remove any potential issues that might break JSON parsing
    let cleanedResponse = response;
    
    // Remove URL citations that might contain unescaped quotes
    cleanedResponse = cleanedResponse.replace(/\[\([^)]*\)\]/g, '');
    cleanedResponse = cleanedResponse.replace(/\([^)]*\)/g, '');
    
    // Remove URL patterns that might break JSON parsing
    cleanedResponse = cleanedResponse.replace(/https?:\/\/\S+/g, '');
    
    // Try to parse the cleaned JSON
    console.log('Attempting to parse cleaned JSON response');
    const parsedData = JSON.parse(cleanedResponse);
    console.log(parsedData)
    // Check if the expected structure exists
    if (parsedData && parsedData.items && Array.isArray(parsedData.items)) {
      const movies: Movie[] = parsedData.items.map((item: any) => ({
        title: item.title ? String(item.title).trim() : '',
        release_year: item.release_year ? String(item.release_year).trim() : '',
        description: item.description ? String(item.description).trim() : '',
        link: '',
        streamingProviders: []
      }));
      
      console.log(`Successfully extracted ${movies.length} movies from JSON structure`);
      return movies;
    }
    
    console.log('JSON did not contain expected "items" array structure, using fallback extraction');
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    console.log('Falling back to regex extraction methods');
  }

  // Fallback to regex extraction if JSON parsing fails
  try {
    // First, try to extract movie data with regex
    const movies: Movie[] = [];
    const movieTitleRegex = /"title":\s*"([^"]+)"/g;
    const releaseYearRegex = /"release_year":\s*"([^"]+)"/g;
    const movieDescriptionRegex = /"description":\s*"([^"]+)"/g;
    
    const titles: string[] = [];
    const release_years: string[] = [];
    const descriptions: string[] = [];
    
    // Extract all titles
    let titleMatch;
    while ((titleMatch = movieTitleRegex.exec(response)) !== null) {
      titles.push(titleMatch[1].trim());
    }
    
    // Extract all titles
    let releaseMatch;
    while ((releaseMatch = releaseYearRegex.exec(response)) !== null) {
      release_years.push(releaseMatch[1].trim());
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
        release_year: release_years[i].replace(/\\"/g, '"'),
        description: descriptions[i].replace(/\\"/g, '"')
          .replace(/\[\([^)]*\)\]/g, '') // Remove citations like [(example.com)]
          .replace(/\([^)]*\)/g, '')     // Remove citations like (example.com)
          .replace(/https?:\/\/\S+/g, ''), // Remove URLs
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
            release_year: "1234",
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
