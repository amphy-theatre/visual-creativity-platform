
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from "npm:openai";

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
    // Parse and validate the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      throw new Error('Invalid JSON in request body');
    }

    const { emotion } = requestData;
    
    // Input validation
    if (!emotion) {
      throw new Error('Emotion is required');
    }
    
    // Sanitize input - trim and ensure it's a string
    const sanitizedEmotion = String(emotion).trim();
    
    // Add length limitation to prevent excessively long inputs
    if (sanitizedEmotion.length > 500) {
      throw new Error('Emotion text is too long (maximum 500 characters)');
    }

    // Check for empty input after trimming
    if (sanitizedEmotion === '') {
      throw new Error('Emotion cannot be empty');
    }

    console.log('Generating quotes for emotion:', sanitizedEmotion);
    
    const openai = new OpenAI({apiKey: Deno.env.get('OPENAI_API_KEY')});

    const openAIData = await openai.responses.create({
        model: "gpt-4o-mini",
        tools: [],
        instructions: 'Generate exactly 3 complete, meaningful movie quotes (without attribution) based on the unique interpretations of the emotional content and meaning of the prompt. Each quote should be on its own line with no numbering. Keep quotes concise (under 100 characters each) but ensure they are complete thoughts.',
        input: `The user is feeling: ${sanitizedEmotion}. Provide 3 movie quotes (9 to 15 words) that might resonate with this emotional state.`,
        temperature: 1.2,
        max_output_tokens: 250,
    });

    if (!openAIData.output?.filter(op => op?.type == "message")[0].content.text) {
      throw new Error('Invalid response from OpenAI API');
    }

    const content = openAIData.output?.filter(op => op?.type == "message")[0].content.text;
    
    // Split by newlines and filter empty lines
    let quoteLines = content.split('\n').filter(line => line.trim() !== '');
    
    // Clean up quotes: remove numbering and quotes
    quoteLines = quoteLines.map(line => {
      // Remove numbering (e.g., "1.", "1)", etc.)
      let cleaned = line.replace(/^\d+[\.\)\-]?\s*/, '');
      // Remove quotes if present
      cleaned = cleaned.replace(/^["']|["']$/g, '');
      // Remove any author attribution
      cleaned = cleaned.replace(/\s*[-–—]\s*.*$/, '');
      return cleaned.trim();
    });
    
    // Ensure we have exactly 3 quotes
    // If we have more, combine them to ensure we don't split quotes
    const finalQuotes = [];
    
    // Try to intelligently combine potentially split quotes
    if (quoteLines.length > 3) {
      // Look for incomplete sentences or quotes that might be continuations
      for (let i = 0; i < quoteLines.length; i++) {
        const current = quoteLines[i];
        
        // If this is the start of a new quote (starts with capital letter)
        if (i === 0 || /^[A-Z]/.test(current)) {
          finalQuotes.push(current);
        } else {
          // This might be a continuation of the previous quote
          const lastIndex = finalQuotes.length - 1;
          if (lastIndex >= 0) {
            // Check if the previous quote ends with punctuation
            if (/[.!?]$/.test(finalQuotes[lastIndex])) {
              // Previous quote seems complete, add this as a new one
              finalQuotes.push(current);
            } else {
              // Combine with previous quote
              finalQuotes[lastIndex] += ' ' + current;
            }
          } else {
            finalQuotes.push(current);
          }
        }
      }
    } else {
      // If we have 3 or fewer quotes, use them as is
      finalQuotes.push(...quoteLines);
    }
    
    // Ensure we have exactly 3 quotes
    while (finalQuotes.length < 3) {
      finalQuotes.push([
        "Rest is not a luxury, it is a necessity.",
        "Sometimes, the most productive thing you can do is to take a break.",
        "In the silence of rest, we find the strength to rise again."
      ][finalQuotes.length]);
    }
    
    // Limit to exactly 3 quotes
    const quotes = finalQuotes.slice(0, 3).map((text, index) => ({
      id: index + 1,
      text
    }));

    return new Response(
      JSON.stringify({ quotes }),
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