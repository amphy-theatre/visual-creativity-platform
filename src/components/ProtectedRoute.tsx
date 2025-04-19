
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isGuestMode, setGuestMode, isTrialUsed } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Check if this is a page refresh by looking at the navigation type
  useEffect(() => {
    const isPageRefresh = window.performance 
      ? window.performance.navigation.type === 1 
      : false;
      
    // Only set redirect flag if it's a page refresh or new visit (not immediate after using trial)
    if (isGuestMode && isTrialUsed) {
      setShouldRedirect(isPageRefresh);
    }
  }, [isGuestMode, isTrialUsed]);

  // If the auth state is still loading, show the loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If they're in guest mode and have used their trial, redirect to auth page
  // but only if shouldRedirect is true (which means it's a page refresh)
  if (isGuestMode && isTrialUsed && shouldRedirect) {
    return <Navigate to="/auth" />;
  }

  // If there's no authenticated user, automatically set guest mode
  // so they can access the app directly without auth
  if (!user && !isGuestMode) {
    setGuestMode(true);
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
