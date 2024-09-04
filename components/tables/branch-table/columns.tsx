'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Checkbox } from '@/components/ui/checkbox';

type UserData = {
  branch_name: string;
  branch_code: string;
  status: string;
  created_at: Date;
  createdby: string;
};

export const columns: ColumnDef<UserData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    accessorKey: 'branch_name',
    header: 'NAME'
  },
  {
    accessorKey: 'branch_code',
    header: 'BRANCH_CODE'
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      return (
        <span>
          {row.original.status == '1' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </span>
      );
    }
  },
  {
    accessorKey: 'createdby',
    header: 'created_by',
    cell: ({ row }) => {
      return row.original.created_by_user?.employment_name;
    }
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
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
