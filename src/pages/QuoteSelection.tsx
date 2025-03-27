
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import QuoteCard from "../components/QuoteCard";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

const QuoteSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mood } = location.state || { mood: "" };
  
  const quotes = [
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
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-2">
            <span className="text-xs text-secondary-foreground">1</span>
          </div>
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
          <div className="italic text-center text-xl text-foreground/80">
            "{mood}"
          </div>
          
          <h1 className="text-3xl font-bold text-center text-foreground">
            Choose a quote that resonates with you
          </h1>
          
          <div className="space-y-4">
            {quotes.map((quote, index) => (
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
