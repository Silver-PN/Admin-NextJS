'use client';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const DepartmentClient: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);

  async function fetchData(page: number, pageSize: number) {
    try {
      const response = await axios.get('/api/departments', {
        params: {
          page,
          pageSize
        }
      });
      setUsers(response.data);
      return response.data;
    } catch (error) {
      return { data: [], totalUsers: 0 };
    }
  }
  console.log('check', users);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Department (${users.length})`}
          description="Manage Department"
        />
        <Button
          className="text-xs md:text-sm"
          onClick={() => router.push(`/dashboard/department/new`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns}
        data={users}
        pageNo={1}
        totalUsers={0}
        pageCount={0}
        fetchData={fetchData}
      />
    </>
  );
};
