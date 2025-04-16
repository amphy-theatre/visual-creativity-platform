import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import FileDropbox from "./FileDropbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { readFileAsText } from "@/utils/csvUtils";
import { usePromptUsage } from "@/hooks/usePromptUsage";
import PromptLimitModal from "./modals/PromptLimitModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAppConfig } from "@/hooks/useAppConfig";

interface MoodInputProps {
  initialValue?: string;
  seamlessInput?: boolean;
}

const MoodInput: React.FC<MoodInputProps> = ({ initialValue = "", seamlessInput = false }) => {
  const [mood, setMood] = useState(initialValue);
  const [charCount, setCharCount] = useState(initialValue.length);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { user, session, isGuestMode, isTrialUsed, setTrialUsed } = useAuth();
  const { trackEvent } = useAnalytics();
  const config = useAppConfig();
  const {
    promptUsage,
    showLimitModal,
    setShowLimitModal,
  } = usePromptUsage();
  
  useEffect(() => {
    if (seamlessInput && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [seamlessInput]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMood(text);
    setCharCount(text.length);
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
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleFileChange = async (file: File | null) => {
    setUploadedFile(file);
    
    if (!file) {
      setCsvData(null);
      return;
    }
    
    try {
      const content = await readFileAsText(file);
      setCsvData(content);
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "File Error",
        description: "Failed to read the uploaded file",
        variant: "destructive",
      });
    }
  };

  if (seamlessInput) {
    return (
      <Textarea
        ref={textareaRef}
        autoFocus
        className="w-full resize-none text-4xl md:text-5xl font-bold bg-transparent border-none shadow-none focus:ring-0 p-0 text-center placeholder:text-foreground/50 min-h-[2.5rem]"
        placeholder="How are you feeling today?"
        value={mood}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        maxLength={200}
      />
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Textarea
          ref={textareaRef}
          className="h-32 resize-none"
          placeholder="How are you feeling? (e.g., I feel like a yellow balloon, On top of the world, I think I am James Bond)"
          value={mood}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={200}
        />
        <div className="flex justify-end">
          <span className="text-sm text-muted-foreground">{charCount}/200 characters</span>
        </div>
      </div>
      
      <Button 
        className="w-full"
        onClick={handleSubmit}
        disabled={((!mood.trim() && !csvData) || isLoading || (!isGuestMode && promptUsage.limit_reached) || (isGuestMode && isTrialUsed))}
        variant="default"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Quotes...
          </>
        ) : (
          <>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Get Personalized Recommendations
          </>
        )}
      </Button>
      
      {!isGuestMode && (
        <div className="text-sm text-foreground/50 text-center">
          {promptUsage.remaining} prompt{promptUsage.remaining !== 1 ? 's' : ''} remaining this month
        </div>
      )}
      
      <FileDropbox onChange={handleFileChange} maxSize={10} />
      
      <PromptLimitModal
        open={showLimitModal}
        onOpenChange={setShowLimitModal}
        monthlyLimit={promptUsage.monthly_limit}
      />
    </div>
  );
};

export default MoodInput;
