
import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { useAppConfig } from "@/hooks/useAppConfig";

const FreeTrialBanner: React.FC = () => {
  const { isGuestMode, isTrialUsed } = useAuth();
  const navigate = useNavigate();
  const config = useAppConfig();
  
  // Only show the banner if user is in guest mode AND has used their trial
  if (!isGuestMode || !isTrialUsed) {
    return null;
  }
  
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 mb-6">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <div className="flex-1">
          <p>If you like what you see, SIGN UP FOR FREE to continue using Amphytheatre! You get 50 prompts a month.</p>
          {config.environment === 'testing' && (
            <p className="mt-1 text-xs">
              <span className="font-semibold">Environment:</span> {config.environment} 
              <span className="ml-2 font-semibold">DB:</span> {config.supabase.url.split("//")[1]}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/auth")}
          className="border-amber-800 text-amber-800 hover:bg-amber-100 dark:border-amber-200 dark:text-amber-200 dark:hover:bg-amber-900"
        >
          Sign in/up
        </Button>
      </div>
    </div>
  );
};

export default FreeTrialBanner;
