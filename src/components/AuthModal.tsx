import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { getRedirectUrl, isTrialUsed } = useAuth();
  const [blinkText, setBlinkText] = useState("x __ x");

  // Create blinking effect for the button text when trial is used
  useEffect(() => {
    if (!isTrialUsed) return;

    let currentTimeout: NodeJS.Timeout;

    const blink = () => {
      setBlinkText("- __ -");
      currentTimeout = setTimeout(() => {
        setBlinkText("x __ x");
        currentTimeout = setTimeout(blink, 800);
      }, 400);
    };

    blink();

    return () => {
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [isTrialUsed]);

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

  const handleTryForFree = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92%] sm:max-w-[80%] md:max-w-[80%] lg:max-w-[80%] xl:max-w-[80%] p-0 border-gray-800 bg-transparent max-h-[90vh] sm:max-h-[80vh] overflow-auto sm:overflow-hidden rounded-lg">
        <div className="flex flex-col lg:flex-row bg-[#0C111F] text-white rounded-lg relative">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 bg-[#0C111F] ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-20">
            <X className="h-4 w-4 text-white" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          {/* Left side with branding */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-16 py-10 sm:py-12">
            <div className="max-w-md mx-auto w-full">
              <h1 className="text-4xl sm:text-5xl mb-2">Amphytheatre</h1>
              
              <p className="text-xl text-gray-400 mb-6 hidden lg:block">
                Sign in
              </p>
              
              <div className="space-y-4 hidden lg:block">
                <Button
                  variant="outline"
                  className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white py-5 sm:py-6 flex items-center justify-center gap-3"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
                    <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
                    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
                  </svg>
                  Continue with Google
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0C111F] px-2 text-gray-400">Or</span>
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleTryForFree}
                  disabled={isTrialUsed}
                >
                  {isTrialUsed 
                    ? blinkText
                    : "Try"}
                </Button>
              </div>
              
              {/* Only visible on mobile
              <div className="space-y-4 lg:hidden">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0C111F] px-2 text-gray-400">Or</span>
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleTryForFree}
                  disabled={isTrialUsed}
                >
                  {isTrialUsed 
                    ? blinkText
                    : "Try"}
                </Button>
              </div> */}
            </div>
          </div>
          
          {/* Right side with description - Now visible on all screen sizes */}
          <div className="lg:flex lg:w-1/2 flex-col justify-center items-center px-8 lg:px-16 py-12 border-l border-gray-800 hidden lg:block">
            <div className="max-w-lg">
              <h2 className="text-3xl text-center mb-4">
                Your Personal Vibe-Based<br />Movie Guide
              </h2>
              
              <p className="text-center text-xl text-gray-300 mb-6">
                Find media to match your current mood.
              </p>
              
              <p className="text-center text-xl text-gray-400 mb-8">
                Sign up for <span className="text-red-400">100 free prompts</span>, <span className="text-blue-400">personalized recommendations</span>, <span className="text-purple-400">watch history uploads</span>, and more <span className="text-amber-400">exciting features</span> coming soon!
              </p>
              
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              </div>
            </div>
          </div>
          
          {/* Description area for mobile only - under the login section */}
          <div className="px-6 py-6 lg:hidden pt-0">
            <div className="max-w-lg mx-auto">
              <h2 className="text-2xl text-center mb-4">
                Your Personal, Vibe-Based Movie Guide
              </h2>
              
              <p className="text-center text-lg text-gray-300 mb-4">
                Find media to match your current mood.
              </p>
              
              <p className="text-center text-lg text-gray-400 mb-6">
                Sign up for <span className="text-red-400">100 free prompts</span>, <span className="text-blue-400">personalized recommendations</span>, <span className="text-purple-400">watch history uploads</span>, and more <span className="text-amber-400">exciting features</span> coming soon!
              </p>
              
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sticky Google button for mobile only */}
        <div className="sticky bottom-0 w-full p-4 bg-[#0C111F] border-t border-gray-800 lg:hidden">
          <Button
            variant="outline"
            className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white py-5 flex items-center justify-center gap-3"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
            </svg>
            Continue with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal; 