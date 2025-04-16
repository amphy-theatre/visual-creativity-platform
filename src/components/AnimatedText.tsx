
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
    const currentFullText = texts[currentTextIndex];
    
    const animateText = () => {
      if (isDeleting) {
        // Deleting phase
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
          timeoutRef.current = setTimeout(animateText, deletingSpeed);
        } else {
          // When fully deleted, move to next text
          setIsDeleting(false);
          const nextIndex = (currentTextIndex + 1) % texts.length;
          setCurrentTextIndex(nextIndex);
        }
      } else {
        // Typing phase
        if (displayedText.length < currentFullText.length) {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
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
    
    // Only start animation if not paused
    if (!isPaused) {
      timeoutRef.current = setTimeout(animateText, 50);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayedText, isDeleting, currentTextIndex, isPaused, texts, typingSpeed, deletingSpeed, delayBetweenTexts]);
  
  return <span className={className}>{displayedText}</span>;
};

export default AnimatedText;
