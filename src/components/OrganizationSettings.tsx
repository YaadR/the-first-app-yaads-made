import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Save, RefreshCw } from 'lucide-react';
import { Organization } from '../types/organization';
import OrganizationList from './Organization/OrganizationList';

const OrganizationSettings: React.FC = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    if (!isAdmin) {
      fetchOrganization();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!auth.currentUser) return;

    try {
      const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
      if (adminDoc.exists()) {
        setIsAdmin(true);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin' || userData.type === 'admin') {
          setIsAdmin(true);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchOrganization = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', auth.currentUser.email));
      const userSnapshot = await getDocs(q);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const orgName = userData.organizationName;
        
        const orgsRef = collection(db, 'organizations');
        const orgQuery = query(orgsRef, where('name', '==', orgName));
        const orgSnapshot = await getDocs(orgQuery);
        
        if (!orgSnapshot.empty) {
          const orgData = orgSnapshot.docs[0].data();
          setOrganization({
            id: orgSnapshot.docs[0].id,
            ...orgData
          } as Organization);
        }
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrganization(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setSaving(true);
    try {
      const orgRef = doc(db, 'organizations', organization.id);
      await updateDoc(orgRef, {
        name: organization.name,
        address: organization.address,
        phone: organization.phone,
        email: organization.email,
        task: organization.task || ''
      });
      alert('Organization settings updated successfully!');
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('Failed to update organization settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="text-center p-8">
        <p className="text-xl mb-4">Please log in to manage organization settings</p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Organizations</h2>
          <OrganizationList />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Organization Settings</h2>
          <button
            onClick={fetchOrganization}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={20} />
            Refresh
          </button>
        </div>

        {organization ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={organization.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={organization.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={organization.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 flex items-center"
                disabled={saving}
              >
                <Save className="mr-2" size={20} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {loading ? 'Loading organization details...' : 'No organization found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSettings;