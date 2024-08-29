'use client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DepartmentForm } from '@/components/forms/department-form';
import PageContainer from '@/components/layout/page-container';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

const Page = () => {
  const [initialData, setInitialData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { departmentid } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      console.log('ád', departmentid);

      if (departmentid) {
        try {
          const response = await axios.get(`/api/departments/${departmentid}`);
          setInitialData(response.data);
          console.log('kt', response);
        } catch (error) {
          console.error('Failed to fetch user data', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [departmentid]);

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Department', link: '/dashboard/department' },
    {
      title: `Information ${departmentid}`,
      link: `/dashboard/department/${departmentid}`
    }
  ];

  const stauts = [
    { id: '1', name: 'Đang hoạt động' },
    { id: '0', name: 'Ngừng hoạt động' }
  ];
  console.log('checl', initialData);

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DepartmentForm initialData={initialData} statuss={stauts} />
        )}
      </div>
    </PageContainer>
  );
};

export default Page;
