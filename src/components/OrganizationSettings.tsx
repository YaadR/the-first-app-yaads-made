import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Save, RefreshCw } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  logo: string;
}

const OrganizationSettings: React.FC = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOrganization = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      // First get the user's organization
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', auth.currentUser.email));
      const userSnapshot = await getDocs(q);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const orgName = userData.organizationName;
        
        // Then get the organization details
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

  useEffect(() => {
    fetchOrganization();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        website: organization.website,
        description: organization.description,
        logo: organization.logo
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={organization.phone}
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
                Website
              </label>
              <input
                type="url"
                name="website"
                value={organization.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={organization.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                name="logo"
                value={organization.logo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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