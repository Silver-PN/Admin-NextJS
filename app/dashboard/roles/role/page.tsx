'use client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { RoleForm } from '@/components/forms/role-form';
import PageContainer from '@/components/layout/page-container';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Breadcrumb items
const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Role', link: '/dashboard/roles' },
  { title: 'Create', link: '/dashboard/roles/create' }
];

export default function Page() {
  const [initialData, setInitialData] = useState<any | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/roles/list-roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Failed to fetch roles', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <RoleForm initialData={initialData} />
      </div>
    </PageContainer>
  );
}
