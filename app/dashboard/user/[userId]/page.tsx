'use client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { UserForm } from '@/components/forms/user-form';
import PageContainer from '@/components/layout/page-container';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

const Page = () => {
  const [initialData, setInitialData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          const response = await axios.get(`/api/users/${userId}`);
          setInitialData(response.data);
        } catch (error) {
          console.error('Failed to fetch user data', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [userId]);

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'User', link: '/dashboard/user' },
    { title: `Information ${userId}`, link: `/dashboard/user/${userId}` } // Dynamic breadcrumb item
  ];

  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        {loading ? (
          <p>Loading...</p>
        ) : (
          <UserForm initialData={initialData} roles={roles} />
        )}
      </div>
    </PageContainer>
  );
};

export default Page;
