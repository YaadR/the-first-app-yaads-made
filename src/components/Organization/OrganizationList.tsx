import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import OrganizationCard from './OrganizationCard';
import { Organization } from '../../types/organization';

const OrganizationList: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgsSnapshot = await getDocs(collection(db, 'organizations'));
        const orgsData = orgsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Organization[];
        setOrganizations(orgsData);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {organizations.map(org => (
        <OrganizationCard key={org.id} organization={org} />
      ))}
    </div>
  );
};

export default OrganizationList;