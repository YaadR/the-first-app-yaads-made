import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Loader2, Trash2, Save, X } from 'lucide-react';
import { User } from '../../types/user';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setEditForm(user);
  };

  const handleSave = async () => {
    if (!editingUser || !editForm) return;

    try {
      await updateDoc(doc(db, 'users', editingUser), editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser === user.id ? (
                  <input
                    type="text"
                    value={editForm.displayName || ''}
                    onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  user.displayName
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser === user.id ? (
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser === user.id ? (
                  <input
                    type="text"
                    value={editForm.role || ''}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  user.role
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{user.organizationId}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser === user.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Save size={20} />
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;