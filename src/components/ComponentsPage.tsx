import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppMessage = async (phone: string, userId: string) => {
    if (!phone) {
      setError('Phone number not found for this user');
      return;
    }

    setSending(userId);
    try {
      const response = await fetch('/.netlify/functions/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          message: 'Hello, This is Leann, how may I help?'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
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
      setError('Failed to send message');
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
      <h2 className="text-2xl font-bold mb-6">Interact with Your Team</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            id={`user-${user.id}`}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => sendWhatsAppMessage(user.phone, user.id)}
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
                  <span className="text-sm">Click to message</span>
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