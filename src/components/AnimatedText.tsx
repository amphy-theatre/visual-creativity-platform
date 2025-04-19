
import React, { useEffect, useRef, useState } from 'react';
import TypeIt from 'typeit';

interface AnimatedTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenTexts = 2000,
  className = "",
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const typeItRef = useRef<TypeIt | null>(null);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const cycleCountRef = useRef<number>(0);
  
  // Function to get 5 random phrases from the text array
  const getRandomPhrases = () => {
    const shuffled = [...texts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };
  
  // Initialize or reset selected phrases
  useEffect(() => {
    setSelectedPhrases(getRandomPhrases());
  }, [texts]);
  
  useEffect(() => {
    if (!elementRef.current || !selectedPhrases.length) return;
    
    // Clean up previous instance
    if (typeItRef.current) {
      try {
        typeItRef.current.destroy();
      } catch (error) {
        console.log('Error cleaning up previous TypeIt instance:', error);
      }
    }
    
    // Clear any existing content
    if (elementRef.current) {
      elementRef.current.innerHTML = '';
    }
    
    // Create new TypeIt instance
    const instance = new TypeIt(elementRef.current, {
      speed: typingSpeed,
      deleteSpeed: deletingSpeed,
      lifeLike: true,
      waitUntilVisible: true,
      cursor: true,
      afterComplete: (instance) => {
        // After completing all phrases, get new ones
        cycleCountRef.current += 1;
        
        // After showing all five phrases, get a new batch
        if (cycleCountRef.current >= selectedPhrases.length) {
          cycleCountRef.current = 0;
          setSelectedPhrases(getRandomPhrases());
          
          // This will cause a re-render and initialize a new TypeIt instance
          return;
        }
        
        // Continue with next phrase in current batch
        instance.reset();
        instance.go();
      }
    });
    
    // Add each phrase to the instance
    selectedPhrases.forEach((phrase, index) => {
      instance.type(phrase)
        .pause(delayBetweenTexts)
        .delete();
    });
    
    // Start the animation
    instance.go();
    
    // Save the instance for cleanup
    typeItRef.current = instance;
    
    // Cleanup function
    return () => {
      if (typeItRef.current) {
        try {
          typeItRef.current.destroy();
          typeItRef.current = null;
        } catch (error) {
          console.log('Error during cleanup:', error);
        }
      }
    };
  }, [selectedPhrases, typingSpeed, deletingSpeed, delayBetweenTexts]);
  
  return (
    <div 
      ref={elementRef} 
      className={`${className} cursor-pointer`}
      style={{ 
        minHeight: "2.5rem", 
        display: "inline-block",
        transition: "all 0.3s ease"
      }}
    ></div>
  );
};

export default AnimatedText;