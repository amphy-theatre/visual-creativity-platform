
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import QuoteCard from "../components/QuoteCard";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

const QuoteSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mood, quotes } = location.state || { mood: "", quotes: [] };
  
  // Process quotes from the API response structure or use fallback quotes
  const displayQuotes = quotes && quotes.quotes && Array.isArray(quotes.quotes) && quotes.quotes.length > 0 ? 
    quotes.quotes.map(q => q.text) : 
    [
      "Relief blooms where the weight of uncertainty once lay.",
      "Every ending carries the seeds of new beginnings.",
      "Bittersweet journeys shape our brightest horizons."
    ];
  
  const handleQuoteSelection = (quote: string) => {
    navigate("/recommendations", { state: { selectedQuote: quote } });
  };
  
  const handleRefresh = () => {
    // In a real app, this would fetch new quotes
    console.log("Refreshing quotes");
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
            {displayQuotes.map((quote, index) => (
              <QuoteCard
                key={index}
                quote={quote}
                onClick={() => handleQuoteSelection(quote)}
              />
            ))}
          </div>
          
          <button 
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-lg border border-foreground/20 text-foreground hover:bg-foreground/10 transition-colors"
            onClick={handleRefresh}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2" />
              <path d="M16 12L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 9L16 12L13 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>None of these quotes resonate? Try again</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default QuoteSelection;
