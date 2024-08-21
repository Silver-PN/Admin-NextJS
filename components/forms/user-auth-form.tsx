'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
  loginType: z.string().nonempty({ message: 'Login type is required' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('1');
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      loginType: '1'
    }
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        loginType: data.loginType,
        redirect: false,
        callbackUrl: callbackUrl ?? '/dashboard'
      });

      if (result?.error) {
        toast.error('Đăng nhập thất bại !!!', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });
      } else if (result?.url) {
        window.location.href = result.url;
        toast.success('Đăng nhập thành công !!!', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = () => {
    toast.info('Vui lòng liên hệ ADMIN hệ thống để nhận lại mật khẩu', {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light'
    });
  };

  return (
    <>
      <ToastContainer />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tài khoản</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter your username..."
                      disabled={loading}
                      {...field}
                      className="pr-32"
                    />
                    {loginType !== '2' && (
                      <span className="absolute right-0 top-0 flex h-full items-center px-3 text-gray-500">
                        @evnhcmc.vn
                      </span>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật Khẩu</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className="ml-auto w-full" type="submit">
            Đăng nhập
          </Button>
          <a
            onClick={handleForgetPassword}
            className="mt-4 block text-right text-sm text-blue-700 underline"
            style={{ cursor: 'pointer' }}
          >
            Quên mật khẩu?
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Chế độ đăng nhập
              </span>
            </div>
          </div>
          <FormField
            control={form.control}
            name="loginType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    defaultValue={field.value}
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
        </form>
      </Form>
    </>
  );
}
