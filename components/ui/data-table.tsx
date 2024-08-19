'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';
// import { Input } from './input';
import { Button } from './button';
import { ScrollArea, ScrollBar } from './scroll-area';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import axios from 'axios';
interface PaginationState {
  pageIndex: number;
  pageSize: number;
}
interface Response {
  users: any;
  meta: any;
}
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  pageNo: number;
  totalUsers: number;
  pageSizeOptions?: number[];
  pageCount: number;
  fetchData: (pageIndex: number, pageSize: number) => Promise<void>;
}
interface MetaType {
  totalUsers: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  searchKey,
  pageNo,
  totalUsers,
  pageCount,
  pageSizeOptions = [1, 2, 5, 10, 20, 30, 40, 50],
  fetchData
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<TData[]>(initialData);
  const [meta, setMeta] = useState<MetaType | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageNo - 1,
    pageSize: 10
  });
  const [oldPagination, setOldPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 0
  });

  // Initialize pagination from search params
  // useEffect(() => {
  //   const pageParam = searchParams.get('page');
  //   const limitParam = searchParams.get('pageSize');
  //   if (pageParam) {
  //     setPagination((prev) => ({
  //       ...prev,
  //       pageIndex: parseInt(pageParam as string, 10) - 1
  //     }));
  //   }
  //   if (limitParam) {
  //     setPagination((prev) => ({
  //       ...prev,
  //       pageSize: parseInt(limitParam as string, 10)
  //     }));
  //   }
  // }, [searchParams]);

  // Create query string
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(
        searchParams?.toString() || ''
      );

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const fetchDataAsync = async (pageIndex: number, pageSize: number) => {
      const response = await fetchData(pageIndex, pageSize);
      setData(response.users);
      setMeta(response.meta);
    };
    if (
      oldPagination.pageIndex !== pagination.pageIndex ||
      oldPagination.pageSize !== pagination.pageSize
    ) {
      if (oldPagination.pageSize !== pagination.pageSize) {
        fetchDataAsync(1, pagination.pageSize);
      } else {
        fetchDataAsync(pagination.pageIndex + 1, pagination.pageSize);
      }
      setOldPagination(pagination);
    }
  }, [pagination, fetchData, oldPagination.pageIndex, oldPagination.pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination
    },
    manualPagination: true,
    manualFiltering: true,
    onPaginationChange: setPagination
  });

  const searchValue = table.getColumn(searchKey)?.getFilterValue() as string;

  useEffect(() => {
    // if (searchValue?.length > 0) {
    //   router.push(
    //     `${pathname}?${createQueryString({
    //       page: null,
    //       pageSize: null,
    //       search: searchValue
    //     })}`,
    //     {
    //       scroll: false
    //     }
    //   );
    // } else {
    //   router.push(
    //     `${pathname}?${createQueryString({
    //       page: null,
    //       pageSize: null,
    //       search: null
    //     })}`,
    //     {
    //       scroll: false
    //     }
    //   );
    // }

    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchValue, createQueryString, pathname, router]);
  const generatePageNumbers = (currentPage: number, totalPages: number) => {
    const maxPageNumbersToShow = 3;
    const halfRange = Math.floor(maxPageNumbersToShow / 2);

    // Handle edge cases where there are fewer pages than needed
    if (totalPages <= maxPageNumbersToShow) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);

    if (endPage - startPage + 1 < maxPageNumbersToShow) {
      if (currentPage <= halfRange) {
        endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
      } else {
        startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
      }
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
  };

  const pageNumbers = generatePageNumbers(
    meta?.page || 1,
    meta?.totalPages || 1
  );
  return (
    <>
      {/* <Input
        placeholder={`Search ${searchKey}...`}
        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn(searchKey)?.setFilterValue(event.target.value)
        }
        className="w-full md:max-w-sm"
      /> */}
      <ScrollArea className="h-[calc(80vh-220px)] rounded-md border md:h-[calc(80dvh-200px)]">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
        <div className="flex w-full items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              <p className="whitespace-nowrap text-sm font-medium">
                Rows per page
              </p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:justify-end">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {meta ? (
              <>
                Page {meta.page} of {meta.totalPages}
              </>
            ) : (
              <>
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              aria-label="Go to first page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={meta ? meta.page <= 1 : !table.getCanPreviousPage()}
            >
              <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to previous page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={meta ? meta.page <= 1 : !table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                aria-label={`Go to page ${pageNumber}`}
                variant="outline"
                className={`h-8 w-8 p-0 ${
                  meta
                    ? meta.page === pageNumber
                      ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      : 'bg-transparent text-gray-600 dark:text-gray-400'
                    : ''
                }`}
                onClick={() => table.setPageIndex(pageNumber - 1)}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              aria-label="Go to next page"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={
                meta ? meta.page >= meta.totalPages : !table.getCanNextPage()
              }
            >
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Go to last page"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(meta ? meta.totalPages - 1 : 0)}
              disabled={
                meta ? meta.page >= meta.totalPages : !table.getCanNextPage()
              }
            >
              <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
