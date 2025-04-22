import React, { useState } from "react";
import Layout from "../components/Layout";
import PresetMood from "../components/PresetMood";
import FreeTrialBanner from "../components/FreeTrialBanner";
import MoodInput from "../components/MoodInput";
import { useAuth } from "../context/AuthContext";
import AnimatedText from "@/components/AnimatedText";

const Index: React.FC = () => {
  const { isGuestMode, isTrialUsed } = useAuth();
  const [inputValue, setInputValue] = useState("");
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  return (
    <Layout>
      <div className="space-y-10 pb-12">
        {isGuestMode && isTrialUsed && <FreeTrialBanner />}
        
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-5xl md:text-6xl  text-center text-blue-500 mb-2 animate-fade-in">
            Amphytheatre
          </h1>
          <h2 className="text-3xl md:text-4xl text-center text-foreground/80 mb-12 animate-fade-in">
            Movies to match your mood
          </h2>

          <h1 className="text-4xl md:text-3xl text-foreground relative">
            {/* <AnimatedText 
              texts={phrases}
              typingSpeed={80} 
              deletingSpeed={40} 
              delayBetweenTexts={2000}
              className="inline-block"
            /> */}
          </h1>
            <MoodInput initialValue={inputValue}/>
        </div>
        
        <div className="opacity-80">
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
      </div>
    </Layout>
  );
};

export default Index;
