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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Label } from '@/components/ui/label';
import { useToast } from '../ui/use-toast';
import axios from 'axios';
import { useSession } from 'next-auth/react';

// Schema for creating a new role
const createRoleSchema = z.object({
  role_code: z.string().min(1, { message: 'Role code is required' }),
  role_name: z.string().min(1, { message: 'Role name is required' }),
  description: z.string().optional(),
  status: z.string().min(1, { message: 'Status is required' })
});

// Schema for updating an existing role
const updateRoleSchema = z.object({
  role_code: z.string().min(1, { message: 'Role code is required' }),
  role_name: z.string().min(1, { message: 'Role name is required' }),
  description: z.string().optional(),
  status: z.string().min(1, { message: 'Status is required' })
});

type RoleFormValues =
  | z.infer<typeof createRoleSchema>
  | z.infer<typeof updateRoleSchema>;

interface RoleFormProps {
  initialData: any | null;
}

export const PermissionForm: React.FC<RoleFormProps> = ({ initialData }) => {
  const { data: session, status } = useSession();

  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit Role' : 'Create Role';
  const description = initialData ? 'Edit role details.' : 'Add a new role';
  const toastMessage = initialData ? 'Role updated.' : 'Role created.';
  const action = initialData ? 'Save changes' : 'Create';

  const formSchema = initialData ? updateRoleSchema : createRoleSchema;

  const defaultValues = initialData
    ? {
        role_code: initialData.role_code || '',
        role_name: initialData.role_name || '',
        description: initialData.description || '',
        status: initialData.status || ''
      }
    : {
        role_code: '',
        role_name: '',
        description: '',
        status: ''
      };

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (formData: RoleFormValues) => {
    try {
      setLoading(true);
      const data = {
        ...formData,
        user_active: session?.user?.username
      };
      if (initialData) {
        await axios.put(`/api/roles/${initialData.id}`, data);
      } else {
        await axios.post('/api/roles/list-roles', data);
      }
      router.refresh();
      router.push('/dashboard');
      toast({
        title: toastMessage,
        description: 'Your request was successful.'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (initialData) {
      try {
        setLoading(true);
        await axios.delete(`/api/roles/${initialData.id}`);
        router.refresh();
        router.push('/dashboard/role');
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.'
        });
      } finally {
        setLoading(false);
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
            name="role_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Code</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Role code"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Role name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Status" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
