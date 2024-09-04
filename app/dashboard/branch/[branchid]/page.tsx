'use client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { BranchForm } from '@/components/forms/branch-form';
import PageContainer from '@/components/layout/page-container';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

const Page = () => {
  const [initialData, setInitialData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { branchid } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      if (branchid) {
        try {
          const response = await axios.get(`/api/branchs/${branchid}`);
          setInitialData(response.data);
        } catch (error) {
          console.error('Failed to fetch user data', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [branchid]);

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Branch', link: '/dashboard/branch' },
    { title: `Information ${branchid}`, link: `/dashboard/branch/${branchid}` }
  ];

  const stauts = [
    { id: '1', name: 'Đang hoạt động' },
    { id: '0', name: 'Ngừng hoạt động' }
  ];

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        {loading ? (
          <p>Loading...</p>
        ) : (
          <BranchForm initialData={initialData} statuss={stauts} />
        )}
      </div>
    </PageContainer>
  );
};

export default Page;
