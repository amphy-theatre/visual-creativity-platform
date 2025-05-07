import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from "npm:openai";
import { debug } from "../_utils/debug.ts";

const debugLog = debug("generate_quote");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
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

    debugLog('Generating quotes for emotion:', sanitizedEmotion);
    
    const openai = new OpenAI({apiKey: Deno.env.get('OPENAI_API_KEY')});

    const openAIData = await openai.responses.create({
        model: "gpt-4.1-nano",
        tools: [],
        instructions: 'Generate EXACTLY THREE complete, meaningful quotes from movies (without attribution) based on the unique interpretations of the emotional content and meaning of the prompt. Each quote should be concise (under 100 characters) but ensure they are complete thoughts.',
        input: `The user is feeling: ${sanitizedEmotion}. Provide 3 quotes from movies (9 to 15 words) that might resonate with this emotional state.`,
        temperature: 1.2,
        max_output_tokens: 250,
        text: {
          format: {
            type: "json_schema",
            name: "movie_quotes",
            schema: {
              type: "object",
              properties: {
                quotes: {
                  type: "array",
                  items: {
                    type: "string",
                    description: "A complete movie quote without attribution"
                  },
                }
              },
              required: ["quotes"],
              additionalProperties: false
            }
          }
        }
    });

    if (!openAIData.output?.filter(op => op?.type == "message")[0].content[0].text) {
      throw new Error('Invalid response from OpenAI API');
    }

    const content = openAIData.output?.filter(op => op?.type == "message")[0].content[0].text;
    
    // Parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      throw new Error('Invalid JSON response from OpenAI API');
    }

    if (!parsedContent.quotes || !Array.isArray(parsedContent.quotes)) {
      throw new Error('Invalid response format from OpenAI API');
    }

    // Clean up quotes: remove quotes and any author attribution
    const quotes = parsedContent.quotes.map((quote: string) => {
      // Remove quotes if present
      let cleaned = quote.replace(/^["']|["']$/g, '');
      // Remove any author attribution
      cleaned = cleaned.replace(/\s*[-–—]\s*.*$/, '');
      return cleaned.trim();
    });

    // Ensure we have exactly 3 quotes
    while (quotes.length < 3) {
      quotes.push([
        "Rest is not a luxury, it is a necessity.",
        "Sometimes, the most productive thing you can do is to take a break.",
        "In the silence of rest, we find the strength to rise again."
      ][quotes.length]);
    }
    
    // Limit to exactly 3 quotes
    const finalQuotes = quotes.slice(0, 3).map((text, index) => ({
      id: index + 1,
      text
    }));

    return new Response(
      JSON.stringify({ finalQuotes }),
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
