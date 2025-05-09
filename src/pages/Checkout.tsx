import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '../components/CheckoutForm'
import { useAppConfig } from "@/hooks/useAppConfig";
import { useAuth } from "@/context/AuthContext";

const stripePromise = loadStripe(import.meta.env.VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const config = useAppConfig();
  const { user, session } = useAuth();

  useEffect(() => {
    // Call your Supabase Edge Function to create a Checkout Session
    fetch(config.edgeFunctions.checkoutSession, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || config.supabase.publishableKey}`
      },
      body: JSON.stringify({
        userId: user.id,
        tier: `price_1RMaBxPxmwukl9XbuMBW3OP4`,
      }),
    })
    .then(res => res.json())
    .then(data => {
      // Your Edge Function should return { clientSecret }
      setClientSecret(data.clientSecret);
    })
    .catch(console.error);
  }, []);

  if (!clientSecret) {
    
    return <div>Loading payment form…</div>;
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ clientSecret }}    // Tell Elements which Session to use
    >
      <CheckoutForm />
    </Elements>
  );
}
