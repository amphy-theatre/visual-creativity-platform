
import React, { useRef, useState, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextAreaInputProps {
  initialValue: string;
  seamlessInput?: boolean;
  onSubmit: () => void;
  onChange: (value: string) => void;
  maxLength?: number;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  initialValue = "",
  seamlessInput = false,
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
      <div className="rainbow-border-container">
        <Textarea
          ref={textareaRef}
          autoFocus
          className={`${seamlessInput ? 
            "w-full resize-none text-6xl md:text-7xl font-bold bg-transparent border-none shadow-none focus:ring-0 p-0 text-center placeholder:text-foreground/50 min-h-[4rem]" : 
            "w-full resize-none text-xl"}`}
          placeholder=""
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
        />
      </div>
      <div className="flex justify-end">
        <span className="text-sm text-muted-foreground">{charCount}/{maxLength} characters</span>
      </div>
    </div>
  );
};

export default TextAreaInput;
