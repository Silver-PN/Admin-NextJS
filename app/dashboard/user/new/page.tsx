'use client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { UserForm } from '@/components/forms/user-form';
import PageContainer from '@/components/layout/page-container';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'User', link: '/dashboard/user' },
  { title: 'Create', link: '/dashboard/user/create' }
];

export default function Page() {
  // const [roles, setRoles] = useState<any[]>([]);
  const [initialData, setInitialData] = useState<any | null>(null);

  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     try {
  //       const response = await axios.get('/api/roles');
  //       setRoles(response.data);
  //     } catch (error) {
  //       console.error('Failed to fetch roles', error);
  //     }
  //   };

  //   fetchRoles();
  // }, []);
  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <UserForm initialData={initialData} roles={roles} />
      </div>
    </PageContainer>
  );
}
