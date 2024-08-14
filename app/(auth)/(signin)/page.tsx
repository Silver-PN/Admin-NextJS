import { Metadata } from 'next';
import Link from 'next/link';
import UserAuthForm from '@/components/forms/user-auth-form';
import Image from 'next/image';
import Logo from '@/public/logo.png';

export const metadata: Metadata = {
  title: 'Login Page',
  description: 'Authentication forms built using the components.'
};

export default function AuthenticationPage() {
  return (
    <div className="relative flex h-screen flex-col lg:flex-row lg:px-0">
      <div className="flex h-full w-full items-center p-4 lg:w-2/5 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">
              Nhập tài khoản và mật khẩu của bạn để đăng nhập
            </p>
          </div>
          <UserAuthForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="hidden h-full w-full items-center p-4 lg:flex lg:w-3/5 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 text-center">
          <Image
            src={Logo}
            alt="Logo"
            width={300}
            height={300}
            className="mx-auto"
          />
          <h1 className="text-6xl font-extrabold ">HỆ THỐNG</h1>
          <h1 className="text-6xl font-extrabold ">TIN NHẮN TẬP TRUNG </h1>
        </div>
      </div>
    </div>
  );
}
