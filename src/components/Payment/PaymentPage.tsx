import { useState } from "react";
import { CreditCard, CircleDollarSign, Wallet } from "lucide-react";
import CreditCardForm from "./CreditCardForm";
import PayPalButton from "./PayPalButton";
import StripeCheckout from "./StripeCheckout";
import { generateInvoice } from "../../utils/invoice";

interface PaymentPageProps {
  plan: {
    name: string;
    price: number;
    interval: string;
  };
}

const PaymentPage: React.FC<PaymentPageProps> = ({ plan }) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'paypal' | 'stripe' | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePaymentSuccess = async (details: any) => {
    setLoading(true);
    try {
      await generateInvoice({
        plan,
        paymentDetails: details,
        paymentMethod,
        timestamp: new Date().toISOString(),
      });
      
      // Redirect to success page
      window.location.href = '/success';
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment successful but failed to generate invoice. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <p className="text-gray-600">{plan.name} Plan - {plan.interval}</p>
        <p className="text-xl font-bold mt-2">${plan.price}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold mb-4">Select Payment Method</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setPaymentMethod('credit-card')}
            className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors ${
              paymentMethod === 'credit-card' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <CreditCard size={24} />
            <span>Credit Card</span>
          </button>

          <button
            onClick={() => setPaymentMethod('paypal')}
            className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors ${
              paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <CircleDollarSign size={24} />
            <span>PayPal</span>
          </button>

          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors ${
              paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <Wallet size={24} />
            <span>Stripe</span>
          </button>
        </div>

        {paymentMethod && (
          <div className="mt-6 p-6 border rounded-lg">
            {paymentMethod === 'credit-card' && (
              <CreditCardForm onSubmit={handlePaymentSuccess} loading={loading} />
            )}
            {paymentMethod === 'paypal' && (
              <PayPalButton plan={plan} onSuccess={handlePaymentSuccess} />
            )}
            {paymentMethod === 'stripe' && (
              <StripeCheckout plan={plan} onSuccess={handlePaymentSuccess} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;