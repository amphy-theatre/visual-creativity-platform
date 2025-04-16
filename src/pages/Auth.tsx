
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { user, getRedirectUrl, isTrialUsed } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTryForFree = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#0C111F] text-white">
      {/* Left side with branding */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-12">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-4xl font-bold mb-2">Amphytheatre</h1>
          <p className="text-gray-400 mb-6">Welcome Back</p>
          
          <p className="text-sm text-gray-400 mb-8">
            Sign in to Continue - Sign up is completely free!
          </p>
          
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white py-6 flex items-center justify-center gap-3"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
                <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
                <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
              </svg>
              Sign in with Google
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
                ? "Sign-up free for more prompts and features!" 
                : "Try one recommendation for free"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Right side with description */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center px-8 lg:px-16 py-12 border-l border-gray-800">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-center mb-4">
            Your Personal Emotion-Based<br />Movie Guide
          </h2>
          
          <p className="text-center text-gray-300 mb-6">
            Discover films that perfectly match your current mood and emotions.
          </p>
          
          <p className="text-center text-gray-400 mb-8">
            Express how you feel, and we'll curate a personalized collection of 
            movies that resonate with your emotional state. From heartwarming 
            comedies to thought-provoking dramas, find the perfect watch for 
            every moment.
          </p>
          
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
