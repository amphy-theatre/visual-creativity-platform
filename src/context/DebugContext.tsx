
import React, { createContext, useContext, useState, useEffect } from "react";

type DebugContextType = {
  debugMode: boolean;
  toggleDebugMode: () => void;
  setDebugMode: (value: boolean) => void;
};

const DebugContext = createContext<DebugContextType | undefined>(undefined);

// Original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

// Helper to determine if we're in production
const isProduction = () => {
  return window.location.hostname.includes('vercel.app') || 
         process.env.NODE_ENV === 'production' ||
         import.meta.env.VITE_DISABLE_DEBUG === 'true';
};

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    // In production, default to false regardless of localStorage
    if (isProduction()) {
      return false;
    }
    
    // Otherwise, check localStorage
    const savedDebugMode = localStorage.getItem("debug-mode");
    return savedDebugMode === "true";
  });

  useEffect(() => {
    localStorage.setItem("debug-mode", debugMode.toString());
    
    // Override console methods based on debug mode
    if (debugMode) {
      // Restore original console methods when debug mode is enabled
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    } else {
      // Disable console output when debug mode is disabled
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      // Keep console.error enabled for critical errors
      console.error = originalConsole.error;
    }

    return () => {
      // Restore original console methods on unmount
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    };
  }, [debugMode]);

  const toggleDebugMode = () => {
    setDebugMode((prevMode) => !prevMode);
  };

  return (
    <DebugContext.Provider value={{ debugMode, toggleDebugMode, setDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error("useDebug must be used within a DebugProvider");
  }
  return context;
}
