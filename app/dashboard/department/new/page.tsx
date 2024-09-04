'use client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DepartmentForm } from '@/components/forms/department-form';
import PageContainer from '@/components/layout/page-container';
import React, { useState } from 'react';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Department', link: '/dashboard/department' },
  { title: 'Create', link: '/dashboard/department/create' }
];

export default function Page() {
  // const [roles, setRoles] = useState<any[]>([]);
  const [initialData, setInitialData] = useState<any | null>(null);

  const stauts = [
    { id: '1', name: 'Đang hoạt động' },
    { id: '0', name: 'Ngừng hoạt động' }
  ];

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <DepartmentForm initialData={initialData} statuss={stauts} />
      </div>
    </PageContainer>
  );
}
