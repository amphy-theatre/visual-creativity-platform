import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { getRedirectUrl } = useAuth();

  if (!isOpen) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = getRedirectUrl();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGetStartedAndSignIn = async () => {
    try {
      localStorage.setItem('redirectToCheckoutAfterLogin', 'true');
      const redirectUrl = getRedirectUrl();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      onClose();
    } catch (error: any) {
      localStorage.removeItem('redirectToCheckoutAfterLogin');
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl flex flex-col items-center bg-background p-6 md:p-8 rounded-lg shadow-xl transform transition-all duration-300 ease-out translate-y-full data-[state=open]:translate-y-0 max-h-[calc(100vh-2rem)] overflow-hidden" data-state={isOpen ? 'open' : 'closed'}>
        
        <div className="text-center mb-6 md:mb-8 px-4">
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-3">amphytheatre</h1>
          <h2 className="text-2xl md:text-3xl text-foreground mb-2">
            Your Personal Vibe-Based<br />Movie Guide
          </h2>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-grow overflow-y-auto pb-6">
          {/* Casual Tier */}
          <div className="bg-card p-6 rounded-lg flex flex-col">
            <h3 className="text-2xl font-semibold text-foreground mb-1">Casual</h3>
            <p className="text-5xl font-bold text-foreground mb-1">Free</p>
            <div className="h-px bg-border my-4"></div>
            <p className="text-2xl font-semibold text-foreground mb-3">Includes</p>
            <ul className="space-y-2 text-muted-foreground mb-6 text-xl">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                15 prompts
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Links to streaming providers
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Easy access to movie trailers
              </li>
            </ul>
            <div className="mt-auto">
              <button 
                onClick={handleGoogleSignIn}
                className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-foreground font-fredoka font-medium py-3 px-4 rounded-md flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                  <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
                  <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
                  <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          {/* Buff Tier */}
          <div className="bg-card border-2 border-cyan-300 p-6 rounded-lg flex flex-col">
            <h3 className="text-2xl font-semibold text-foreground mb-1">Movie Buff</h3>
            <div className="flex items-baseline mb-1">
              <p className="text-5xl font-bold text-foreground mr-1"><span className='font-thin text-muted-foreground'>CA</span>
              $2.99</p>
              <span className="text-xl text-muted-foreground">/month</span>
            </div>
            <div className="h-px bg-border my-4"></div>
            <p className="text-2xl font-semibold text-foreground mb-3">Everything in Casual, plus</p>
            <ul className="space-y-2 text-muted-foreground mb-6 text-xl">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                200 total prompts
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Movie history import
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Personalized recommendations
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                More exciting features coming soon!
              </li>
            </ul>
            <div className="mt-auto">
              <button 
                onClick={handleGetStartedAndSignIn}
                className="w-full bg-white text-black hover:bg-white/90 font-fredoka py-3 px-4 rounded-md"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
        
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="Close pricing modal"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default PricingModal; 