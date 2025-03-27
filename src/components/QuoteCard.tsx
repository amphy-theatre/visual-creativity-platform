
import React from "react";

interface QuoteCardProps {
  quote: string;
  onClick: () => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onClick }) => {
  return (
    <div 
      className="quote-card animate-scale-in"
      onClick={onClick}
    >
      <p className="text-center text-foreground text-lg">{quote}</p>
    </div>
  );
};

export default QuoteCard;
