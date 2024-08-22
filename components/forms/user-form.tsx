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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '../ui/use-toast';
import axios from 'axios';
import { useSession } from 'next-auth/react';

// Schema for creating a new user
const createUserSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters long' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    method_login_id: z
      .string()
      .min(1, { message: 'Please select a login type' }),
    employment_name: z
      .string()
      .min(1, { message: 'Employment name is required' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

// Schema for updating an existing user
const updateUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' }),
  method_login_id: z.string().min(1, { message: 'Please select a login type' }),
  employment_name: z.string().min(1, { message: 'Employment name is required' })
});

type UserFormValues =
  | z.infer<typeof createUserSchema>
  | z.infer<typeof updateUserSchema>;

interface UserFormProps {
  initialData: any | null;
  roles: any[];
}

export const UserForm: React.FC<UserFormProps> = ({ initialData, roles }) => {
  const { data: session, status } = useSession();

  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [method_login_id, setLoginType] = useState<string>('');

  const title = initialData ? 'Edit User' : 'Create User';
  const description = initialData ? 'Edit user details.' : 'Add a new user';
  const toastMessage = initialData ? 'User updated.' : 'User created.';
  const action = initialData ? 'Save changes' : 'Create';

  useEffect(() => {
    if (initialData && initialData.method_login) {
      setLoginType(initialData.method_login.id.toString());
    }
  }, [initialData]);

  const formSchema = initialData ? updateUserSchema : createUserSchema;

  const defaultValues = initialData
    ? {
        email: initialData.email || '',
        username: initialData.username || '',
        password: '',
        confirmPassword: '',
        method_login_id: initialData.method_login
          ? initialData.method_login.id.toString()
          : '1',
        employment_name: initialData.employment_name || ''
      }
    : {
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        method_login_id: '1',
        employment_name: ''
      };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (formData: UserFormValues) => {
    const data = {
      ...formData,
      department_id: session?.user?.department_id,
      branch_code: session?.user?.branch_code,
      user_active: session?.user?.username
    };
    try {
      setLoading(true);

      if (initialData) {
        await axios.put(`/api/users/${initialData.id}`, data);
      } else {
        await axios.post('/api/users', data);
      }
      router.refresh();
      router.push('/dashboard/user');
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
        await axios.delete(`/api/users/${initialData.id}`);
        router.refresh();
        router.push('/dashboard/user');
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
            name="method_login_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setLoginType(value);
                    }}
                  >
                    <div className="flex justify-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="ldap" />
                        <Label htmlFor="ldap">User Domain</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="sql" />
                        <Label htmlFor="sql">User Local</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={loading}
                    placeholder="Email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!initialData && (
            <>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={loading}
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={loading}
                        placeholder="Confirm Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <FormField
            control={form.control}
            name="employment_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Employment Name"
                    {...field}
                  />
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
