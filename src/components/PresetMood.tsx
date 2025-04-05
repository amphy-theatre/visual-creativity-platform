
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { usePromptUsage } from "@/hooks/usePromptUsage";
import PromptLimitModal from "@/components/modals/PromptLimitModal";

interface PresetMoodProps {
  title: string;
  genre: "inspiration" | "thriller" | "drama" | "romance" | "philosophical" | "comedy";
  description: string;
}

const PresetMood: React.FC<PresetMoodProps> = ({ title, genre, description }) => {
  const navigate = useNavigate();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { promptUsage, incrementPromptCount, isLoading: isPromptUsageLoading } = usePromptUsage();
  
  const handleClick = async () => {
    // Check if user is over their monthly prompt limit
    if (promptUsage?.limit_reached) {
      setShowLimitModal(true);
      return;
    }
    
    try {
      // Show loading toast
      toast({
        title: "Generating quotes",
        description: `Finding quotes for "${description}"`,
      });
      
      // Increment the prompt count first
      const updatedUsage = await incrementPromptCount();
      
      // Check if the user has reached their limit after incrementing
      if (updatedUsage?.limit_reached) {
        setShowLimitModal(true);
        return;
      }
      
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28'}`
        },
        body: JSON.stringify({ emotion: description }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate quotes: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Navigate to the quotes page with the mood and quotes data
      navigate("/quotes", { state: { mood: description, quotes: data, promptUsage: updatedUsage } });
    } catch (error) {
      console.error('Error generating quotes:', error);
      toast({
        title: "Error",
        description: "Failed to generate quotes. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Generate card colors based on genre
  const getGenreStyles = () => {
    const baseClasses = "preset-card p-6 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center text-center";
    
    // Map of genre-specific background styles with vibrant colors by default
    const genreStyles: Record<string, string> = {
      inspiration: "bg-gradient-to-br from-amber-500 to-yellow-400 text-white hover:from-amber-600 hover:to-yellow-500",
      thriller: "bg-gradient-to-br from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600",
      drama: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700",
      romance: "bg-gradient-to-br from-pink-500 to-rose-400 text-white hover:from-pink-600 hover:to-rose-500",
      philosophical: "bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700",
      comedy: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600"
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
          <div className="text-sm text-white/90 font-medium">"{description}"</div>
          <div className="text-xl font-semibold text-white">{title}</div>
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
