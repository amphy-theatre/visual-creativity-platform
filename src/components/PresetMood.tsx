
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MONTHLY_PROMPT_LIMIT } from "@/hooks/usePromptUsage";

interface PresetMoodProps {
  title: string;
  genre: "inspiration" | "thriller" | "drama" | "romance" | "philosophical" | "comedy";
  description: string;
}

const PresetMood: React.FC<PresetMoodProps> = ({ title, genre, description }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleClick = async () => {
    try {
      // Show loading toast
      toast({
        title: "Finding recommendations",
        description: `Looking for ${title} content for you`,
      });

      // Get user preferences if logged in
      let userPreferences = null;
      if (user) {
        try {
          const { data, error } = await supabase
            .from('file_summaries')
            .select('summary')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (data && !error) {
            userPreferences = data.summary;
          }
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      }
      
      // Skip quotes generation and navigate directly to recommendations
      navigate("/recommendations", { 
        state: { 
          mood: description,
          selectedGenre: genre,
          fromPreset: true,
          userPreferences
        } 
      });
    } catch (error) {
      console.error('Error navigating to recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations. Please try again.",
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
    <div 
      className={getGenreStyles()}
      onClick={handleClick}
    >
      <div className="space-y-4">
        <div className="text-sm text-white/90 font-medium">"{description}"</div>
        <div className="text-xl font-semibold text-white">{title}</div>
      </div>
    </div>
  );
};

export default PresetMood;
