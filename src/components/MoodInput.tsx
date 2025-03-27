
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MoodInput: React.FC = () => {
  const [mood, setMood] = useState("");
  const [charCount, setCharCount] = useState(0);
  const navigate = useNavigate();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMood(text);
    setCharCount(text.length);
  };
  
  const handleSubmit = () => {
    if (mood.trim()) {
      navigate("/quotes", { state: { mood } });
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-foreground/80">How are you feeling? Describe your current mood:</h2>
        <textarea
          className="input-field h-32 resize-none"
          placeholder="How are you feeling? (e.g., I feel like a yellow balloon, On top of the world, I think I am James Bond)"
          value={mood}
          onChange={handleInputChange}
          maxLength={200}
        />
        <div className="flex justify-end">
          <span className="text-sm text-muted-foreground">{charCount}/200 characters</span>
        </div>
      </div>
      
      <button 
        className="primary-button w-full"
        onClick={handleSubmit}
        disabled={!mood.trim()}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Get Personalized Recommendations
      </button>
      
      <div className="text-sm text-foreground/50 text-center">
        1 prompts remaining this month
      </div>
    </div>
  );
};

export default MoodInput;
