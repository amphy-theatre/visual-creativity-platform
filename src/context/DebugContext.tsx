import React, { createContext, useContext, useState, useEffect } from "react";

type DebugContextType = {
  debugMode: boolean;
  toggleDebugMode: () => void;
};

const DebugContext = createContext<DebugContextType | undefined>(undefined);

// Original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [debugMode, setDebugMode] = useState<boolean>(() => {
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
    <DebugContext.Provider value={{ debugMode, toggleDebugMode }}>
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
