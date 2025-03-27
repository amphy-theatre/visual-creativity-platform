
import React from "react";
import { useNavigate } from "react-router-dom";

interface PresetMoodProps {
  title: string;
  genre: "inspiration" | "thriller" | "drama" | "romance" | "philosophical" | "comedy";
  description: string;
}

const PresetMood: React.FC<PresetMoodProps> = ({ title, genre, description }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate("/recommendations", { 
      state: { selectedGenre: genre, fromPreset: true } 
    });
  };
  
  // Generate dynamic classes based on genre
  const getGenreClasses = () => {
    const baseClasses = "preset-card p-6 rounded-lg cursor-pointer transition-all duration-300";
    
    // Map of genre-specific background classes
    const genreBackgrounds: Record<string, string> = {
      inspiration: "bg-secondary/90 hover:bg-secondary",
      thriller: "bg-destructive/70 hover:bg-destructive/90",
      drama: "bg-secondary/90 hover:bg-secondary",
      romance: "bg-destructive/70 hover:bg-destructive/90",
      philosophical: "bg-primary/20 hover:bg-primary/30",
      comedy: "bg-accent/80 hover:bg-accent"
    };
    
    return `${baseClasses} ${genreBackgrounds[genre]}`;
  };
  
  return (
    <div 
      className={getGenreClasses()}
      onClick={handleClick}
    >
      <div className="space-y-2">
        <div className="text-sm text-foreground/80">"{description}"</div>
        <div className="text-xl font-semibold text-foreground">{title}</div>
      </div>
    </div>
  );
};

export default PresetMood;
