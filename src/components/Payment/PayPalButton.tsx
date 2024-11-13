import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalButtonProps {
  plan: {
    name: string;
    price: number;
    interval: string;
  };
  onSuccess: (details: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ plan, onSuccess }) => {
  return (
    <PayPalScriptProvider options={{ 
      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
      currency: 'USD'
    }}>
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: plan.price.toString(),
                  currency_code: 'USD'
                },
                description: `${plan.name} Plan - ${plan.interval}`
              }
            ]
          });
        }}
        onApprove={async (data, actions) => {
          if (actions.order) {
            const details = await actions.order.capture();
            onSuccess(details);
          }
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;