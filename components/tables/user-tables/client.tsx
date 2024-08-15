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
  const [loadData, setLoadData] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (loadData) {
        try {
          const response = await axios.get('/api/users');
          setUsers(response.data.users);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch users:', error);
        }
        setLoadData(false);
      }
    };
    fetchUsers();
  }, [loadData]);

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
        searchKey="name"
        columns={columns}
        data={users}
        pageNo={1}
        totalUsers={0}
        pageCount={0}
      />
    </>
  );
};
