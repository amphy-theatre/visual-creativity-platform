import React, { useState } from "react";
import QuoteCard from "./QuoteCard";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { useAuth } from "../context/AuthContext";
import { MONTHLY_PROMPT_LIMIT } from "../hooks/usePromptUsage";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useAnalytics } from "../hooks/useAnalytics";
import { useAppConfig } from "@/hooks/useAppConfig";

type PromptUsageType = {
  prompt_count: number;
  limit_reached: boolean;
  remaining: number;
  monthly_limit: number;
};

interface QuoteListProps {
  quotes: string[];
  isLoading: boolean;
  onRefresh: () => Promise<boolean>;
  mood: string;
  promptUsage: PromptUsageType | null;
  setShowLimitModal: (show: boolean) => void;
  setPromptUsage: (usage: PromptUsageType) => void;
}

const QuoteList: React.FC<QuoteListProps> = ({ 
  quotes, 
  isLoading, 
  onRefresh, 
  mood, 
  promptUsage,
  setShowLimitModal,
  setPromptUsage
}) => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const { userPreferences } = useUserPreferences();
  const { trackEvent } = useAnalytics();
  const config = useAppConfig();

  const handleQuoteSelection = async (quote: string) => {
    // Check if user has reached their monthly limit
    if (promptUsage?.limit_reached) {
      setShowLimitModal(true);
      return;
    }
    
    setIsLoadingRecommendations(true);
    
    try {
      // Generate movie recommendations first
      const response = await fetch(config.edgeFunctions.generateMovies, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || config.supabase.publishableKey}`
        },
        body: JSON.stringify({
          selectedQuote: quote,
          originalEmotion: mood,
          userPreferences: userPreferences,
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
      
      // Track the movie recommendations event
      trackEvent('movies_generated', {
        quote: quote,
        originalMood: mood,
        recommendedMovies: recommendations.movies.map((m: any) => m.title).join(', ')
      });
      
      // Only increment prompt count after successful movie generation
      if (user) {
        const { data: usageData, error: usageError } = await supabase.rpc('increment_prompt_count', { 
          uid: user.id,
          monthly_limit: MONTHLY_PROMPT_LIMIT
        });
        
        if (usageError) {
          throw new Error(`Failed to update prompt usage: ${usageError.message}`);
        }
        
        // Update local state with the new prompt usage
        setPromptUsage(usageData as PromptUsageType);
        
        // If the limit has been reached after this increment, show the modal but still navigate
        // since we already got the recommendations
        if ((usageData as PromptUsageType).limit_reached && (usageData as PromptUsageType).prompt_count > (promptUsage?.prompt_count || 0)) {
          setShowLimitModal(true);
        }
      }
      
      // Navigate to recommendations page with data
      navigate("/recommendations", { 
        state: { 
          selectedQuote: quote,
          recommendations: recommendations,
          mood: mood,
          promptUsage: promptUsage
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

  return (
    <div className="space-y-6">
      {isLoadingRecommendations ? (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mb-4" />
          <p className="text-foreground/80">Getting your personalized recommendations...</p>
        </div>
      ) : (
        <>
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
            className={`flex items-center justify-center space-x-2 w-full py-3 rounded-lg border border-foreground/20 text-foreground hover:bg-foreground/10 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={onRefresh}
            disabled={isLoading || (promptUsage?.limit_reached || false)}
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
        </>
      )}
    </div>
  );
};

export default QuoteList;
