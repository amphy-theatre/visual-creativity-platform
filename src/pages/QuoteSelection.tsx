import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import QuoteCard from "../components/QuoteCard";
import { Button } from "../components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "../components/ui/use-toast";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";

type PromptUsageType = {
  prompt_count: number;
  limit_reached: boolean;
  remaining: number;
  monthly_limit: number;
};

const QuoteSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mood, quotes: initialQuotes, promptUsage: initialPromptUsage } = location.state || { mood: "", quotes: [], promptUsage: null };
  const [quotes, setQuotes] = useState(initialQuotes);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string | null>(null);
  const [promptUsage, setPromptUsage] = useState<PromptUsageType | null>(initialPromptUsage);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { user } = useAuth();
  
  // If we don't have prompt usage data, fetch it
  useEffect(() => {
    const fetchPromptUsage = async () => {
      if (!user || promptUsage) return;
      
      try {
        const { data, error } = await supabase.rpc('get_prompt_usage', { 
          uid: user.id,
          monthly_limit: 5 // Using the same limit as in MoodInput
        });
        
        if (error) {
          console.error('Error fetching prompt usage:', error);
          return;
        }
        
        // Type assertion to ensure the data matches our expected structure
        setPromptUsage(data as PromptUsageType);
        
        if ((data as PromptUsageType).limit_reached) {
          setShowLimitModal(true);
        }
      } catch (err) {
        console.error('Failed to fetch prompt usage:', err);
      }
    };
    
    fetchPromptUsage();
  }, [user, promptUsage]);
  
  // Fetch user preferences from file summaries when component mounts
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('file_summaries')
          .select('summary')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.log('No file summaries found or error:', error);
          return;
        }
        
        if (data) {
          console.log('Found user preferences from file summary:', data.summary);
          setUserPreferences(data.summary);
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    
    fetchUserPreferences();
  }, [user]);
  
  // Process quotes from the API response structure or use fallback quotes
  const displayQuotes = quotes && quotes.quotes && Array.isArray(quotes.quotes) && quotes.quotes.length > 0 ? 
    quotes.quotes.map(q => q.text) : 
    [
      "Relief blooms where the weight of uncertainty once lay.",
      "Every ending carries the seeds of new beginnings.",
      "Bittersweet journeys shape our brightest horizons."
    ];
  
  const handleQuoteSelection = async (quote: string) => {
    // Check if user has reached their monthly limit
    if (promptUsage?.limit_reached) {
      setShowLimitModal(true);
      return;
    }
    
    setIsLoadingRecommendations(true);
    
    try {
      // First increment the prompt count
      if (user) {
        const { data: usageData, error: usageError } = await supabase.rpc('increment_prompt_count', { 
          uid: user.id,
          monthly_limit: 5 // Using the same limit as in MoodInput
        });
        
        if (usageError) {
          throw new Error(`Failed to update prompt usage: ${usageError.message}`);
        }
        
        // Update local state with the new prompt usage
        setPromptUsage(usageData as PromptUsageType);
        
        // If the limit has been reached, show the modal and abort
        if ((usageData as PromptUsageType).limit_reached && (usageData as PromptUsageType).prompt_count > (promptUsage?.prompt_count || 0)) {
          setShowLimitModal(true);
          setIsLoadingRecommendations(false);
          return;
        }
      }
      
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate_movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28'}`
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
  
  const handleRefresh = async () => {
    if (!mood.trim()) {
      navigate("/");
      return;
    }
    
    // Check if user has reached their monthly limit
    if (promptUsage?.limit_reached) {
      setShowLimitModal(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First increment the prompt count
      if (user) {
        const { data: usageData, error: usageError } = await supabase.rpc('increment_prompt_count', { 
          uid: user.id,
          monthly_limit: 5 // Using the same limit as in MoodInput
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
          return;
        }
      }
      
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate_quotes', {
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
  
  const closeModal = () => setShowLimitModal(false);
  
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
          )}
        </div>
      </div>
      
      {/* Monthly Limit Modal */}
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Monthly Limit Reached</DialogTitle>
            <DialogDescription>
              You've used all {promptUsage?.monthly_limit || 5} prompts available for this month. 
              Your limit will reset at the beginning of next month.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={closeModal}>
              I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default QuoteSelection;
