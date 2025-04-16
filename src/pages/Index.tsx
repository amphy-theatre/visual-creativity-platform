
import React, { useMemo } from "react";
import Layout from "../components/Layout";
import MoodInput from "../components/MoodInput";
import PresetMood from "../components/PresetMood";
import FreeTrialBanner from "../components/FreeTrialBanner";
import AnimatedText from "../components/AnimatedText";
import { useAuth } from "../context/AuthContext";
import { phrases } from "../phrases";

const Index: React.FC = () => {
  const { isGuestMode } = useAuth();
  
  // Select a random set of phrases each time the component renders
  const randomPhrases = useMemo(() => {
    // Shuffle array and take first 5 elements
    const shuffled = [...phrases].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }, []);
  
  return (
    <Layout>
      <div className="space-y-16 pb-12">
        {isGuestMode && <FreeTrialBanner />}
        
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            <AnimatedText 
              texts={randomPhrases} 
              typingSpeed={80} 
              deletingSpeed={40} 
              delayBetweenTexts={2000}
              className="inline-block"
            />
          </h1>
          <p className="text-xl text-foreground/70">Let's find the perfect content to match your mood</p>
        </div>
        
        <MoodInput />
        
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="text-lg text-foreground/80">Or choose a preset prompt:</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PresetMood 
              title="Inspiration" 
              genre="inspiration" 
              description="Something uplifting"
            />
            <PresetMood 
              title="Thriller" 
              genre="thriller" 
              description="A gripping adventure"
            />
            <PresetMood 
              title="Drama" 
              genre="drama" 
              description="A heartbreaking story"
            />
            <PresetMood 
              title="Romance" 
              genre="romance" 
              description="Something romantic"
            />
            <PresetMood 
              title="Philosophical" 
              genre="philosophical" 
              description="A thought-provoking film"
            />
            <PresetMood 
              title="Comedy" 
              genre="comedy" 
              description="Something lighthearted"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
