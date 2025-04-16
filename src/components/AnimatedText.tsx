
import React, { useEffect, useState, useRef } from 'react';

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
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (texts.length === 0) return;
    
    const animateText = () => {
      const currentFullText = texts[currentTextIndex];
      
      if (isDeleting) {
        // Deleting phase
        if (displayedText.length > 0) {
          // Remove one character at a time
          setDisplayedText(prev => prev.substring(0, prev.length - 1));
          timeoutRef.current = setTimeout(animateText, deletingSpeed);
        } else {
          // When fully deleted, move to next text
          setIsDeleting(false);
          // Update the index for the next text
          setCurrentTextIndex(prevIndex => (prevIndex + 1) % texts.length);
          // Start typing the next phrase after a short delay
          timeoutRef.current = setTimeout(animateText, 200);
        }
      } else {
        // Typing phase
        if (displayedText.length < currentFullText.length) {
          // Add one character at a time
          setDisplayedText(prev => currentFullText.substring(0, prev.length + 1));
          timeoutRef.current = setTimeout(animateText, typingSpeed);
        } else {
          // When fully typed, pause before deleting
          setIsPaused(true);
          timeoutRef.current = setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
            animateText();
          }, delayBetweenTexts);
        }
      }
    };
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Start the animation if not paused
    if (!isPaused) {
      timeoutRef.current = setTimeout(animateText, 50);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayedText, isDeleting, currentTextIndex, isPaused, texts, typingSpeed, deletingSpeed, delayBetweenTexts]);
  
  // Add a blinking cursor effect with CSS
  return (
    <span className={className}>
      {displayedText}
      <span className="border-r-2 border-current ml-0.5 animate-[blink_1s_step-end_infinite]"></span>
    </span>
  );
};

export default AnimatedText;
