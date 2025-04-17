import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { usePromptUsage, MONTHLY_PROMPT_LIMIT } from "@/hooks/usePromptUsage";
import PromptLimitModal from "@/components/modals/PromptLimitModal";
import { useAuth } from "@/context/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAppConfig } from "@/hooks/useAppConfig";

interface PresetMoodProps {
  title: string;
  genre: "inspiration" | "thriller" | "drama" | "romance" | "philosophical" | "comedy";
  description: string;
}

const PresetMood: React.FC<PresetMoodProps> = ({ title, genre, description }) => {
  const navigate = useNavigate();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { promptUsage, incrementPromptCount, isLoading: isPromptUsageLoading } = usePromptUsage();
  const { session, isGuestMode, isTrialUsed, setTrialUsed } = useAuth();
  const { trackEvent } = useAnalytics();
  const config = useAppConfig();
  
  const handleClick = async () => {
    // Check if guest user has already used their free trial
    if (isGuestMode && isTrialUsed) {
      toast({
        title: "Free Trial Used",
        description: "Please sign in to generate more movie recommendations.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if signed-in user is over their monthly prompt limit
    if (!isGuestMode && promptUsage?.limit_reached) {
      setShowLimitModal(true);
      return;
    }
    
    try {
      // Show loading toast
      toast({
        title: "Generating quotes",
        description: `Finding quotes for "${description}"`,
      });
      
      // Increment the prompt count for signed-in users
      if (!isGuestMode) {
        const updatedUsage = await incrementPromptCount();
        
        // Check if the user has reached their limit after incrementing
        if (updatedUsage?.limit_reached) {
          setShowLimitModal(true);
          return;
        }
      }
      
      const response = await fetch(config.edgeFunctions.generateQuotes, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || config.supabase.publishableKey}`
        },
        body: JSON.stringify({ emotion: description }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate quotes: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Track the quotes generated event
      trackEvent('quotes_generated', {
        mood: description,
        genre: genre,
        source: 'preset_mood'
      });
      
      // Navigate to the quotes page with the mood and quotes data
      navigate("/quotes", { 
        state: { 
          mood: description, 
          quotes: data, 
          promptUsage: promptUsage 
        }
      });
    } catch (error) {
      console.error('Error generating quotes:', error);
      toast({
        title: "Error",
        description: "Failed to generate quotes. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Generate card styles based on genre
  const getGenreStyles = () => {
    const baseClasses = "preset-card border-2 p-6 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center text-center";
    
    // Map of genre-specific border and text styles
    const genreStyles: Record<string, string> = {
      inspiration: "border-amber-500 text-amber-600 hover:bg-amber-50",
      thriller: "border-orange-500 text-orange-600 hover:bg-orange-50",
      drama: "border-blue-500 text-blue-600 hover:bg-blue-50",
      romance: "border-pink-500 text-pink-600 hover:bg-pink-50",
      philosophical: "border-violet-500 text-violet-600 hover:bg-violet-50",
      comedy: "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
    };
    
    return `${baseClasses} ${genreStyles[genre]}`;
  };
  
  return (
    <>
      <div 
        className={getGenreStyles()}
        onClick={handleClick}
      >
        <div className="space-y-4">
          <div className="text-sm text-foreground/80 font-medium">"{description}"</div>
          <div className="text-xl font-semibold">{title}</div>
        </div>
      </div>
      
      <PromptLimitModal
        open={showLimitModal}
        onOpenChange={setShowLimitModal}
        monthlyLimit={promptUsage?.monthly_limit || 75}
      />
    </>
  );
};

export default PresetMood;
