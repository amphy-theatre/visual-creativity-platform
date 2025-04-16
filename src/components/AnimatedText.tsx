
import React, { useEffect, useRef } from 'react';
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
  
  useEffect(() => {
    // Only proceed if we have a DOM element and at least one text
    if (!elementRef.current || texts.length === 0) return;
    
    // Clean up previous instance
    if (typeItRef.current) {
      try {
        typeItRef.current.destroy();
      } catch (error) {
        console.log('Error cleaning up previous TypeIt instance:', error);
      }
    }
    
    // Clear any existing content from the element
    if (elementRef.current) {
      elementRef.current.innerHTML = '';
    }
    
    // Get a random text from the array
    const getRandomText = () => texts[Math.floor(Math.random() * texts.length)];
    
    // Setup TypeIt with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!elementRef.current) return;
      
      try {
        // Initialize TypeIt with proper configuration
        const instance = new TypeIt(elementRef.current, {
          speed: typingSpeed,
          deleteSpeed: deletingSpeed,
          lifeLike: true,
          loop: true,
          waitUntilVisible: true,
          cursor: true,
          afterStep: (instance) => {
            // Check if this step completed a deletion sequence
            const queueItems = instance.getQueue();
            if (queueItems.length === 0) {
              // When queue is empty (after delete completes), add a new random text
              instance
                .type(getRandomText())
                .pause(delayBetweenTexts)
                .delete();
            }
          }
        });
        
        // Start with a random text
        instance
          .type(getRandomText())
          .pause(delayBetweenTexts)
          .delete();
        
        // Start the animation
        instance.go();
        
        // Save the instance for cleanup
        typeItRef.current = instance;
      } catch (error) {
        console.log('Error initializing TypeIt:', error);
      }
    }, 100);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (typeItRef.current) {
        try {
          typeItRef.current.destroy();
          typeItRef.current = null;
        } catch (error) {
          console.log('Error during cleanup:', error);
        }
      }
    };
  }, [texts, typingSpeed, deletingSpeed, delayBetweenTexts]);
  
  return <div ref={elementRef} className={className}></div>;
};

export default AnimatedText;
