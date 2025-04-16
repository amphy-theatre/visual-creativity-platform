
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

// Helper to determine if we're in production environment
const isProduction = () => {
  return import.meta.env.VITE_DEPLOYMENT_ENVIRONMENT !== 'testing';
};

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    // In production, default to false regardless of localStorage
    if (isProduction()) {
      return false;
    }
    
    // In testing environment, default to true
    return true;
  });

  useEffect(() => {
    // Only store in localStorage in testing env where it can be toggled
    if (!isProduction()) {
      localStorage.setItem("debug-mode", debugMode.toString());
    }
    
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
    // Only allow toggling in testing environment
    if (!isProduction()) {
      setDebugMode((prevMode) => !prevMode);
    }
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
