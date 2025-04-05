
import React, { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const GuestMoodInput: React.FC = () => {
  const [mood, setMood] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMood(text);
    setCharCount(text.length);
  };
  
  const handleSubmit = async () => {
    if (!mood.trim()) {
      toast({
        title: "Input required",
        description: "Please enter how you're feeling to get a recommendation.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate_quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28'}`
        },
        body: JSON.stringify({ emotion: mood.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to generate quotes: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const data = await response.json();
      console.log('Received quotes:', data);
      
      navigate("/quotes", { 
        state: { 
          mood: mood.trim(), 
          quotes: data, 
          isGuest: true,
          allowedRefresh: true
        }
      });
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
        disabled={!mood.trim() || isLoading}
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
      
      <div className="text-center text-sm text-muted-foreground mt-4 border-t pt-4">
        <p>Create an account for more recommendations and personalized features!</p>
        <Button 
          variant="link" 
          onClick={() => navigate("/auth")}
          className="mt-1"
        >
          Sign up now
        </Button>
      </div>
    </div>
  );
};

export default GuestMoodInput;
