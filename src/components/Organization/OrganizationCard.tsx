import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Organization } from '../../types/organization';
import { Save } from 'lucide-react';

interface OrganizationCardProps {
  organization: Organization;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({ organization }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(organization);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orgRef = doc(db, 'organizations', organization.id);
      // Cast formData to ensure it's a plain object with string keys
      await updateDoc(orgRef, formData as Record<string, any>);
      setEditing(false);
    } catch (error) {
      console.error('Error updating organization:', error);
    }
  };
  

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={!editing}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={!editing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Agent Task</label>
          <textarea
            name="task"
            value={formData.task || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={!editing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Meta Task</label>
          <textarea
            name="requirements"
            value={formData.requirements || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={!editing}
          />
        </div>

        <div className="flex justify-end space-x-4">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
              >
                <Save className="mr-2" size={20} />
                Save
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default OrganizationCard;