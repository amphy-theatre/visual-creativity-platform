import React, { useRef, useState, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextAreaInputProps {
  initialValue: string;
  onSubmit: () => void;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  initialValue = "",
  onSubmit,
  onChange,
  maxLength = 200,
  placeholder = ""
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
      >
        <Textarea
          ref={textareaRef}
          autoFocus
          className={`w-full resize-none text-xl md:text-2xl bg-card border-none outline-none shadow-none focus:ring-0 focus:border-nonefocus:outline-none p-0 px-4 py-4 placeholder:text-foreground/50 min-h-[10rem] focus-visible:outline-none focus-visible:ring-0`}
          placeholder={placeholder}
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
