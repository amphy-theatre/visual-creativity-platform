import { Movie } from './types';

// Helper function to clean text formatting and remove links
export function cleanTextFormatting(text: string): string {
  // Remove asterisks, stars, quotes
  let cleaned = text.replace(/[*'"]/g, '').trim();
  
  // Remove URLs, markdown links, and citation-style links
  cleaned = cleaned.replace(/\bhttps?:\/\/\S+\b/gi, ''); // Remove URLs
  cleaned = cleaned.replace(/\[\s*.*?\s*\]\s*\(.*?\)/g, ''); // Remove markdown links [text](url)
  cleaned = cleaned.replace(/\[\s*.*?\s*\]/g, ''); // Remove citation-style links [text]
  cleaned = cleaned.replace(/\(\s*https?:\/\/.*?\s*\)/g, ''); // Remove parenthesized URLs (url)
  cleaned = cleaned.replace(/\(\s*http.*?\s*\)/g, ''); // Remove parenthesized URLs with text
  
  // Remove any trailing parentheses or brackets that might be left
  cleaned = cleaned.replace(/\s*\(([^)]*)\)\s*$/g, ''); 
  cleaned = cleaned.replace(/\s*\[([^\]]*)\]\s*$/g, '');
  
  // Remove any reference to "source:" or "according to"
  cleaned = cleaned.replace(/\b(?:according to|source:).*$/gi, '');
  
  return cleaned.trim();
}

// Helper function to extract movies from OpenAI response
export function extractMoviesFromResponse(content: string): Movie[] {
  console.log("Extracting movies from content:", content);
  
  const movies: Movie[] = [];
  const numberPattern = /\d+\.\s+/;
  
  // First try to split by numbered sections (1., 2., 3.)
  let sections = content.split(numberPattern).filter(Boolean);
  
  // If we don't have enough sections, try alternative parsing
  if (sections.length < 3) {
    // Try to split by double newlines which often separate movies
    sections = content.split(/\n\n+/).filter(Boolean);
  }
  
  // Process sections into movie objects
  for (const section of sections) {
    const lines = section.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length >= 2) {
      // First line is typically the title
      let title = cleanTextFormatting(lines[0]);
      
      // Remove "Title:" prefix if present
      title = title.replace(/^Title:\s*/i, '');
      
      // Extract description (combine all lines after the title)
      let description = '';
      
      // If there's a line with "Description:", use that
      let descriptionIndex = -1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('description:')) {
          descriptionIndex = i;
          break;
        }
      }
      
      if (descriptionIndex > 0) {
        description = cleanTextFormatting(lines[descriptionIndex].replace(/^Description:\s*/i, ''));
      } else {
        // Otherwise, combine all lines after the title into the description
        description = lines.slice(1).map(line => cleanTextFormatting(line)).join(' ');
      }
      
      // We'll populate these fields later with TMDB data
      movies.push({
        title,
        description: description || `A film that resonates with themes from the quote.`,
        link: '' // Will be populated with TMDB link
      });
    }
  }
  
  return movies;
}