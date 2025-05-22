import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LogIn, LogOut, Moon, Sun, UserRound, Bug, XCircle, Star, LayoutGrid } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useNavigate } from "react-router-dom";
import { Toggle } from "./ui/toggle";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDebug } from "@/context/DebugContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useSubscription } from "@/context/SubscriberContext";
import CheckoutModal from "./CheckoutModal";
import PricingModal from "./PricingModal/PricingModal";
import { toast } from "@/hooks/use-toast";

const Header: React.FC = () => {
  const location = useLocation();
  const showBackButton = location.pathname !== "/" && location.pathname !== "/auth";
  const { tier, canRender, cancelledButActive } = useSubscription();
  const { theme, toggleTheme } = useTheme();
  const { debugMode, toggleDebugMode } = useDebug();
  const navigate = useNavigate();
  const { user, session, signOut, getRedirectUrl } = useAuth();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const config = useAppConfig();

  useEffect(() => {
    if (user && localStorage.getItem('redirectToCheckoutAfterLogin') === 'true') {
      setIsCheckoutModalOpen(true);
      localStorage.removeItem('redirectToCheckoutAfterLogin');
    }
  }, [user]);

  // Check if we're in production environment
  const isProduction = () => {
    return window.location.hostname.includes('vercel.app') || 
           process.env.NODE_ENV === 'production' ||
           import.meta.env.VITE_DISABLE_DEBUG === 'true';
  };

  const handleDirectGoogleSignIn = async () => {
    try {
      const redirectUrl = getRedirectUrl();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      // No onClose() here as we are not in a modal context.
      // Potentially navigate or show a toast message upon successful initiation.
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !user.id) {
      console.error("User ID not found for cancelling subscription.");
      // Optionally, show a toast or notification to the user
      return;
    }

    if (!config) {
      console.error("App configuration not loaded.");
      // Optionally, show a toast or notification to the user
      return;
    }

    try {
      const response = await fetch(config.edgeFunctions.cancelSubscription, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || config.supabase.publishableKey}`
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to cancel subscription:", errorData);
        // Optionally, show a toast or notification to the user about the failure
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      // Handle successful cancellation
      console.log("Subscription cancellation request successful");
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been successfully cancelled. You will lose access to premium features at the end of the current billing period.",
      });

      navigate('/'); 
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      // Optionally, show a toast or notification to the user about the error
    }
  };

  const handlePayment = () => {
    setIsCheckoutModalOpen(false);
    window.location.reload();
  }

  return (
    <header className="w-full py-4 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {showBackButton ? (
          <Link to="/" className="icon-button">
            <ArrowLeft className="h-5 w-5 text-background" />
          </Link>
        ) : (
          <div className="w-10">{/* Placeholder for spacing */}</div>
        )}
        
        <div className="flex-1 flex justify-end items-center space-x-2 sm:space-x-4">
          {!isProduction() && (
            <Toggle 
            pressed={debugMode} 
            onPressedChange={toggleDebugMode}
            aria-label="Toggle debug mode"
            className="icon-button h-10 w-10"
            >
              <Bug className={`h-5 w-5  ${debugMode ? 'text-red-500' : 'text-background'}`} />
            </Toggle>
          )}
          
          <Toggle 
            pressed={theme === "light"} 
            onPressedChange={toggleTheme}
            aria-label="Toggle theme"
            className="icon-button h-10 w-10"
            >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Toggle>
          
          {user && !canRender() && (
            <Button 
              variant="outline"
              size="sm"
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-full hover:bg-transparent border-yellow-400 hover:text-yellow-400 bg-amber-400 text-black font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 sm:gap-2"
              onClick={() => setIsCheckoutModalOpen(true)}
            >
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Premium</span>
            </Button>
          )}

          {!user && location.pathname !== "/auth" && (
            <Button
            variant="default"
            size="sm"
            className="h-10 px-6 rounded-full bg-foreground text-background font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            onClick={() => setIsPricingModalOpen(true)}
            >
              <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Sign Up</span>
            </Button>
          )}

          {!user && location.pathname !== "/auth" && (
            <Button 
              variant="default" 
              size="lg" 
              className="h-10 px-6 rounded-full bg-foreground text-background font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
              onClick={handleDirectGoogleSignIn}
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          )}    

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all font-fredoka">
                  <AvatarFallback className="bg-purple-500 text-white text-lg">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" sideOffset={10} className="w-80 font-fredoka">
                <DropdownMenuItem className="text-sm text-muted-foreground text-center justify-center">
                  {user.email}
                </DropdownMenuItem>
                { tier === `premium` && !cancelledButActive() && (
                  <DropdownMenuItem 
                    onClick={handleCancelSubscription} 
                    className="text-destructive focus:text-destructive cursor-pointer text-center justify-center"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    <span>Cancel Subscription</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer text-center justify-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {user && <CheckoutModal isOpen={isCheckoutModalOpen} onClose={handlePayment} />}
      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
    </header>
  );
};

export default Header;
