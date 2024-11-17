import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { MessageSquare, Loader2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

interface User {
  id: string;
  displayName: string;
  phone: string;
  email: string;
  role: string;
  type: string;
}

function ComponentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [useSignal, setUseSignal] = useState(false);
  const [organizationData, setOrganizationData] = useState<any>(null);

  useEffect(() => {
    fetchOrganizationAndUsers();
  }, []);

  const fetchOrganizationAndUsers = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // Get manager's organization
      const managerDoc = await getDocs(
        query(collection(db, 'managers'), 
        where('uid', '==', auth.currentUser.uid))
      );

      if (managerDoc.empty) {
        setError('Manager profile not found');
        return;
      }

      const organizationId = managerDoc.docs[0].data().organizationId;

      // Get organization details
      const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
      if (orgDoc.exists()) {
        const orgData = orgDoc.data();
        setOrganizationData(orgData);
        setUseSignal(orgData.communicationType === 'signal');
      }

      // Get users
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'), 
        where('organizationId', '==', organizationId))
      );

      const fetchedUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  
  const sendMessage = async (phone: string, userId: string) => {
    if (!phone) {
      setError('Phone number not found for this user');
      return;
    }
  
    setSending(userId);
    try {
      const endpoint = useSignal
        ? '/.netlify/functions/send-signal'
        : '/.netlify/functions/send-whatsapp';
  
      // Get current date and time in a human-readable format
      const currentDate = new Date();
      const dateString = currentDate.toLocaleString(); // This will format the date and time as a string

      const message = `Hello, This is Leann. The time is ${dateString}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.replace(/[^\d+]/g, ''),
          message: message,
        }),
      });

      // Introduce a delay of 3 seconds to allow the Signal server more time to respond
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Log the full response for debugging
      console.log('Full Response:', response);
  
      if (!response.ok) {
        const errorText = await response.text();  // Log the response body
        console.error('Error response body:', errorText); // This will log the detailed error from the API
        throw new Error(`Failed to send ${useSignal ? 'Signal' : 'WhatsApp'} message: ${errorText}`);
      }
  
      const userCard = document.getElementById(`user-${userId}`);
      if (userCard) {
        userCard.classList.add('bg-green-50');
        setTimeout(() => {
          userCard.classList.remove('bg-green-50');
        }, 2000);
      }
    } catch (err) {
      console.error('Error sending message:', err);
  
      if (err instanceof Error) {
        setError(`Failed to send ${useSignal ? 'Signal' : 'WhatsApp'} message: ${err.message}`);
      } else {
        setError('An unknown error occurred while sending the message');
      }
    } finally {
      setSending(null);
    }
  };
  
    

  if (!auth.currentUser) {
    return (
      <div className="text-center p-8">
        <p className="text-xl mb-4">Please log in to interact with your team</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center">
        <AlertCircle className="text-red-500 mr-2" size={20} />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Interact with Your Team</h2>
        <div className="flex items-center space-x-2">
          <span className={!useSignal ? 'font-semibold' : ''}>WhatsApp</span>
          <button
            onClick={() => setUseSignal(!useSignal)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
            title={`Switch to ${useSignal ? 'WhatsApp' : 'Signal'}`}
          >
            {useSignal ? (
              <ToggleRight className="h-6 w-6 text-blue-500" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-gray-500" />
            )}
          </button>
          <span className={useSignal ? 'font-semibold' : ''}>Signal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            id={`user-${user.id}`}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => sendMessage(user.phone, user.id)}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-semibold text-blue-600">
                  {user.displayName?.charAt(0) || '?'}
                </span>
              </div>
              <h3 className="font-semibold mb-2">{user.displayName}</h3>
              <p className="text-sm text-gray-500 mb-2">{user.email}</p>
              <p className="text-sm text-gray-500 mb-2">Role: {user.role}</p>
              <p className="text-sm text-gray-500 mb-2">Type: {user.type}</p>
              {sending === user.id ? (
                <div className="flex items-center justify-center text-blue-500">
                  <Loader2 className="animate-spin mr-2" size={16} />
                  <span className="text-sm">Sending...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center text-green-500">
                  <MessageSquare size={16} className="mr-1" />
                  <span className="text-sm">Click to message via {useSignal ? 'Signal' : 'WhatsApp'}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComponentsPage;