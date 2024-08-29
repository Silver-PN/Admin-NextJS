'use client';

import * as z from 'zod';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { useToast } from '../ui/use-toast';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

const formSchema = z.object({
  branch_code: z
    .string()
    .refine((val) => val.length > 0, { message: 'Branch Code is required' }),
  branch_name: z
    .string()
    .refine((val) => val.length > 0, { message: 'Branch Name is required' }),
  status: z.string().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional()
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  initialData: any | null;
  statuss: any;
}

export const BranchForm: React.FC<UserFormProps> = ({
  initialData,
  statuss
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState();

  //   const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      setUserData(session?.user?.id);
    } else {
      console.log('fail');
    }
  }, []);

  const title = initialData ? 'Edit Branch' : 'Create Branch';
  const description = initialData ? 'Edit Branch details.' : 'Add a new Branch';
  const toastMessage = initialData ? 'Branch updated.' : 'Branch created.';
  const action = initialData ? 'Save changes' : 'Create';

  const defaultValues = initialData
    ? initialData
    : {
        branch_name: '',
        branch_Code: '',
        status: '1'
      };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        const updated_by = userData ? userData : '';
        await axios.put(`/api/branchs/${initialData.id}`, {
          ...data,
          updated_by
        });
      } else {
        const created_by = userData ? userData : '';
        const updated_by = userData ? userData : '';
        await axios.post('/api/branchs', { ...data, created_by, updated_by });
      }
      router.refresh();
      router.push('/dashboard/branch');
      toast({
        title: toastMessage,
        description: 'Your request was successful.'
      });
    } catch (error: any) {
      if (error.response && error.response.data) {
        const apiErrors = error.response.data;

        apiErrors.forEach((apiError: any) => {
          form.setError(apiError.path[0] as keyof UserFormValues, {
            type: 'manual',
            message: apiError.message
          });
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  const onDelete = async () => {
    if (initialData) {
      try {
        setLoading(true);
        await axios.delete(`/api/branchs/${initialData.id}`);
        router.refresh();
        router.push('/dashboard/branch');
      } catch (error: any) {
      } finally {
        setLoading(false);
        // setOpen(false);
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => onDelete()}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <FormField
            control={form.control}
            name="branch_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Tên chi nhánh"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branch_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch_code</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Mã chi nhánh"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {initialData && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a status"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* @ts-ignore  */}
                      {statuss.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
