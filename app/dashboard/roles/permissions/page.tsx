'use client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PermissionForm } from '@/components/forms/permission-form';
import PageContainer from '@/components/layout/page-container';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Breadcrumb items
const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Permission', link: '/dashboard/permissions' }, // Updated link
  { title: 'Create', link: '/dashboard/permissions/create' } // Updated link
];

export default function Page() {
  const [initialData, setInitialData] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<any[]>([]); // Updated state
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      // Updated function name
      setLoading(true);
      try {
        const response = await axios.get('/api/roles/permissions'); // Updated endpoint
        setPermissions(response.data);
      } catch (error) {
        console.error('Failed to fetch permissions', error); // Updated message
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <PermissionForm initialData={initialData} />
      </div>
    </PageContainer>
  );
}
