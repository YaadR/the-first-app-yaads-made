import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeCheckoutProps {
  plan: {
    name: string;
    price: number;
    interval: string;
    stripePriceId: {
      monthly: string;
      yearly: string;
    };
  };
  isYearly: boolean;
  onSuccess: (details: any) => void;
  onError: (error: string) => void;
}

const CheckoutForm: React.FC<{
  plan: StripeCheckoutProps['plan'];
  isYearly: boolean;
  onSuccess: StripeCheckoutProps['onSuccess'];
  onError: StripeCheckoutProps['onError'];
}> = ({ plan, isYearly, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not been properly initialized');
      return;
    }

    setLoading(true);

    try {
      const { error: cardError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (cardError) {
        throw new Error(cardError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      const priceId = isYearly ? plan.stripePriceId.yearly : plan.stripePriceId.monthly;
      const response = await fetch('/.netlify/functions/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId,
          planName: plan.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
      }

      const subscription = await response.json();
      onSuccess(subscription);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ${plan.price} ${isYearly ? '/year' : '/month'}`}
      </button>
    </form>
  );
};

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ plan, isYearly, onSuccess, onError }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        plan={plan} 
        isYearly={isYearly} 
        onSuccess={onSuccess} 
        onError={onError} 
      />
    </Elements>
  );
};

export default StripeCheckout;