'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lock, Check } from 'lucide-react';

type UserData = {
  [x: string]: any;
  employment_name: string;
  email: string;
  roles: { role: { role_name: string } | null }[];
  created_at: Date;
  branch: { branch_name: string };
  method_login: { method_login_name: string };
};

export const columns: ColumnDef<UserData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value: any) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'username',
    header: 'Username'
  },
  {
    accessorKey: 'employment_name',
    header: 'NAME'
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    }
  },
  {
    id: 'role',
    header: 'ROLE',
    cell: ({ row }) => {
      const roles = row.original.user_permissions
        .map(
          (role: { role: { role_name: any } }) =>
            role.role?.role_name ?? 'Custom permission'
        )
        .join(', ');

      return <span>{roles}</span>;
    }
  },
  {
    id: 'branch',
    header: 'Đơn vị',
    cell: ({ row }) => <span>{row.original.branch.branch_name}</span>
  },
  {
    id: 'method_login',
    header: 'Chế độ đăng nhập',
    cell: ({ row }) => (
      <span>{row.original.method_login.method_login_name}</span>
    )
  },
  {
    id: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      return (
        <span>
          {new Date(row.original.created_at).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })}
        </span>
      );
    }
  },
  {
    id: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const isActive = row.original.status === 'active';

      return (
        <Button
          variant={'outline'}
          className={`flex w-24 items-center justify-between gap-2 ${
            isActive ? 'text-blue-500' : 'text-red-500'
          }`}
        >
          {isActive ? (
            <Check className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          {isActive ? 'Active' : 'Lock'}
        </Button>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
