
import React, { useEffect, useState, useRef } from 'react';
import TypeIt from 'typeit';

interface AnimatedTextProps {
  texts?: string[];
  phrasesFile?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  texts = [],
  phrasesFile,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenTexts = 2000,
  className = "",
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const typeItRef = useRef<TypeIt | null>(null);
  const [phrases, setPhrases] = useState<string[]>(texts);
  
  // Load phrases from file if provided
  useEffect(() => {
    if (phrasesFile) {
      fetch(phrasesFile)
        .then(response => response.text())
        .then(data => {
          const loadedPhrases = data
            .split('\n')
            .filter(line => line.trim() !== '');
          if (loadedPhrases.length > 0) {
            setPhrases(loadedPhrases);
          }
        })
        .catch(error => {
          console.error('Error loading phrases file:', error);
          // Fallback to provided texts if file loading fails
          if (texts.length > 0) {
            setPhrases(texts);
          }
        });
    }
  }, [phrasesFile, texts]);
  
  useEffect(() => {
    // Only proceed if we have a DOM element and at least one phrase
    if (!elementRef.current || phrases.length === 0) return;
    
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
        // Get random phrases to start with
        const getRandomPhrase = () => phrases[Math.floor(Math.random() * phrases.length)];
        let currentPhrase = getRandomPhrase();
        
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
        
        // Type the first phrase
        instance.type(currentPhrase).pause(delayBetweenTexts).delete();
        
        // Setup a callback to get a new random phrase each time
        instance.exec(async (instance) => {
          const continueTyping = () => {
            const newPhrase = getRandomPhrase();
            instance.type(newPhrase).pause(delayBetweenTexts).delete().exec(continueTyping);
          };
          continueTyping();
        });
        
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
  }, [phrases, typingSpeed, deletingSpeed, delayBetweenTexts]);
  
  return <div ref={elementRef} className={className}></div>;
};

export default AnimatedText;
