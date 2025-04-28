import React, { useEffect, useRef, useState } from 'react';
import TypeIt from 'typeit';
import { phrases } from '@/phrases';
interface AnimatedTextProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  texts,
  typingSpeed = 130,
  deletingSpeed = 100,
  delayBetweenTexts = 2000,
  className = "",
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const typeItRef = useRef<any>(null);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  // const [typeItInstance, setTypeItInstance] = useState<typeof TypeIt | null>(null);
  // const [startup, setStartup] = useState<boolean>(true);

  // Function to get 5 random phrases from the text array
  const getRandomPhrases = () => {
    const shuffled = [...texts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };
  
  useEffect(() => {
    const elementId = `typeit-${Math.random().toString(36).substring(7)}`;
    if (!elementRef.current) return;
    elementRef.current.id = elementId; // Assign the ID
    setSelectedPhrases(getRandomPhrases());

    const instance = new TypeIt(`#${elementId}`, {
      speed: typingSpeed,
      deleteSpeed: deletingSpeed,
      waitUntilVisible: true,
      cursor: true,
      loop: true,
    });
    instance.type("Ask Amphytheatre for ")
    phrases.forEach(phrase => {
      instance.type(phrase)
      .pause(delayBetweenTexts)
      .delete(phrase.length)
    })

    instance.go();
    // setTypeItInstance(instance);
  },[])

  // // Initialize or reset selected phrases
  // useEffect(() => {
  //   setSelectedPhrases(getRandomPhrases());
  // }, [texts]);
  
  // useEffect(() => {
  //   if(startup) {
  //     setStartup(false);
  //   }
    
  //   typeItInstance.reset();
  //   // Start the animation
  // }, [selectedPhrases]);
  
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