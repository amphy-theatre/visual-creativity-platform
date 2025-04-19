
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { usePromptUsage } from "@/hooks/usePromptUsage";
import PromptLimitModal from "./modals/PromptLimitModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAppConfig } from "@/hooks/useAppConfig";
import SubmitButton from "./SubmitButton";
import CSVUploader from "./CSVUploader";
import TextAreaInput from "./TextAreaInput";

interface MoodInputProps {
  initialValue?: string;
}

const MoodInput: React.FC<MoodInputProps> = ({ 
  initialValue = "", 
}) => {
  const [mood, setMood] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    setIsAnalyzing(true);
    
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
        // First analyze the prompt to determine if it's figurative or literal
        const analyzeResponse = await fetch(config.edgeFunctions.baseUrl + '/analyze_prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || config.supabase.publishableKey}`
          },
          body: JSON.stringify({ prompt: moodText }),
        });
        
        if (!analyzeResponse.ok) {
          const errorData = await analyzeResponse.text();
          console.error('Error analyzing prompt:', errorData);
          throw new Error(`Failed to analyze prompt: ${analyzeResponse.status} ${analyzeResponse.statusText}`);
        }
        
        const analysisResult = await analyzeResponse.json();
        const isLiteral = analysisResult.type === 'literal';
        
        setIsAnalyzing(false);
        
        trackEvent('prompt_analyzed', {
          prompt: moodText,
          type: analysisResult.type,
          has_csv: csvData !== null
        });
        
        // For literal prompts, skip quotes and go directly to movie recommendations
        if (isLiteral) {
          setIsLoading(true);
          
          // Generate movies directly for literal prompts
          const movieResponse = await fetch(config.edgeFunctions.generateMovies, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token || config.supabase.publishableKey}`
            },
            body: JSON.stringify({
              selectedQuote: "",
              originalEmotion: moodText,
              userPreferences: null,
              previousMovies: [] 
            }),
          });
          
          if (!movieResponse.ok) {
            const errorData = await movieResponse.text();
            console.error('Error response:', errorData);
            throw new Error(`Failed to generate recommendations: ${movieResponse.status} ${movieResponse.statusText}`);
          }
          
          const recommendations = await movieResponse.json();
          
          trackEvent('movies_generated', {
            originalMood: moodText,
            bypassQuotes: true,
            promptType: 'literal',
            recommendedMovies: recommendations.movies.map((m: any) => m.title).join(', ')
          });
          
          if (user) {
            const { data: usageData, error: usageError } = await supabase.rpc('increment_prompt_count', { 
              uid: user.id,
              monthly_limit: promptUsage.monthly_limit
            });
            
            if (usageError) {
              throw new Error(`Failed to update prompt usage: ${usageError.message}`);
            }
          } else if (isGuestMode) {
            setTrialUsed(true);
          }
          
          // Navigate directly to recommendations page
          navigate("/recommendations", { 
            state: { 
              selectedQuote: null,
              recommendations: recommendations,
              mood: moodText,
              fromLiteralPrompt: true
            } 
          });
        } else {
          // For figurative prompts, follow the original flow through quotes
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
            has_csv: csvData !== null,
            promptType: 'figurative'
          });
          
          navigate("/quotes", { 
            state: { 
              mood: moodText, 
              quotes: data, 
              promptUsage: promptUsage
            }
          });
        }
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
      setIsAnalyzing(false);
    }
  };

  const isButtonDisabled = ((!mood.trim() && !csvData) || isLoading || 
    (!isGuestMode && promptUsage.limit_reached) || 
    (isGuestMode && isTrialUsed));

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground relative">
        <div className="min-h-[120px] flex items-center justify-center">
          <TextAreaInput
            initialValue={initialValue}
            onSubmit={handleSubmit}
            onChange={handleMoodChange}
            maxLength={200}
         />
        </div>
      </h1>
      <SubmitButton 
        onClick={handleSubmit}
        isLoading={isLoading}
        isDisabled={isButtonDisabled}
        remainingPrompts={promptUsage.remaining}
        showPromptCount={!isGuestMode}
        loadingText={isAnalyzing ? "Analyzing your prompt..." : "Generating..."}
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
