
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../integrations/supabase/client";
import { toast } from "../components/ui/use-toast";
import { MONTHLY_PROMPT_LIMIT } from "./usePromptUsage";

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

  // Process quotes from the API response structure or use fallback quotes
  const displayQuotes = quotes && quotes.quotes && Array.isArray(quotes.quotes) && quotes.quotes.length > 0 ? 
    quotes.quotes.map(q => q.text) : 
    [
      "Relief blooms where the weight of uncertainty once lay.",
      "Every ending carries the seeds of new beginnings.",
      "Bittersweet journeys shape our brightest horizons."
    ];

  const handleRefresh = async () => {
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
      // First increment the prompt count
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
        
        // If the limit has been reached, show the modal and abort
        if ((usageData as PromptUsageType).limit_reached && (usageData as PromptUsageType).prompt_count > (promptUsage?.prompt_count || 0)) {
          setShowLimitModal(true);
          setIsLoading(false);
          return false;
        }
      }
      
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate_quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28'}`
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
