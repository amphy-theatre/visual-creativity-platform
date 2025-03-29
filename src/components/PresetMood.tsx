
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface PresetMoodProps {
  title: string;
  genre: "inspiration" | "thriller" | "drama" | "romance" | "philosophical" | "comedy";
  description: string;
}

const PresetMood: React.FC<PresetMoodProps> = ({ title, genre, description }) => {
  const navigate = useNavigate();
  
  const handleClick = async () => {
    try {
      // Show loading toast
      toast({
        title: "Generating quotes",
        description: `Finding quotes for "${description}"`,
      });
      
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
      navigate("/quotes", { state: { mood: description, quotes: data } });
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
    
    // Map of genre-specific background styles
    const genreStyles: Record<string, string> = {
      inspiration: "bg-slate-600 text-white hover:bg-slate-700",
      thriller: "bg-orange-600 text-white hover:bg-orange-700",
      drama: "bg-slate-600 text-white hover:bg-slate-700",
      romance: "bg-rose-600 text-white hover:bg-rose-700",
      philosophical: "bg-indigo-600 text-white hover:bg-indigo-700",
      comedy: "bg-emerald-600 text-white hover:bg-emerald-700"
    };
    
    return `${baseClasses} ${genreStyles[genre]}`;
  };
  
  return (
    <div 
      className={getGenreStyles()}
      onClick={handleClick}
    >
      <div className="space-y-4">
        <div className="text-sm text-white/80">"{description}"</div>
        <div className="text-xl font-semibold text-white">{title}</div>
      </div>
    </div>
  );
};

export default PresetMood;
