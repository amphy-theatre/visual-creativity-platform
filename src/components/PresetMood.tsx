
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
  
  return (
    <div 
      className={`preset-card p-6 rounded-lg bg-genre-${genre} cursor-pointer`}
      onClick={handleClick}
    >
      <div className="space-y-2">
        <div className="text-sm text-white/80">"{description}"</div>
        <div className="text-xl font-semibold text-white">{title}</div>
      </div>
    </div>
  );
};

export default PresetMood;
