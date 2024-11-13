import { db, auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface InvoiceData {
  plan: {
    name: string;
    price: number;
    interval: string;
  };
  paymentDetails: any;
  paymentMethod: string | null;
  timestamp: string;
}

export const generateInvoice = async (data: InvoiceData) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  const invoice = {
    userId: auth.currentUser.uid,
    userEmail: auth.currentUser.email,
    ...data,
    status: 'paid',
    invoiceNumber: `INV-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'invoices'), invoice);
    return docRef.id;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};