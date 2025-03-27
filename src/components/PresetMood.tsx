import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { usePromptUsage } from "@/hooks/usePromptUsage";
import { useAuth } from "@/context/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAppConfig } from "@/hooks/useAppConfig";
import {
  Lightbulb,
  Compass,
  Heart,
  BookOpen,
  Smile,
  Icon as LucideIcon,
} from "lucide-react";

interface PresetMoodProps {
  title: string;
  genre: "inspiration" | "thriller" | "drama" | "romance" | "philosophical" | "comedy";
  description: string;
  icon: React.ReactElement<React.ComponentProps<LucideIcon>>;
}

const PresetMood: React.FC<PresetMoodProps> = ({ title, genre, description, icon }) => {
  const navigate = useNavigate();
  const { promptUsage, incrementPromptCount, setShowLimitModal } = usePromptUsage();
  const { session, isGuestMode, isTrialUsed } = useAuth();
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
    const baseClasses = " p-4 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center text-white aspect-square flex-1";
    
    const genreStyles: Record<string, string> = {
      inspiration: "bg-cyan-700 hover:bg-cyan-600",
      thriller: "bg-orange-600 hover:bg-orange-500",
      drama: "bg-slate-700 hover:bg-slate-600",
      romance: "bg-rose-600 hover:bg-rose-500",
      philosophical: "bg-indigo-600 hover:bg-indigo-500",
      comedy: "bg-emerald-600 hover:bg-emerald-500",
    };
    
    return `${baseClasses} ${genreStyles[genre]}`;
  };
  
  return (
    <>
      <div 
        className={getGenreStyles()}
        onClick={handleClick}
      >
        {React.cloneElement(icon, { size: 50, className: "mb-1" })}
        <div className="text-xl font-medium">{title}</div>
      </div>
    </>
  );
};

export default PresetMood;
