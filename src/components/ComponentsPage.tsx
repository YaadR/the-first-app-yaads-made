import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MessageSquare, Loader2, AlertCircle, QrCode } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  displayName: string;
  phone: string;
  email: string;
}

interface WhatsAppState {
  isAuthenticated: boolean;
  isConnecting: boolean;
  qrCode: string | null;
  error: string | null;
}

function ComponentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [whatsAppState, setWhatsAppState] = useState<WhatsAppState>({
    isAuthenticated: false,
    isConnecting: false,
    qrCode: null,
    error: null
  });
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('qr', (qrImage: string) => {
      setWhatsAppState(prev => ({
        ...prev,
        qrCode: qrImage,
        isConnecting: true
      }));
    });

    newSocket.on('ready', () => {
      setWhatsAppState(prev => ({
        ...prev,
        isAuthenticated: true,
        isConnecting: false,
        qrCode: null
      }));
    });

    newSocket.on('authenticated', () => {
      setWhatsAppState(prev => ({
        ...prev,
        isAuthenticated: true,
        isConnecting: false,
        qrCode: null
      }));
    });

    newSocket.on('auth_failure', () => {
      setWhatsAppState(prev => ({
        ...prev,
        error: 'WhatsApp authentication failed',
        isConnecting: false
      }));
    });

    newSocket.on('error', (error: string) => {
      setWhatsAppState(prev => ({
        ...prev,
        error,
        isConnecting: false
      }));
    });

    newSocket.on('message-sent', ({ phone }: { phone: string }) => {
      const userWithPhone = users.find(u => u.phone.replace(/\D/g, '') === phone);
      if (userWithPhone) {
        const userCard = document.getElementById(`user-${userWithPhone.id}`);
        if (userCard) {
          userCard.classList.add('bg-green-50');
          setTimeout(() => {
            userCard.classList.remove('bg-green-50');
          }, 2000);
        }
      }
      setSending(null);
    });

    return () => {
      newSocket.close();
    };
  }, [users]);

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

    if (!whatsAppState.isAuthenticated) {
      setWhatsAppState(prev => ({
        ...prev,
        isConnecting: true
      }));
      return;
    }

    setSending(userId);
    socket?.emit('send-message', {
      phone: phone.replace(/\D/g, ''),
      message: 'Hello, This is Leann, how may I help?'
    });
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

      {whatsAppState.isConnecting && whatsAppState.qrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Scan QR Code to Connect WhatsApp</h3>
            <img src={whatsAppState.qrCode} alt="WhatsApp QR Code" className="mx-auto mb-4" />
            <p className="text-sm text-gray-600 text-center">
              Open WhatsApp on your phone and scan this QR code to connect
            </p>
          </div>
        </div>
      )}

      {whatsAppState.error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <p className="text-red-700">{whatsAppState.error}</p>
        </div>
      )}

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
              {sending === user.id ? (
                <div className="flex items-center justify-center text-blue-500">
                  <Loader2 className="animate-spin mr-2" size={16} />
                  <span className="text-sm">Sending...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center text-green-500">
                  {!whatsAppState.isAuthenticated ? (
                    <QrCode size={16} className="mr-1" />
                  ) : (
                    <MessageSquare size={16} className="mr-1" />
                  )}
                  <span className="text-sm">
                    {!whatsAppState.isAuthenticated ? 'Click to connect WhatsApp' : 'Click to message'}
                  </span>
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