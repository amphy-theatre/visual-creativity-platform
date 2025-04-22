
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import QuoteList from "../components/QuoteList";
import { useQuotes } from "../hooks/useQuotes";
import PromptLimitModal from "../components/modals/PromptLimitModal";
import { MONTHLY_PROMPT_LIMIT } from "../hooks/usePromptUsage";
import FreeTrialBanner from "../components/FreeTrialBanner";

type PromptUsageType = {
  prompt_count: number;
  limit_reached: boolean;
  remaining: number;
  monthly_limit: number;
};

const QuoteSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mood: initialMood, quotes: initialQuotes, promptUsage: initialPromptUsage } = location.state || { mood: "", quotes: [], promptUsage: null };
  const { user, isGuestMode, isTrialUsed } = useAuth();
  
  const {
    displayQuotes,
    isLoading,
    promptUsage,
    showLimitModal,
    setShowLimitModal,
    handleRefresh,
    setPromptUsage
  } = useQuotes(initialQuotes, initialMood, initialPromptUsage);
  
  useEffect(() => {
    const fetchPromptUsage = async () => {
      if (!user || promptUsage) return;
      
      try {
        const { data, error } = await supabase.rpc('get_prompt_usage', { 
          uid: user.id,
          monthly_limit: MONTHLY_PROMPT_LIMIT
        });
        
        if (error) {
          console.error('Error fetching prompt usage:', error);
          return;
        }
        
        setPromptUsage(data as PromptUsageType);
        
        if ((data as PromptUsageType).limit_reached) {
          setShowLimitModal(true);
        }
      } catch (err) {
        console.error('Failed to fetch prompt usage:', err);
      }
    };
    
    fetchPromptUsage();
  }, [user, promptUsage, setPromptUsage]);

  const handleBackToInput = () => {
    navigate("/");
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        {isGuestMode && isTrialUsed && <FreeTrialBanner />}
        
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
          />
        </div>
      </div>
      
      <PromptLimitModal
        open={showLimitModal}
        onOpenChange={setShowLimitModal}
        monthlyLimit={promptUsage?.monthly_limit || MONTHLY_PROMPT_LIMIT}
      />
    </Layout>
  );
};

export default QuoteSelection;
