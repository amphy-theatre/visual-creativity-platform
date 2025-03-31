
import React, { useState, KeyboardEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import FileDropbox from "./FileDropbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const MoodInput: React.FC = () => {
  const [mood, setMood] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fileSummary, setFileSummary] = useState<string | null>(null);
  
  // Fetch file summary when component mounts
  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('file_summaries')
          .select('summary')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching summary:', error);
          return;
        }
        
        if (data) {
          setFileSummary(data.summary);
        }
      } catch (error) {
        console.error('Error in fetchSummary:', error);
      }
    };
    
    fetchSummary();
  }, [user]);
  
  // Poll for summary updates when processing CSV
  useEffect(() => {
    let interval: number | null = null;
    
    if (isProcessingCsv && user) {
      interval = window.setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('file_summaries')
            .select('summary')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error polling for summary:', error);
            return;
          }
          
          if (data && data.summary) {
            setFileSummary(data.summary);
            setIsProcessingCsv(false);
            setMood(data.summary);
            toast({
              title: "CSV Processed",
              description: "Your file has been analyzed and is ready for recommendations.",
            });
            
            // Clear the interval once we get data
            if (interval) {
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Error polling for summary:', error);
        }
      }, 3000); // Poll every 3 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isProcessingCsv, user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMood(text);
    setCharCount(text.length);
  };
  
  const handleSubmit = async () => {
    if (!mood.trim() && !csvData && !fileSummary) {
      toast({
        title: "Input required",
        description: "Please enter your mood or upload a CSV file.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use this feature.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // If we have CSV data, send it to the summarize_csv function
      if (csvData) {
        setIsProcessingCsv(true);
        
        // Call the edge function to summarize the CSV
        const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/summarize_csv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28'}`
          },
          body: JSON.stringify({ 
            csvData: csvData,
            userId: user.id 
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to process CSV: ${response.status} ${response.statusText}`);
        }
        
        toast({
          title: "Processing CSV",
          description: "Your file is being analyzed. This may take a few moments...",
        });
        
        // The function now runs in the background, so we don't wait for it
        setIsLoading(false);
        return;
      }
      
      // Use either manual input or the file summary
      const moodText = mood.trim() || fileSummary;
      
      if (moodText) {
        const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate_quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28'}`
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
        
        navigate("/quotes", { state: { mood: moodText, quotes: data } });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setIsProcessingCsv(false);
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
  
  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
    
    // If file is removed, clear the CSV data
    if (!file) {
      setCsvData(null);
      return;
    }
    
    // Read the file and store its content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      {fileSummary && !mood && (
        <div className="p-4 border rounded-lg bg-muted/30">
          <h3 className="font-medium mb-2">Previous File Analysis</h3>
          <p className="text-sm text-muted-foreground">{fileSummary}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setMood(fileSummary)}
          >
            Use This Analysis
          </Button>
        </div>
      )}
    
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
        disabled={((!mood.trim() && !csvData && !fileSummary) || isLoading || isProcessingCsv)}
        variant="default"
      >
        {isLoading || isProcessingCsv ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isProcessingCsv ? "Processing CSV..." : "Generating Quotes..."}
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
        1 prompts remaining this month
      </div>
      
      {/* File Dropbox Component */}
      <FileDropbox onChange={handleFileChange} maxSize={10} />
    </div>
  );
};

export default MoodInput;
