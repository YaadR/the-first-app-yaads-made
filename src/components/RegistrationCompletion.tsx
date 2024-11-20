import React, { useState } from 'react';
import { db, auth } from '../config/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { Building2, Mail, Phone, User, MapPin, MessageSquare } from 'lucide-react';

function RegistrationCompletion() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization: {
      name: '',
      address: '',
      email: '',
      phone: '',
      users: [], // Array of user IDs
      communicationType: 'whatsapp' // Default to WhatsApp
    },
    user: {
      name: '',
      phone: '',
      email: auth.currentUser?.email || '',
      organization: ''
    }
  });

  const handleChange = (section: 'organization' | 'user', field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      // Create organization
      const orgRef = doc(collection(db, 'organizations'));
      const orgData = {
        ...formData.organization,
        users: [auth.currentUser.uid], // Initialize with manager's ID
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
        signal: formData.organization.communicationType === 'signal',
        whatsapp: formData.organization.communicationType === 'whatsapp'
      };
      await setDoc(orgRef, orgData);

      // Save user as manager
      const managerRef = doc(collection(db, 'managers'), auth.currentUser.uid);
      await setDoc(managerRef, {
        ...formData.user,
        uid: auth.currentUser.uid,
        role: 'manager',
        organizationId: orgRef.id,
        organizationName: formData.organization.name,
        createdAt: new Date()
      });

      // Also add to users collection for consistency
      const userRef = doc(collection(db, 'users'), auth.currentUser.uid);
      await setDoc(userRef, {
        ...formData.user,
        uid: auth.currentUser.uid,
        role: 'manager',
        type: 'manager',
        organizationId: orgRef.id,
        organizationName: formData.organization.name,
        createdAt: new Date()
      });

      window.location.href = '/';
    } catch (error) {
      console.error('Error saving registration data:', error);
      alert('Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">Complete Your Registration</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide additional information to complete your account setup
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Organization Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                <div className="mt-1 relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.organization.name}
                    onChange={(e) => handleChange('organization', 'name', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.organization.email}
                    onChange={(e) => handleChange('organization', 'email', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Phone</label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={formData.organization.phone}
                    onChange={(e) => handleChange('organization', 'phone', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Address</label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.organization.address}
                    onChange={(e) => handleChange('organization', 'address', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Method</label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="whatsapp"
                      name="communicationType"
                      value="whatsapp"
                      checked={formData.organization.communicationType === 'whatsapp'}
                      onChange={(e) => handleChange('organization', 'communicationType', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      required
                    />
                    <label htmlFor="whatsapp" className="ml-2 block text-sm text-gray-700">
                      WhatsApp
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="signal"
                      name="communicationType"
                      value="signal"
                      checked={formData.organization.communicationType === 'signal'}
                      onChange={(e) => handleChange('organization', 'communicationType', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="signal" className="ml-2 block text-sm text-gray-700">
                      Signal
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Your Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.user.name}
                    onChange={(e) => handleChange('user', 'name', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={formData.user.phone}
                    onChange={(e) => handleChange('user', 'phone', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Completing Registration...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistrationCompletion;