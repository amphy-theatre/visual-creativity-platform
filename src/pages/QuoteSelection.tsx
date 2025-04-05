
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { ArrowLeft, LogIn } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import QuoteList from "../components/QuoteList";
import { useQuotes } from "../hooks/useQuotes";
import PromptLimitModal from "../components/modals/PromptLimitModal";

type PromptUsageType = {
  prompt_count: number;
  limit_reached: boolean;
  remaining: number;
  monthly_limit: number;
};

const QuoteSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    mood: initialMood, 
    quotes: initialQuotes, 
    promptUsage: initialPromptUsage,
    isGuest = false,
    allowedRefresh = false
  } = location.state || { 
    mood: "", 
    quotes: [], 
    promptUsage: null,
    isGuest: false,
    allowedRefresh: false
  };
  const { user } = useAuth();
  
  const {
    displayQuotes,
    isLoading,
    promptUsage,
    showLimitModal,
    setShowLimitModal,
    handleRefresh,
    setPromptUsage,
    allowedRefresh: canRefresh
  } = useQuotes(initialQuotes, initialMood, initialPromptUsage, isGuest, allowedRefresh);
  
  // If we don't have prompt usage data and user is logged in, fetch it
  useEffect(() => {
    const fetchPromptUsage = async () => {
      if (!user || promptUsage || isGuest) return;
      
      try {
        const { data, error } = await supabase.rpc('get_prompt_usage', { 
          uid: user.id,
          monthly_limit: 5
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
  }, [user, promptUsage, setPromptUsage, isGuest]);

  const handleBackToInput = () => {
    navigate(isGuest ? "/guest" : "/");
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-foreground/70 hover:text-foreground transition-colors p-0 flex items-center gap-2"
            onClick={handleBackToInput}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Input
          </Button>
          
          {isGuest && (
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate("/auth")}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="italic text-center text-xl text-foreground/80 max-w-full mx-auto px-4 overflow-hidden break-words">
            "{initialMood}"
          </div>
          
          <h1 className="text-3xl font-bold text-center text-foreground">
            Choose a quote that resonates with you
          </h1>
          
          <QuoteList
            quotes={displayQuotes}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            mood={initialMood}
            promptUsage={promptUsage}
            setShowLimitModal={setShowLimitModal}
            setPromptUsage={setPromptUsage}
            isGuest={isGuest}
            allowedRefresh={canRefresh}
          />
        </div>
      </div>
      
      {isGuest ? (
        <div className="mt-12 border-t pt-6 text-center">
          <p className="text-muted-foreground mb-3">
            Create an account for unlimited quotes and personalized recommendations
          </p>
          <Button 
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign up now
          </Button>
        </div>
      ) : (
        <PromptLimitModal
          open={showLimitModal}
          onOpenChange={setShowLimitModal}
          monthlyLimit={promptUsage?.monthly_limit || 5}
        />
      )}
    </Layout>
  );
};

export default QuoteSelection;
