
import React, { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import FileDropbox from "./FileDropbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { readFileAsText } from "@/utils/csvUtils";
import { usePromptUsage, PromptUsageType } from "@/hooks/usePromptUsage";
import PromptLimitModal from "./modals/PromptLimitModal";

const MoodInput: React.FC = () => {
  const [mood, setMood] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const {
    promptUsage,
    showLimitModal,
    setShowLimitModal,
    incrementPromptCount,
  } = usePromptUsage();
  
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
    
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use this feature.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    // Check if the user has reached their monthly limit
    if (promptUsage.limit_reached) {
      setShowLimitModal(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Increment the prompt count in the database
      const updatedUsage = await incrementPromptCount();
      
      if (!updatedUsage) {
        throw new Error("Failed to update prompt usage");
      }
      
      // If the updated usage shows we've hit the limit after this request,
      // we'll still process this one but show the modal afterward
      const justReachedLimit = updatedUsage.limit_reached && 
        updatedUsage.prompt_count === updatedUsage.monthly_limit;
      
      // If we have CSV data, send it to the summarize_csv function asynchronously
      if (csvData) {
        // Get the session token for authentication
        const accessToken = session.access_token;
        
        try {
          // Call the edge function to summarize the CSV asynchronously
          await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/summarize_csv', {
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
          // Continue even if CSV processing fails
        }
      }
      
      // Always use the actual mood input for generating quotes
      const moodText = mood.trim();
      
      if (moodText) {
        const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate_quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28`
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
        
        navigate("/quotes", { 
          state: { 
            mood: moodText, 
            quotes: data, 
            promptUsage: updatedUsage // Pass the prompt usage data
          }
        });
        
        // If this request just caused us to reach the limit, show the modal after navigation
        if (justReachedLimit) {
          setTimeout(() => setShowLimitModal(true), 500);
        }
      } else {
        // If no mood text, but we have CSV data, simply go to quotes with empty data
        // This allows the background CSV processing to continue
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
  
  // Handle key press events on the textarea
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed without Shift (for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid newline
      handleSubmit();
    }
  };
  
  const handleFileChange = async (file: File | null) => {
    setUploadedFile(file);
    
    // If file is removed, clear the CSV data
    if (!file) {
      setCsvData(null);
      return;
    }
    
    try {
      // Read the file and store its content
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Textarea
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
        disabled={((!mood.trim() && !csvData) || isLoading || promptUsage.limit_reached)}
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
      
      <div className="text-sm text-foreground/50 text-center">
        {promptUsage.remaining} prompt{promptUsage.remaining !== 1 ? 's' : ''} remaining this month
      </div>
      
      {/* File Dropbox Component */}
      <FileDropbox onChange={handleFileChange} maxSize={10} />

      {/* Monthly Limit Modal */}
      <PromptLimitModal
        open={showLimitModal}
        onOpenChange={setShowLimitModal}
        monthlyLimit={promptUsage.monthly_limit}
      />
    </div>
  );
};

export default MoodInput;
