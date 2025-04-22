import React, { useState } from "react";
import TextAreaInput from "./TextAreaInput";
import AnimatedText from "./AnimatedText";

interface AnimatedPlaceholderTextAreaProps {
  initialValue: string;
  onSubmit: () => void;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholderPhrases: string[];
}

const AnimatedPlaceholderTextArea: React.FC<AnimatedPlaceholderTextAreaProps> = ({
  initialValue = "",
  onSubmit,
  onChange,
  maxLength = 200,
  placeholderPhrases = ["Type here..."]
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const showPlaceholder = inputValue === "" && !isFocused;

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onChange(value); // Forward the change to the parent
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative w-full">
      {/* Animated Placeholder - Always rendered, controlled by opacity */}
      <div 
        className={`absolute inset-0 z-10 flex items-start justify-start text-left p-0 px-4 py-4 pointer-events-none transition-opacity duration-200 ${showPlaceholder ? 'opacity-100' : 'opacity-0'}`}
      >
         {/* Match font size/weight/color with TextAreaInput's placeholder */}
        <AnimatedText
          texts={placeholderPhrases}
          typingSpeed={60}
          deletingSpeed={30}
          delayBetweenTexts={1500}
          className="text-xl md:text-2xl text-foreground/50 w-full"
        />
      </div>

      {/* Actual TextAreaInput */}
      <TextAreaInput
        initialValue={initialValue}
        onSubmit={onSubmit}
        onChange={handleInputChange} // Use the wrapper's handler
        maxLength={maxLength}
        placeholder="" // Clear the default placeholder
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  );
};

export default AnimatedPlaceholderTextArea; 