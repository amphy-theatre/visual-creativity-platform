
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const MoodInput: React.FC = () => {
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
    if (!mood.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotion: mood }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate quotes');
      }
      
      // Parse the response if needed
      const data = await response.json();
      
      // Navigate to the quotes page with the mood
      navigate("/quotes", { state: { mood, quotes: data } });
    } catch (error) {
      console.error('Error generating quotes:', error);
      toast({
        title: "Error",
        description: "Failed to generate quotes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-foreground/80">How are you feeling? Describe your current mood:</h2>
        <Textarea
          className="h-32 resize-none"
          placeholder="How are you feeling? (e.g., I feel like a yellow balloon, On top of the world, I think I am James Bond)"
          value={mood}
          onChange={handleInputChange}
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
            Processing...
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
    </div>
  );
};

export default MoodInput;
