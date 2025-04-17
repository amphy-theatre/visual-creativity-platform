
import React, { useEffect, useRef, useState } from 'react';
import TypeIt from 'typeit';

interface AnimatedTextProps {
  initialValue: string;
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  initialValue = "",
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenTexts = 2000,
  className = "",
  onChange,
  onSubmit,
  maxLength = 200
}) => {
  const [value, setValue] = useState(initialValue);
  const [charCount, setCharCount] = useState(initialValue.length);
  const elementRef = useRef<HTMLTextAreaElement>(null);
  const typeItRef = useRef<TypeIt | null>(null);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const cycleCountRef = useRef<number>(0);
  const [isTypingDone, setIsTypingDone] = useState(false);
    
  const updateTextAreaHeight = (text = '') => {
    if (elementRef.current) {
      // Reset height to auto to get a correct scrollHeight measurement
      elementRef.current.style.height = 'auto';
      
      // Set a minimum height to avoid the textarea becoming too small
      const minHeight = '2.5rem';
      
      // Apply the scrollHeight as the new height, but not less than the minimum height
      const scrollHeight = elementRef.current.scrollHeight;
      elementRef.current.style.height = `${Math.max(parseInt(minHeight), scrollHeight)}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setValue(text);
    setCharCount(text.length);
    onChange(text);
    
    // Update height when user types
    updateTextAreaHeight(text);
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
        updateTextAreaHeight("");
      }
      setIsTypingDone(true);
    }
  };
  
  // Initial textarea setup
  useEffect(() => {
    // Set initial height for the textarea
    if (elementRef.current) {
      updateTextAreaHeight(initialValue);
      
      // Add a small delay to ensure the textarea is properly rendered before measuring height
      setTimeout(() => {
        updateTextAreaHeight(initialValue);
      }, 50);
    }
  }, [initialValue]);
  
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
      updateTextAreaHeight('');
    }
    
    // Create new TypeIt instance
    const instance = new TypeIt(elementRef.current, {
      speed: typingSpeed,
      deleteSpeed: deletingSpeed,
      lifeLike: true,
      waitUntilVisible: true,
      cursor: true,
      afterStep: (instance) => {
        // Update height after each typing step
        if (elementRef.current) {
          updateTextAreaHeight(elementRef.current.value);
        }
      },
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
      instance.type(phrase, {
        afterComplete: () => {
          // Update height after typing a complete phrase
          updateTextAreaHeight(phrase);
        }
      })
      .pause(delayBetweenTexts)
      .delete(null, {
        afterComplete: () => {
          // Update height after deleting
          updateTextAreaHeight('');
        }
      });
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
    <div className="space-y-2 w-full">
      <textarea
        ref={elementRef}
        readOnly={!isTypingDone}
        onClick={handleClick}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={`${className} resize-none bg-transparent text-center border-none focus:ring-0 outline-none text-4xl md:text-5xl font-bold w-full`}
        style={{ 
          minHeight: "2.5rem",
          transition: "height 0.15s ease"
        }}
        title="Click to type your own"
      />
      <div className="flex justify-end">
        <span className="text-sm text-muted-foreground">{charCount}/{maxLength} characters</span>
      </div>
    </div>
  );
};

export default AnimatedText;
