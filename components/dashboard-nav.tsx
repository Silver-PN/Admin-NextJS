'use client';
import Link from 'next/link';

import { type NavItem } from '@/types';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';
import { buttonVariants } from '@/components/ui/button';

import {
  Accordion,
  AccordionContent,
  AccordionItem
} from '@/components/ui/accordion';
import React, { useEffect, useState } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Icons } from './icons';

interface SideNavProps {
  items: NavItem[];
  setOpen?: (open: boolean) => void;
  className?: string;
}

export function DashboardNav({ items, setOpen, className }: SideNavProps) {
  const path = usePathname();
  const { isMinimized } = useSidebar(); // Changed isOpen to isMinimized
  const [openItem, setOpenItem] = useState('');
  const [lastOpenItem, setLastOpenItem] = useState('');

  useEffect(() => {
    if (isMinimized) {
      setOpenItem(lastOpenItem);
    } else {
      setLastOpenItem(openItem);
      setOpenItem('');
    }
  }, [isMinimized]);

  type IconName = keyof typeof Icons;

  const getIcon = (name: IconName) => {
    const IconComponent = Icons[name];
    return IconComponent || null;
  };

  return (
    <nav className="space-y-2">
      {items.map((item) =>
        item.isChidren ? (
          <Accordion
            type="single"
            collapsible
            className="space-y-2"
            key={item.title}
            value={openItem}
            onValueChange={setOpenItem}
          >
            <AccordionItem value={item.title} className="border-none">
              <div
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'group relative flex h-12 justify-between px-4 py-2 text-base duration-200 hover:bg-muted hover:no-underline'
                )}
                onClick={() =>
                  setOpenItem(openItem === item.title ? '' : item.title)
                }
              >
                <div className="flex items-center space-x-3">
                  {item.icon &&
                    React.createElement(getIcon(item.icon), {
                      className: 'mr-3 h-5 w-5 flex-none'
                    })}
                  {!isMinimized && (
                    <div
                      className={cn(
                        'text-base duration-200',
                        !isMinimized && className
                      )}
                    >
                      {item.title}
                    </div>
                  )}
                </div>
                {!isMinimized && (
                  <ChevronDownIcon
                    className={cn(
                      'absolute right-3 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                      openItem === item.title && 'rotate-180'
                    )}
                  />
                )}
              </div>
              <AccordionContent className="mt-2 space-y-4 pb-1">
                {item.children?.map((child) => (
                  <Link
                    key={child.title}
                    href={child.href}
                    onClick={() => {
                      if (setOpen) setOpen(false);
                    }}
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      'group relative flex h-12 justify-start gap-x-3',
                      path === child.href && 'bg-muted font-bold hover:bg-muted'
                    )}
                  >
                    {getIcon(child.icon) &&
                      React.createElement(getIcon(child.icon), {
                        className: 'mr-3 h-5 w-5 flex-none'
                      })}
                    {!isMinimized && (
                      <div
                        className={cn(
                          'absolute left-12 text-base duration-200',
                          !isMinimized && className
                        )}
                      >
                        {child.title}
                      </div>
                    )}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <Link
            key={item.title}
            href={item.href}
            onClick={() => {
              if (setOpen) setOpen(false);
            }}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'group relative flex h-12 justify-start',
              path === item.href && 'bg-muted font-bold hover:bg-muted'
            )}
          >
            {item.icon &&
              React.createElement(getIcon(item.icon), {
                className: 'mr-3 h-5 w-5 flex-none'
              })}
            {!isMinimized && (
              <span
                className={cn(
                  'absolute left-12 text-base duration-200',
                  !isMinimized && className
                )}
              >
                {item.title}
              </span>
            )}
          </Link>
        )
      )}
    </nav>
  );
}
