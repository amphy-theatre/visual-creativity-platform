import React, { useEffect, useRef } from 'react';
import TypeIt from 'typeit';

interface AnimatedTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
  useRandomSelection?: boolean;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenTexts = 2000,
  className = "",
  useRandomSelection = false,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const typeItRef = useRef<TypeIt | null>(null);
  
  useEffect(() => {
    // Only proceed if we have a DOM element and at least one text
    if (!elementRef.current || texts.length === 0) return;
    
    // Safely clean up previous instance to avoid null reference errors
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
    
    // Initialize TypeIt with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!elementRef.current) return; // Double-check element still exists
      
      try {
        // Initialize TypeIt with an empty element
        const instance = new TypeIt(elementRef.current, {
          speed: typingSpeed,
          deleteSpeed: deletingSpeed,
          lifeLike: true,
          loop: true,
          waitUntilVisible: true,
          cursor: true,
          startDelay: 250 // Small delay before starting
        });
        
        // Function to get a random item from the texts array
        const getRandomText = () => {
          return texts[Math.floor(Math.random() * texts.length)];
        };
        
        // If we're using random selection, get a random text each time
        // Otherwise use the sequential texts provided
        if (useRandomSelection) {
          // For random mode, we need to set up a special handler
          // Start with a random text
          let firstText = getRandomText();
          instance.type(firstText).pause(delayBetweenTexts).delete();
          
          // After each deletion, queue a new random text
          // We need to use the after method to insert dynamic content
          instance.after(() => {
            // This function runs each time after the delete completes
            // It inserts a new randomly selected text
            const typeAndDelete = () => {
              const randomText = getRandomText();
              instance
                .type(randomText)
                .pause(delayBetweenTexts)
                .delete()
                .after(typeAndDelete);
            };
            
            // Start the first iteration
            typeAndDelete();
            
            // Return the instance to continue the chain
            return instance;
          });
        } else {
          // Standard sequential mode
          let currentInstance = instance.type(texts[0]).pause(delayBetweenTexts).delete();
          
          // For each additional text, add type and delete actions
          for (let i = 1; i < texts.length; i++) {
            currentInstance = currentInstance
              .type(texts[i])
              .pause(delayBetweenTexts)
              .delete();
          }
        }
        
        // Start the animation
        instance.go();
        
        // Save the instance for cleanup
        typeItRef.current = instance;
      } catch (error) {
        console.log('Error initializing TypeIt:', error);
      }
    }, 100); // Small delay to ensure DOM ready
    
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
  }, [texts, typingSpeed, deletingSpeed, delayBetweenTexts, useRandomSelection]);
  
  return <div ref={elementRef} className={className}></div>;
};

export default AnimatedText;
