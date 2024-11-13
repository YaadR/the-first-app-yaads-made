import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Pencil, Trash2, Save, X, Plus, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  role: string;
  organization: string;
  organizationId: string;
  type: string;
}

interface AddUserProps {
  devMode?: boolean;
}

const AddUser: React.FC<AddUserProps> = ({ devMode = false }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    email: '',
    role: '',
    organization: '',
    type: ''
  });

  const fetchUsers = async () => {
    if (!auth.currentUser && !devMode) return;
    
    try {
      setRefreshing(true);
      const userDoc = await getDocs(doc(db, 'users', auth.currentUser?.uid || ''));
      const organizationId = userDoc.data()?.organizationId;

      const q = query(
        collection(db, 'users'),
        where('organizationId', '==', organizationId)
      );
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [devMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'users'), {
        ...formData,
        organizationId: auth.currentUser?.organizationId,
        createdAt: new Date()
      });
      setFormData({
        displayName: '',
        phoneNumber: '',
        email: '',
        role: '',
        organization: '',
        type: ''
      });
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.');
      }
    }
  };

  const handleEdit = async (user: User) => {
    if (editingUser === user.id) {
      try {
        await updateDoc(doc(db, 'users', user.id), formData);
        setEditingUser(null);
        fetchUsers();
      } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user.');
      }
    } else {
      setEditingUser(user.id);
      setFormData({ ...user });
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
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
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
            <input
              type="text"
              name="role"
              placeholder="Role"
              value={formData.role}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
              required
            />
            <input
              type="text"
              name="type"
              placeholder="Type"
              value={formData.type}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
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
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    user.type
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={20} />
                    </button>
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