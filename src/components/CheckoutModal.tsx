import { useEffect, useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { useAppConfig } from "@/hooks/useAppConfig";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

// Initialize Stripe outside of the component to avoid recreating on every render
const stripePromise = loadStripe(import.meta.env.VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const config = useAppConfig();
  const { user, session } = useAuth();

  useEffect(() => {
    if (!isOpen || !user || !session) {
      // Don't fetch if the modal isn't open, or if user/session is not available
      if (isOpen && (!user || !session)) {
        console.error("User or session not available for checkout.");
        // Optionally, show a message to the user
      }
      setClientSecret(null); // Reset client secret when modal is closed or user/session is missing
      return;
    }

    // Fetch a new client secret only when the modal is opened and user/session are present
    fetch(config.edgeFunctions.checkoutSession, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        userId: user.id,
        tier: 'premium', // Assuming 'premium' is the target tier
      }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch client secret');
      }
      return res.json();
    })
    .then(data => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        console.error("Client secret not found in response:", data);
        setClientSecret(null); // Ensure clientSecret is null if not found
      }
    })
    .catch(error => {
      console.error("Error fetching client secret:", error);
      setClientSecret(null); // Ensure clientSecret is null on error
      // Optionally, inform the user about the error
    });
  }, [isOpen, user, session, config]);

  const appearance = {
    theme: 'night', // or 'stripe' or 'flat' or 'none'
    variables: {
      colorPrimary: '#6D28D9', // purple-600
      colorBackground: '#0C111F', // Your site's dark background
      colorText: '#FFFFFF',
      colorDanger: '#EF4444', // red-500
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
      // See all possible variables below
    }
  };
  
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92%] sm:max-w-md p-0 border-gray-800 bg-[#0C111F] text-white max-h-[90vh] overflow-auto rounded-lg font-fredoka">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">Upgrade to Premium</DialogTitle>
          <DialogDescription className="text-gray-400">
            and get more prompts, more personalized recommendations with watch history uploads, and other features coming soon!
          </DialogDescription>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 bg-[#0C111F] ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-20">
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <div className="p-6 pt-0">
          {clientSecret && stripePromise && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm onPaymentSuccess={onClose} />
            </Elements>
          )}
          {!clientSecret && (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-400">Loading payment form...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal; 