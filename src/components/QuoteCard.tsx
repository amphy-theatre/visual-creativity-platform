
import React from "react";

interface QuoteCardProps {
  quote: string;
  onClick: () => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onClick }) => {
  return (
    <div 
      className="quote-card animate-scale-in flex items-center justify-center p-6"
      onClick={onClick}
    >
      <p className="text-center text-foreground text-lg break-words flex-wrap">{quote}</p>
    </div>
  );
};

export default QuoteCard;
