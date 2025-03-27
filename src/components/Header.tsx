
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Toggle } from "./ui/toggle";

const Header: React.FC = () => {
  const location = useLocation();
  const showBackButton = location.pathname !== "/";
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full py-4 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {showBackButton ? (
          <Link to="/" className="icon-button">
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Link>
        ) : (
          <div className="w-10">{/* Placeholder for spacing */}</div>
        )}
        
        <div className="flex-1 flex justify-end items-center space-x-4">
          <Toggle 
            pressed={theme === "light"} 
            onPressedChange={toggleTheme}
            aria-label="Toggle theme"
            className="icon-button"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-primary" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </Toggle>
          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
