
import React, { useEffect, useRef, useState } from 'react';
import TypeIt from 'typeit';

interface AnimatedTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
  onTextClick?: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenTexts = 2000,
  className = "",
  onTextClick,
  onChange,
  onSubmit,

}) => {
  const elementRef = useRef<HTMLTextAreaElement>(null);
  const typeItRef = useRef<TypeIt | null>(null);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const cycleCountRef = useRef<number>(0);
  const [isTypingDone, setIsTypingDone] = useState(false);
    
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };
  
  // Function to get 5 random phrases from the text array
  const getRandomPhrases = () => {
    const shuffled = [...texts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };
  
  // Initialize or reset selected phrases
  useEffect(() => {
    setSelectedPhrases(getRandomPhrases());
  }, [texts]);
  
  const handleClick = () => {
    if (!isTypingDone && typeItRef.current) {
      // If animation is still running, complete it instantly
      typeItRef.current.destroy();
      if (elementRef.current) {
        elementRef.current.value = "";
        onChange(""); // Reset the input value in parent component
      }
      setIsTypingDone(true);
      onTextClick?.();
      
      // Focus the textarea
      elementRef.current?.focus();
    }
  };
  
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
      elementRef.current.value = '';
      onChange(""); // Reset the input value in parent component
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
  }, [selectedPhrases, typingSpeed, deletingSpeed, delayBetweenTexts, onChange]);
  
  return (
    <textarea
      ref={elementRef}
      readOnly={!isTypingDone}
      onClick={handleClick}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      className={`${className} resize-none bg-transparent text-center border-none focus:ring-0 outline-none text-4xl md:text-5xl font-bold w-full`}
      style={{ 
        minHeight: "2.5rem",
        transition: "all 0.3s ease"
      }}
      title="Click to type your own"
    />
  );
};

export default AnimatedText;
