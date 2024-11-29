import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { Loader2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { User } from '../types/user';
import { UserCard } from './UserCard';
import { sendWhatsAppMessage, sendSignalMessage, sendWebhookNotification } from '../utils/messaging';

function ComponentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [useSignal, setUseSignal] = useState(false);
  const [useWebhook, setUseWebhook] = useState(false);
  const [organizationData, setOrganizationData] = useState<any>(null);

  useEffect(() => {
    fetchOrganizationAndUsers();
  }, []);

  const fetchOrganizationAndUsers = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const managerDoc = await getDocs(
        query(collection(db, 'managers'), 
        where('uid', '==', auth.currentUser.uid))
      );

      if (managerDoc.empty) {
        setError('Manager profile not found');
        return;
      }

      const organizationId = managerDoc.docs[0].data().organizationId;

      const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
      if (orgDoc.exists()) {
        const orgData = orgDoc.data();
        setOrganizationData(orgData);
        setUseSignal(orgData.communicationType === 'signal');
      }

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

  const handleUserClick = async (user: User) => {
    if (!user.phone) {
      setError('Phone number not found for this user');
      return;
    }

    setSending(user.id);
    try {
      if (useWebhook) {
        await sendWebhookNotification(user);
      } else {
        const currentDate = new Date();
        const message = `Hello, This is Leann. The time is ${currentDate.toLocaleString()}`;
        
        if (useSignal) {
          await sendSignalMessage(user.phone, message);
        } else {
          await sendWhatsAppMessage(user.phone, message);
        }
      }

      const userCard = document.getElementById(`user-${user.id}`);
      if (userCard) {
        userCard.classList.add('bg-green-50');
        setTimeout(() => {
          userCard.classList.remove('bg-green-50');
        }, 2000);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Interact with Your Team</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={!useWebhook ? 'font-semibold' : ''}>Message</span>
              <button
                onClick={() => setUseWebhook(!useWebhook)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                title="Toggle webhook notifications"
              >
                {useWebhook ? (
                  <ToggleRight className="h-6 w-6 text-blue-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-500" />
                )}
              </button>
              <span className={useWebhook ? 'font-semibold' : ''}>Notify</span>
            </div>

            {!useWebhook && (
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
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              sending={sending === user.id}
              useWebhook={useWebhook}
              useSignal={useSignal}
              onClick={() => handleUserClick(user)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ComponentsPage;