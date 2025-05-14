import { FormEvent, useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
interface CheckoutFormProps {
  onPaymentSuccess: () => void;
}

export default function CheckoutForm({ onPaymentSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);
    setPaymentSuccessMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-complete`,
      },
      redirect: 'if_required',
    });

    setIsLoading(false);

    if (error) {
      console.error(error.message);
      setErrorMessage(error.message || "An unexpected error occurred.");
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setPaymentSuccessMessage("Payment Successful!");
      setTimeout(() => {
        onPaymentSuccess();
      }, 3000);
    } else if (paymentIntent) {
      setErrorMessage(`Payment status: ${paymentIntent.status}. Please try again.`);
    } else {
      setErrorMessage("An unexpected issue occurred. Please try again.");
    }
  }

  let buttonText = "Pay now";
  if (isLoading) {
    buttonText = "Processing...";
  } else if (paymentSuccessMessage) {
    buttonText = paymentSuccessMessage;
  } else if (errorMessage) {
    buttonText = "Payment Failed. Try Again?";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" />
      
      {errorMessage && !paymentSuccessMessage && (
        <div id="payment-message" className="text-red-500 text-sm">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading || !!paymentSuccessMessage}
        className="w-full h-11 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {paymentSuccessMessage && <CheckCircle2 className="mr-2 h-4 w-4" />}
        {buttonText}
      </Button>
    </form>
  );
}
