import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { usePromptUsage } from "@/hooks/usePromptUsage";
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
  const { promptUsage, incrementPromptCount, isLoading: isPromptUsageLoading, showLimitModal, setShowLimitModal } = usePromptUsage();
  const { session, isGuestMode, isTrialUsed, setTrialUsed } = useAuth();
  const { trackEvent } = useAnalytics();
  const config = useAppConfig();
  
  const handleClick = async () => {
    if (isGuestMode && isTrialUsed) {
      toast({
        title: "Free Trial Used",
        description: "Please sign in to generate more movie recommendations.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isGuestMode && promptUsage?.limit_reached) {
      setShowLimitModal(true);
      return;
    }
    
    try {
      toast({
        title: "Generating quotes",
        description: `Finding quotes for "${description}"`,
      });
      
      if (!isGuestMode) {
        const updatedUsage = await incrementPromptCount();
        
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
      
      const data = await response.json();
      
      trackEvent('quotes_generated', {
        mood: description,
        genre: genre,
        source: 'preset_mood'
      });
      
      navigate("/quotes", { 
        state: { 
          mood: description, 
          quotes: data.quotes, 
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
  
  const getGenreStyles = () => {
    const baseClasses = "preset-card border-2 p-6 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center text-center";
    
    const genreStyles: Record<string, string> = {
      inspiration: "border-amber-500 hover:bg-amber-50/50 [&_*]:bg-gradient-to-r [&_*]:from-amber-500 [&_*]:to-yellow-400 [&_*]:bg-clip-text [&_*]:text-transparent",
      thriller: "border-orange-500 hover:bg-orange-50/50 [&_*]:bg-gradient-to-r [&_*]:from-orange-500 [&_*]:to-red-500 [&_*]:bg-clip-text [&_*]:text-transparent",
      drama: "border-blue-500 hover:bg-blue-50/50 [&_*]:bg-gradient-to-r [&_*]:from-blue-500 [&_*]:to-indigo-600 [&_*]:bg-clip-text [&_*]:text-transparent",
      romance: "border-pink-500 hover:bg-pink-50/50 [&_*]:bg-gradient-to-r [&_*]:from-pink-500 [&_*]:to-rose-400 [&_*]:bg-clip-text [&_*]:text-transparent",
      philosophical: "border-violet-500 hover:bg-violet-50/50 [&_*]:bg-gradient-to-r [&_*]:from-violet-500 [&_*]:to-purple-600 [&_*]:bg-clip-text [&_*]:text-transparent",
      comedy: "border-emerald-500 hover:bg-emerald-50/50 [&_*]:bg-gradient-to-r [&_*]:from-emerald-400 [&_*]:to-teal-500 [&_*]:bg-clip-text [&_*]:text-transparent"
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
          <div className="text-sm font-medium">"{description}"</div>
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
