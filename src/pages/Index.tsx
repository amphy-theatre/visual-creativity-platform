
import React, { useRef } from "react";
import Layout from "../components/Layout";
import MoodInput from "../components/MoodInput";
import PresetMood from "../components/PresetMood";
import FreeTrialBanner from "../components/FreeTrialBanner";
import AnimatedText from "../components/AnimatedText";
import { useAuth } from "../context/AuthContext";
import { phrases } from "../phrases";

const Index: React.FC = () => {
  const { isGuestMode } = useAuth();
  const moodInputRef = useRef<HTMLDivElement>(null);
  
  const handleUserInput = (input: string) => {
    if (moodInputRef.current) {
      // Find textarea in MoodInput and set its value
      const textarea = moodInputRef.current.querySelector('textarea');
      if (textarea) {
        // Set the value using the input API
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value"
        )?.set;
        
        if (nativeTextAreaValueSetter) {
          nativeTextAreaValueSetter.call(textarea, input);
          
          // Dispatch input event to trigger React's onChange
          textarea.dispatchEvent(
            new Event('input', { bubbles: true })
          );
          
          // Find and click the submit button - with proper type assertion
          const button = moodInputRef.current.querySelector('button[type="submit"]') || 
                          moodInputRef.current.querySelector('button');
          
          if (button) {
            setTimeout(() => {
              // Use proper HTMLButtonElement type assertion
              (button as HTMLButtonElement).click();
            }, 100); // Small delay to ensure state is updated
          }
        }
      }
    }
  };
  
  return (
    <Layout>
      <div className="space-y-16 pb-12">
        {isGuestMode && <FreeTrialBanner />}
        
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            <AnimatedText 
              texts={phrases}
              typingSpeed={80} 
              deletingSpeed={40} 
              delayBetweenTexts={2000}
              className="inline-block"
              onUserInput={handleUserInput}
            />
          </h1>
          <p className="text-xl text-foreground/70">Let's find the perfect content to match your mood</p>
        </div>
        
        <div ref={moodInputRef}>
          <MoodInput />
        </div>
        
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
