import { useEffect, useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { useAppConfig } from "@/hooks/useAppConfig";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
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
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const config = useAppConfig();
  const { user, session } = useAuth();
  const { theme: currentTheme } = useTheme();

  useEffect(() => {
    if (!isOpen || !user || !session) {
      if (isOpen && (!user || !session)) {
        console.error("User or session not available for checkout.");
      }
      setClientSecret(null);
      setAmount(null);
      setCurrency(null);
      return;
    }

    fetch(config.edgeFunctions.checkoutSession, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        userId: user.id,
        tier: 'premium',
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
        setAmount(data.amount);
        setCurrency(data.currency);
      } else {
        console.error("Client secret not found in response:", data);
        setClientSecret(null);
        setAmount(null);
        setCurrency(null);
      }
    })
    .catch(error => {
      console.error("Error fetching client secret:", error);
      setClientSecret(null);
      setAmount(null);
      setCurrency(null);
    });
  }, [isOpen, user, session, config]);

  const appearance: StripeElementsOptions['appearance'] = {
    theme: currentTheme === 'dark' ? 'night' : 'stripe',
    variables: {
      colorPrimary: '#6D28D9',
      colorBackground: currentTheme === 'dark' ? '#0C111F' : '#FFFFFF',
      colorText: currentTheme === 'dark' ? '#FFFFFF' : '#000000',
      colorDanger: '#EF4444',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    }
  };
  
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[92%] sm:max-w-md p-0 border-gray-800 bg-background text-foreground max-h-[90vh] overflow-auto rounded-lg font-fredoka">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-normal flex justify-between items-center">
            <span>Premium:</span>
            {amount && currency && (
              <span className="pr-5">
                {(amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency.toUpperCase() })}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Get 200 prompts, more personalized recommendations with watch history uploads, and other features coming soon!
          </DialogDescription>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-20">
          <X className="h-4 w-4" />
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
              <p className="text-muted-foreground">Loading payment form...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;