
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isGuestMode, setGuestMode, isTrialUsed } = useAuth();

  // If the auth state is still loading, show the loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If they're in guest mode and have used their trial, redirect to auth page
  if (isGuestMode && isTrialUsed) {
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
