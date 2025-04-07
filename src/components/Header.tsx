
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LogIn, LogOut, Moon, Sun, UserRound, Bug } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Toggle } from "./ui/toggle";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDebug } from "@/context/DebugContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

// Helper to determine if we're in production - matching the same logic from DebugContext
const isProduction = () => {
  return window.location.hostname.includes('vercel.app') || 
         process.env.NODE_ENV === 'production' ||
         import.meta.env.VITE_DISABLE_DEBUG === 'true';
};

const Header: React.FC = () => {
  const location = useLocation();
  const showBackButton = location.pathname !== "/" && location.pathname !== "/auth";
  const { theme, toggleTheme } = useTheme();
  const { debugMode, toggleDebugMode } = useDebug();
  const { user, signOut } = useAuth();
  
  // Determine if we should show the debug toggle
  const showDebugToggle = !isProduction();

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
          {!user && location.pathname !== "/auth" && (
            <Link to="/auth">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <LogIn className="h-5 w-5 text-primary" />
              </Button>
            </Link>
          )}

          {showDebugToggle && (
            <Toggle 
              pressed={debugMode} 
              onPressedChange={toggleDebugMode}
              aria-label="Toggle debug mode"
              className="icon-button h-10 w-10 rounded-full"
            >
              <Bug className={`h-5 w-5 ${debugMode ? 'text-red-500' : 'text-primary'}`} />
            </Toggle>
          )}
          
          <Toggle 
            pressed={theme === "light"} 
            onPressedChange={toggleTheme}
            aria-label="Toggle theme"
            className="icon-button h-10 w-10 rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-primary" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </Toggle>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <AvatarFallback className="bg-purple-500 text-white text-lg">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" sideOffset={10} className="w-56">
                <DropdownMenuItem className="text-sm text-muted-foreground text-center justify-center">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer text-center justify-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
