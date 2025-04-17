
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { usePromptUsage } from "@/hooks/usePromptUsage";
import PromptLimitModal from "./modals/PromptLimitModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAppConfig } from "@/hooks/useAppConfig";
import AnimatedText from "./AnimatedText";
import SubmitButton from "./SubmitButton";
import CSVUploader from "./CSVUploader";
import { phrases } from "../phrases";

interface MoodInputProps {
  initialValue?: string;
  seamlessInput?: boolean;
}

const MoodInput: React.FC<MoodInputProps> = ({ 
  initialValue = "", 
  seamlessInput = false 
}) => {
  const [mood, setMood] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, session, isGuestMode, isTrialUsed, setTrialUsed } = useAuth();
  const { trackEvent } = useAnalytics();
  const config = useAppConfig();
  const {
    promptUsage,
    showLimitModal,
    setShowLimitModal,
  } = usePromptUsage();
  
  const handleMoodChange = (value: string) => {
    setMood(value);
  };
  
  const handleSubmit = async () => {
    if (!mood.trim() && !csvData) {
      toast({
        title: "Input required",
        description: "Please enter your mood or upload a CSV file.",
        variant: "destructive",
      });
      return;
    }
    
    if (isGuestMode && isTrialUsed) {
      toast({
        title: "Free Trial Used",
        description: "Please sign in to get more movie recommendations.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isGuestMode && promptUsage.limit_reached) {
      setShowLimitModal(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (csvData && user) {
        const accessToken = session?.access_token;
        
        try {
          await fetch(config.edgeFunctions.summarizeCsv, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ 
              csvData: csvData
            }),
          });
        } catch (csvError) {
          console.error('Error processing CSV:', csvError);
        }
      }
      
      const moodText = mood.trim();
      
      if (moodText) {
        const response = await fetch(config.edgeFunctions.generateQuotes, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || config.supabase.publishableKey}`
          },
          body: JSON.stringify({ emotion: moodText }),
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          throw new Error(`Failed to generate quotes: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received quotes:', data);
        
        trackEvent('quotes_generated', {
          mood: moodText,
          source: 'custom_input',
          has_csv: csvData !== null
        });
        
        navigate("/quotes", { 
          state: { 
            mood: moodText, 
            quotes: data, 
            promptUsage: promptUsage
          }
        });
      } else {
        navigate("/quotes", { state: { mood: "Processing your data", quotes: { quotes: [] } } });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = ((!mood.trim() && !csvData) || isLoading || 
    (!isGuestMode && promptUsage.limit_reached) || 
    (isGuestMode && isTrialUsed));

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground relative">
        <div className="min-h-[120px] flex items-center justify-center">
          <AnimatedText
            initialValue={initialValue}
            texts={phrases}
            typingSpeed={80} 
            deletingSpeed={40} 
            delayBetweenTexts={2000}
            className="w-full"
            onChange={handleMoodChange}
            onSubmit={handleSubmit}
          />
        </div>
      </h1>
      <SubmitButton 
        onClick={handleSubmit}
        isLoading={isLoading}
        isDisabled={isButtonDisabled}
        remainingPrompts={promptUsage.remaining}
        showPromptCount={!isGuestMode}
      />
      
      <CSVUploader onCsvDataChange={setCsvData} />
      
      <PromptLimitModal
        open={showLimitModal}
        onOpenChange={setShowLimitModal}
        monthlyLimit={promptUsage.monthly_limit}
      />
    </div>
  );
};

export default MoodInput;