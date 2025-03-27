
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Header: React.FC = () => {
  const location = useLocation();
  const showBackButton = location.pathname !== "/";

  return (
    <header className="w-full py-4 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {showBackButton ? (
          <Link to="/" className="icon-button">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
        ) : (
          <div className="w-10">{/* Placeholder for spacing */}</div>
        )}
        
        <div className="flex-1 flex justify-end items-center space-x-4">
          <button className="icon-button opacity-50">
            <span className="sr-only">Theme</span>
            <svg 
              className="h-5 w-5 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
          </button>
          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
