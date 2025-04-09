
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isTrialUsed: boolean;
  setTrialUsed: (used: boolean) => void;
  isGuestMode: boolean;
  setGuestMode: (enabled: boolean) => void;
  getRedirectUrl: () => string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrialUsed, setTrialUsed] = useState(() => {
    const storedValue = sessionStorage.getItem("trialUsed");
    return storedValue ? JSON.parse(storedValue) : false;
  });
  const [isGuestMode, setGuestMode] = useState(false);
  const navigate = useNavigate();

  // Persist trial usage to session storage when it changes
  useEffect(() => {
    sessionStorage.setItem("trialUsed", JSON.stringify(isTrialUsed));
  }, [isTrialUsed]);

  // Function to determine the redirect URL based on origin
  const getRedirectUrl = (): string => {
    const hostname = window.location.hostname;
    
    // Check if we're on a testing domain
    if (hostname.startsWith('testing.')) {
      return window.location.origin;
    }
    
    // Default redirect to the current origin
    return window.location.origin;
  };

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setGuestMode(false);
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signOut, 
      isTrialUsed, 
      setTrialUsed, 
      isGuestMode, 
      setGuestMode,
      getRedirectUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
