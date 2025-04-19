import React, { useRef, useState, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextAreaInputProps {
  initialValue: string;
  onSubmit: () => void;
  onChange: (value: string) => void;
  maxLength?: number;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  initialValue = "",
  onSubmit,
  onChange,
  maxLength = 200
}) => {
  const [value, setValue] = useState(initialValue);
  const [charCount, setCharCount] = useState(initialValue.length);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setValue(text);
    setCharCount(text.length);
    onChange(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div 
        className="rainbow-border-container p-1 rounded-md" 
        style={{ 
          minHeight: 'auto', 
          backgroundImage: 'conic-gradient(from var(--angle, 0deg), hsl(var(--hue, 0)), hsl(calc(var(--hue, 0) + 60)), hsl(calc(var(--hue, 0) + 120)), hsl(calc(var(--hue, 0) + 180)), hsl(calc(var(--hue, 0) + 240)), hsl(calc(var(--hue, 0) + 300)), hsl(var(--hue, 0)))'
        }}
      >
        <Textarea
          ref={textareaRef}
          autoFocus
          className={`w-full resize-none text-xl md:text-2xl font-bold bg-card border-none shadow-none focus:ring-0 p-0 placeholder:text-foreground/50 min-h-[10rem]`}
          placeholder=""
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          style={{ lineHeight: 'normal' }}
        />
      </div>
      <div className="flex justify-end">
        <span className="text-sm text-muted-foreground">{charCount}/{maxLength} characters</span>
      </div>
    </div>
  );
};

export default TextAreaInput;
