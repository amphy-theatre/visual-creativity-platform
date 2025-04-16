
import React, { useState, useRef } from "react";
import Layout from "../components/Layout";
import MoodInput from "../components/MoodInput";
import PresetMood from "../components/PresetMood";
import FreeTrialBanner from "../components/FreeTrialBanner";
import AnimatedText from "../components/AnimatedText";
import { useAuth } from "../context/AuthContext";
import { phrases } from "../phrases";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const { isGuestMode } = useAuth();
  const [showAnimatedText, setShowAnimatedText] = useState(true);
  const [inputMood, setInputMood] = useState("");
  const generateButtonRef = useRef<HTMLButtonElement>(null);
  
  const handleAnimatedTextClick = () => {
    setShowAnimatedText(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (generateButtonRef.current) {
        generateButtonRef.current.click();
      }
    }
  };
  
  return (
    <Layout>
      <div className="space-y-16 pb-12">
        {isGuestMode && <FreeTrialBanner />}
        
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            {showAnimatedText ? (
              <AnimatedText 
                texts={phrases}
                typingSpeed={80} 
                deletingSpeed={40} 
                delayBetweenTexts={2000}
                className="inline-block"
                onTextClick={handleAnimatedTextClick}
              />
            ) : (
              <Textarea
                autoFocus
                className="w-full h-24 resize-none text-xl p-4 bg-background border-2 border-primary/30 rounded-lg focus:border-primary/50 focus:ring-0 transition-all duration-200"
                placeholder="How are you feeling today? (e.g., I feel like a yellow balloon, On top of the world...)"
                value={inputMood}
                onChange={(e) => setInputMood(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}
          </h1>
          {showAnimatedText && (
            <p className="text-xl text-foreground/70">Let's find the perfect content to match your mood</p>
          )}
          {!showAnimatedText && (
            <Button 
              ref={generateButtonRef}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                // Find the MoodInput's generate button and call its handleSubmit
                const originalInput = document.querySelector('textarea');
                if (originalInput) {
                  originalInput.value = inputMood;
                  // Trigger a change event to update the MoodInput component's state
                  const event = new Event('input', { bubbles: true });
                  originalInput.dispatchEvent(event);
                }
                
                // Find and click the generate button
                const generateButton = document.querySelector('.w-full.max-w-3xl.mx-auto button');
                if (generateButton && generateButton instanceof HTMLButtonElement) {
                  generateButton.click();
                }
              }}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Get Personalized Recommendations
            </Button>
          )}
        </div>
        
        {/* Hide the original MoodInput when our custom input is shown */}
        {showAnimatedText && <MoodInput />}
        
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
