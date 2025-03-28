import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import QuoteCard from "../components/QuoteCard";
import { Button } from "../components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "../components/ui/use-toast";

const QuoteSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mood, quotes: initialQuotes } = location.state || { mood: "", quotes: [] };
  const [quotes, setQuotes] = useState(initialQuotes);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // Process quotes from the API response structure or use fallback quotes
  const displayQuotes = quotes && quotes.quotes && Array.isArray(quotes.quotes) && quotes.quotes.length > 0 ? 
    quotes.quotes.map(q => q.text) : 
    [
      "Relief blooms where the weight of uncertainty once lay.",
      "Every ending carries the seeds of new beginnings.",
      "Bittersweet journeys shape our brightest horizons."
    ];
  
  const handleQuoteSelection = async (quote: string) => {
    setIsLoadingRecommendations(true);
    
    try {
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/movie-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28'}`
        },
        body: JSON.stringify({
          selectedQuote: quote,
          originalEmotion: mood,
          previousMovies: []
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to get movie recommendations: ${response.status} ${response.statusText}`);
      }

      // Parse the response
      const recommendations = await response.json();
      console.log('Received movie recommendations:', recommendations);
      
      // Navigate to recommendations page with data
      navigate("/recommendations", { 
        state: { 
          selectedQuote: quote,
          recommendations: recommendations,
          mood: mood
        } 
      });
    } catch (error) {
      console.error('Error getting movie recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to get movie recommendations. Please try again.",
        variant: "destructive",
      });
      setIsLoadingRecommendations(false);
    }
  };
  
  const handleRefresh = async () => {
    if (!mood.trim()) {
      navigate("/");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28'}`
        },
        body: JSON.stringify({ emotion: mood }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to generate quotes: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const data = await response.json();
      console.log('Received new quotes:', data);
      
      // Update quotes state with the new data
      setQuotes(data);
    } catch (error) {
      console.error('Error regenerating quotes:', error);
      toast({
        title: "Error",
        description: "Failed to generate new quotes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToInput = () => {
    navigate("/");
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="text-foreground/70 hover:text-foreground transition-colors p-0 flex items-center gap-2"
            onClick={handleBackToInput}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Input
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="italic text-center text-xl text-foreground/80 max-w-full mx-auto px-4 overflow-hidden break-words">
            "{mood}"
          </div>
          
          <h1 className="text-3xl font-bold text-center text-foreground">
            Choose a quote that resonates with you
          </h1>
          
          <div className="space-y-4">
            {isLoadingRecommendations ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mb-4" />
                <p className="text-foreground/80">Getting your personalized recommendations...</p>
              </div>
            ) : (
              displayQuotes.map((quote, index) => (
                <QuoteCard
                  key={index}
                  quote={quote}
                  onClick={() => handleQuoteSelection(quote)}
                />
              ))
            )}
          </div>
          
          {!isLoadingRecommendations && (
            <button 
              className={`flex items-center justify-center space-x-2 w-full py-3 rounded-lg border border-foreground/20 text-foreground hover:bg-foreground/10 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Generating new quotes...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  <span>None of these quotes resonate? Try again</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuoteSelection;
