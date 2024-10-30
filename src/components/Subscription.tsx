import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { stripePromise, createCheckoutSession } from '../lib/stripe';

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
}

function Subscription() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      name: 'Basic',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      stripePriceId: {
        monthly: 'price_basic_monthly',
        yearly: 'price_basic_yearly'
      },
      features: [
        'Access to Image Generator',
        'Basic Chat Support',
        '50 Images per month',
        'Standard resolution'
      ]
    },
    {
      name: 'Pro',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      stripePriceId: {
        monthly: 'price_pro_monthly',
        yearly: 'price_pro_yearly'
      },
      features: [
        'Everything in Basic',
        'Access to ChatBot',
        '200 Images per month',
        'HD resolution',
        'Priority support'
      ]
    },
    {
      name: 'Enterprise',
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      stripePriceId: {
        monthly: 'price_enterprise_monthly',
        yearly: 'price_enterprise_yearly'
      },
      features: [
        'Everything in Pro',
        'Unlimited Images',
        '4K resolution',
        'Custom API access',
        'Dedicated support',
        'Custom solutions'
      ]
    }
  ];

  const handleSubscribe = async (plan: Plan) => {
    try {
      setLoading(plan.name);
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const priceId = isYearly ? plan.stripePriceId.yearly : plan.stripePriceId.monthly;
      const session = await createCheckoutSession(priceId);

      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <div className="flex items-center justify-center gap-4">
          <span className={!isYearly ? 'font-bold' : ''}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                isYearly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={isYearly ? 'font-bold' : ''}>Yearly</span>
          <span className="ml-2 text-sm text-green-500 font-medium">Save 20%</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">
                ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
              </span>
              <span className="text-gray-500">/{isYearly ? 'year' : 'month'}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading === plan.name}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              {loading === plan.name ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Subscription;