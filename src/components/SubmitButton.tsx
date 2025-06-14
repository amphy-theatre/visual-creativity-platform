import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  remainingPrompts?: number;
  showPromptCount?: boolean;
  loadingText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  onClick,
  isLoading,
  isDisabled,
  remainingPrompts,
  showPromptCount = false,
  loadingText = "Generating Quotes...",
}) => {
  return (
    <div className="space-y-2">
      <Button
        onClick={onClick}
        disabled={isDisabled}
        className={`w-full py-3 px-6 rounded-full shadow-lg text-background font-semibold bg-foreground transition-all duration-300 ease-in-out hover:scale-105 hover:bg-green-500 active:bg-green-500 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText}
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4V20M12 4L6 10M12 4L18 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Get Personalized Recommendations
          </>
        )}
      </Button>

      {showPromptCount && remainingPrompts !== undefined && (
        <div className="text-sm text-gray-500 text-center">
          {remainingPrompts} prompt{remainingPrompts !== 1 ? 's' : ''} remaining this month
        </div>
      )}
    </div>
  );
};

export default SubmitButton;
