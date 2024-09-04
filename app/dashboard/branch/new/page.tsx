'use client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { BranchForm } from '@/components/forms/branch-form';
import PageContainer from '@/components/layout/page-container';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Branch', link: '/dashboard/branch' },
  { title: 'Create', link: '/dashboard/branch/create' }
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
        <BranchForm initialData={initialData} statuss={stauts} />
      </div>
    </PageContainer>
  );
}
