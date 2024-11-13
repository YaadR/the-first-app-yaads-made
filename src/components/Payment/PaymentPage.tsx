import { useState } from "react";
import { CreditCard, CircleDollarSign, ArrowLeft } from "lucide-react";
import CreditCardForm from "./CreditCardForm";
import PayPalButton from "./PayPalButton";

interface PaymentPageProps {
  plan: {
    name: string;
    price: number;
    interval: string;
  };
  onBack: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ plan, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'paypal' | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePaymentSuccess = async (details: any) => {
    setLoading(true);
    try {
      // Redirect to success page
      window.location.href = '/success';
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Plans
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <p className="text-gray-600">{plan.name} Plan - {plan.interval}ly</p>
        <p className="text-xl font-bold mt-2">${plan.price}/{plan.interval}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold mb-4">Select Payment Method</h3>
        
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        {paymentMethod && (
          <div className="mt-6">
            {paymentMethod === 'credit-card' && (
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Credit Card Details</h4>
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </div>
                <CreditCardForm onSubmit={handlePaymentSuccess} loading={loading} />
              </div>
            )}
            {paymentMethod === 'paypal' && (
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">PayPal Checkout</h4>
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </div>
                <PayPalButton plan={plan} onSuccess={handlePaymentSuccess} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;