// src/components/AddUser.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase'; // Import Firebase configuration
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const AddUser: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    email: '',
    role: '',
    organization: '',
    type: ''
  });
  const [labVentoryUsers, setLabVentoryUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchLabVentoryUsers = async () => {
      const q = query(
        collection(db, 'users'),
        where('organization', '==', 'LabVentory')
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => doc.data().displayName as string);
      setLabVentoryUsers(users);
    };

    fetchLabVentoryUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'users'), formData);
      alert('User added successfully!');
      setFormData({
        displayName: '',
        phoneNumber: '',
        email: '',
        role: '',
        organization: '',
        type: ''
      });
      // Refresh list of LabVentory users after adding a new user
      const fetchLabVentoryUsers = async () => {
        const q = query(
          collection(db, 'users'),
          where('organization', '==', 'LabVentory')
        );
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => doc.data().displayName as string);
        setLabVentoryUsers(users);
      };
      fetchLabVentoryUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex space-x-8">
      <div className="w-2/3">
        <h2 className="text-2xl mb-4">Add New User</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="displayName"
            placeholder="Display Name"
            value={formData.displayName}
            onChange={handleChange}
            required
            className="border rounded-md px-3 py-2"
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="border rounded-md px-3 py-2"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border rounded-md px-3 py-2"
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={formData.role}
            onChange={handleChange}
            required
            className="border rounded-md px-3 py-2"
          />
          <input
            type="text"
            name="organization"
            placeholder="Organization"
            value={formData.organization}
            onChange={handleChange}
            required
            className="border rounded-md px-3 py-2"
          />
          <input
            type="text"
            name="type"
            placeholder="Type"
            value={formData.type}
            onChange={handleChange}
            required
            className="border rounded-md px-3 py-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Add User
          </button>
        </form>
      </div>

      {/* LabVentory Users List */}
      <div className="w-1/3">
        <h3 className="text-xl font-semibold mb-4">LabVentory Users</h3>
        <ul className="bg-white border rounded-md p-4 max-h-60 overflow-y-auto">
          {labVentoryUsers.length > 0 ? (
            labVentoryUsers.map((user, index) => (
              <li key={index} className="py-2 border-b last:border-none">
                {user}
              </li>
            ))
          ) : (
            <p className="text-gray-500">No users found in LabVentory.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AddUser;
