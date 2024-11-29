import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Pencil, Trash2, Save, X, Plus, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  displayName: string;
  phone: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
}

interface AddUserProps {
  devMode?: boolean;
}

const AddUser: React.FC<AddUserProps> = ({ devMode = false }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    email: '',
    role: 'employee',
    organizationId: '',
    organizationName: ''
  });

  useEffect(() => {
    checkAdminStatus();
    fetchOrganizationInfo();
  }, [devMode]);

  const checkAdminStatus = async () => {
    if (!auth.currentUser && !devMode) return;

    try {
      const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser?.uid || 'dev-mode-user'));
      if (adminDoc.exists()) {
        setIsAdmin(true);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid || 'dev-mode-user'));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin' || userData.type === 'admin') {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchOrganizationInfo = async () => {
    if (!auth.currentUser && !devMode) return null;
    
    try {
      const userDocRef = doc(db, 'managers', auth.currentUser?.uid || 'dev-mode-user');
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setOrganizationId(userData.organizationId);
        setOrganizationName(userData.organizationName);
        return userData.organizationId;
      } else if (devMode) {
        return 'dev-org-id';
      }
      return null;
    } catch (error) {
      console.error('Error fetching organization info:', error);
      setError('Failed to fetch organization info. Please try again.');
      return null;
    }
  };

  const fetchUsers = async () => {
    if (!auth.currentUser && !devMode) return;
    
    try {
      setRefreshing(true);
      setError(null);

      let usersQuery;
      if (isAdmin) {
        usersQuery = query(collection(db, 'users'));
      } else {
        const orgId = organizationId || await fetchOrganizationInfo();
        if (!orgId) {
          setError('No organization found. Please set up your organization first.');
          return;
        }
        usersQuery = query(collection(db, 'users'), where('organizationId', '==', orgId));
      }

      const querySnapshot = await getDocs(usersQuery);
      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin, organizationId, devMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!organizationId || !organizationName) {
      setError('No organization found. Please set up your organization first.');
      return;
    }

    try {
      setError(null);
      const newUser = {
        ...formData,
        organizationId,
        organizationName,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid || 'dev-mode-user'
      };

      const userRef = await addDoc(collection(db, 'users'), newUser);
      const orgRef = doc(db, 'organizations', organizationId);
      await updateDoc(orgRef, {
        users: arrayUnion(userRef.id)
      });
      
      setFormData({
        displayName: '',
        phone: '',
        email: '',
        role: 'employee',
        organizationId: '',
        organizationName: ''
      });
      setShowForm(false);
      
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Failed to add user. Please try again.');
    }
  };

  const handleDelete = async (userId: string, userRole: string) => {
    if (userRole === 'admin') {
      setError('Cannot delete admin users');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setError(null);
      await deleteDoc(doc(db, 'users', userId));

      if (organizationId) {
        const orgRef = doc(db, 'organizations', organizationId);
        await updateDoc(orgRef, {
          users: arrayRemove(userId)
        });
      }

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleEdit = async (user: User) => {
    if (user.role === 'admin') {
      setError('Cannot modify admin users');
      return;
    }

    if (editingUser === user.id) {
      try {
        setError(null);
        await updateDoc(doc(db, 'users', user.id), formData);
        setEditingUser(null);
        fetchUsers();
      } catch (error) {
        console.error('Error updating user:', error);
        setError('Failed to update user. Please try again.');
      }
    } else {
      setEditingUser(user.id);
      setFormData({
        displayName: user.displayName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organizationName
      });
    }
  };

  if (!auth.currentUser && !devMode) {
    return (
      <div className="text-center p-8">
        <p className="text-xl mb-4">Please log in to manage users</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Manage Users</h2>
          <button
            onClick={fetchUsers}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            disabled={refreshing}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Add New User
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="displayName"
              placeholder="Display Name"
              value={formData.displayName}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
              required
            />
            <div className="md:col-span-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    user.displayName
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.organizationName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.role !== 'admin' && (
                    <>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {editingUser === user.id ? <Save size={20} /> : <Pencil size={20} />}
                      </button>
                      {editingUser === user.id ? (
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X size={20} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(user.id, user.role)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddUser;