'use client';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
// import { User } from '@/constants/data';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { columns } from './columns';
import { useEffect, useState } from 'react';
import axios from 'axios';

// interface ProductsClientProps {
//   data: User[];
// }
// interface User {
//   id: number;
//   username: string;
// }
export const BranchClient: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);

  async function fetchData(page: number, pageSize: number) {
    try {
      const response = await axios.get('/api/branchs', {
        params: {
          page,
          pageSize
        }
      });
      return response.data;
    } catch (error) {
      return { data: [], totalUsers: 0 };
    }
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Branch (${users.length})`}
          description="Manage Branch"
        />
        <Button
          className="text-xs md:text-sm"
          onClick={() => router.push(`/dashboard/branch/new`)}
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
