
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/ui/use-toast";
import { useAppConfig } from "./useAppConfig";

type PromptUsageType = {
  prompt_count: number;
  limit_reached: boolean;
  remaining: number;
  monthly_limit: number;
};

type QuotesType = {
  quotes?: {
    id: number;
    text: string;
  }[];
};

export const useQuotes = (initialQuotes: any, initialMood: string, initialPromptUsage: PromptUsageType | null) => {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState(initialMood);
  const [promptUsage, setPromptUsage] = useState<PromptUsageType | null>(initialPromptUsage);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { user, session } = useAuth();
  const config = useAppConfig();

  // Process quotes from the API response structure or use fallback quotes
  const displayQuotes = quotes && Array.isArray(quotes) && quotes.length > 0 ? 
    quotes : 
    [
      "Relief blooms where the weight of uncertainty once lay.",
      "Every ending carries the seeds of new beginnings.",
      "Bittersweet journeys shape our brightest horizons."
    ];

  const handleRefresh = async () => {
    setMood(mood);
    console.log(mood);
    if (!mood.trim()) {
      return false;
    }
    
    // Check if user has reached their monthly limit
    if (promptUsage?.limit_reached) {
      setShowLimitModal(true);
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // REMOVED: No longer incrementing prompt count for quote generation
      // We only increment prompt count when generating movies now
      
      const response = await fetch(config.edgeFunctions.generateQuotes, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || config.supabase.publishableKey}`
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
      setQuotes(data.quotes);
      return true;
    } catch (error) {
      console.error('Error regenerating quotes:', error);
      toast({
        title: "Error",
        description: "Failed to generate new quotes. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    quotes,
    displayQuotes,
    isLoading,
    promptUsage,
    showLimitModal,
    setShowLimitModal,
    handleRefresh,
    setPromptUsage
  };
};
