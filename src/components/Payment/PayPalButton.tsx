//PayPalButton.tsx
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  plan: {
    name: string;
    price: number;
    interval: string;
  };
  onSuccess: (details: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ plan, onSuccess }) => {
  useEffect(() => {
    const loadPayPalScript = async () => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;

      script.onload = () => {
        if (window.paypal) {
          window.paypal.Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  description: `${plan.name} Plan - ${plan.interval}ly`,
                  amount: {
                    value: plan.price.toString()
                  }
                }]
              });
            },
            onApprove: async (data: any, actions: any) => {
              const details = await actions.order.capture();
              onSuccess(details);
            }
          }).render('#paypal-button-container');
        }
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    loadPayPalScript();
  }, [plan, onSuccess]);

  return (
    <div>
      <div id="paypal-button-container" />
      <div className="text-center mt-4">
        <Loader2 className="animate-spin inline-block" size={24} />
        <p className="text-sm text-gray-500 mt-2">Loading PayPal...</p>
      </div>
    </div>
  );
};

export default PayPalButton;