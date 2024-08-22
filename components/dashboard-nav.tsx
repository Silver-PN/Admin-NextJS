'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { Dispatch, SetStateAction } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false
}: DashboardNavProps) {
  const path = usePathname();
  const { isMinimized } = useSidebar();
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  if (!items?.length) {
    return null;
  }

  return (
    <nav className="grid items-start gap-2">
      <TooltipProvider>
        {items.map((item, index) => {
          const Icon = Icons[item.icon || 'arrowRight'];

          return (
            <div key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    {item.href ? (
                      <Link
                        href={item.disabled ? '/' : item.href}
                        className={cn(
                          'flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                          path === item.href ? 'bg-accent' : 'transparent',
                          item.disabled && 'cursor-not-allowed opacity-80'
                        )}
                        onClick={() => {
                          if (item.subItems?.length) {
                            setActiveItemIndex(
                              activeItemIndex === index ? null : index
                            );
                          } else if (setOpen) {
                            setOpen(false);
                          }
                        }}
                      >
                        <Icon className={`ml-3 size-5 flex-none`} />
                        {isMobileNav || (!isMinimized && !isMobileNav) ? (
                          <span className="mr-2 truncate">{item.title}</span>
                        ) : (
                          ''
                        )}
                      </Link>
                    ) : (
                      <div
                        className={cn(
                          'flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                          activeItemIndex === index
                            ? 'bg-accent'
                            : 'transparent',
                          item.disabled && 'cursor-not-allowed opacity-80'
                        )}
                        onClick={() => {
                          setActiveItemIndex(
                            activeItemIndex === index ? null : index
                          );
                        }}
                      >
                        <Icon className={`ml-3 size-5 flex-none`} />
                        {isMobileNav || (!isMinimized && !isMobileNav) ? (
                          <span className="mr-2 truncate">{item.title}</span>
                        ) : (
                          ''
                        )}
                      </div>
                    )}

                    {item.subItems?.length && activeItemIndex === index && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={
                              subItem.disabled || !subItem.href
                                ? '/'
                                : subItem.href
                            }
                            className={cn(
                              'block rounded-md py-1 pl-4 pr-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                              path === subItem.href
                                ? 'bg-accent'
                                : 'transparent',
                              subItem.disabled &&
                                'cursor-not-allowed opacity-80'
                            )}
                            onClick={() => {
                              if (setOpen) setOpen(false);
                            }}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="right"
                  sideOffset={8}
                  className={!isMinimized ? 'hidden' : 'inline-block'}
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </TooltipProvider>
    </nav>
  );
}
