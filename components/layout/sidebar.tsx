'use client';
import React, { useState } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/public/logo.png';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();

  const handleToggle = () => {
    toggle();
  };

  return (
    <aside
      className={cn(
        `relative  hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block`,
        !isMinimized ? 'w-72' : 'w-[72px]',
        className
      )}
    >
      {!isMinimized && (
        <Link href={'https://www.evnhcmc.vn/'} target="_blank">
          <div className="hidden items-center p-5 pt-10 lg:flex">
            <Image
              src={Logo}
              alt="Logo"
              width={100} // Adjust as needed
              height={100} // Adjust as needed
              className="mr-2 transition-all"
            />
            <div>
              <p className="text-sm">Hệ thống</p>
              <p className="text-sm">tin nhắn tập trung</p>
            </div>
          </div>
        </Link>
      )}
      <ChevronLeft
        className={cn(
          'absolute -right-3 top-10 z-50  cursor-pointer rounded-full border bg-background text-3xl text-foreground',
          isMinimized && 'rotate-180'
        )}
        onClick={handleToggle}
      />
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mt-3 space-y-1">
            <DashboardNav items={navItems} />
          </div>
        </div>
      </div>
    </aside>
  );
}
