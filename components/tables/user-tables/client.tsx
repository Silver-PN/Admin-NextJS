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
export const UserClient: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);

  // const [loadData, setLoadData] = useState(true);

  async function fetchData(page: number, pageSize: number) {
    try {
      const response = await axios.get('/api/users', {
        params: {
          page,
          pageSize
        }
      });
      setUsers(response.data.users);
      return response.data;
    } catch (error) {
      return { data: [], totalUsers: 0 };
    }
  }
  // useEffect(() => {
  //   fetchData(1, 10);
  // }, [loadData]);

  return (
    <>
      {/* <pre>{JSON.stringify(users, null, 2)}</pre> */}
      <div className="flex items-start justify-between">
        <Heading
          title={`Users (${users.length})`}
          description="Manage users (Client side table functionalities.)"
        />
        <Button
          className="text-xs md:text-sm"
          onClick={() => router.push(`/dashboard/user/new`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="employment_name"
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
