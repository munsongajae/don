'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface TossCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function TossCard({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  onClick,
}: TossCardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl sm:rounded-2xl transition-all duration-200',
        {
          'p-3 sm:p-4': padding === 'sm',
          'p-4 sm:p-6': padding === 'md',
          'p-6 sm:p-8': padding === 'lg',
          'shadow-sm': shadow === 'sm',
          'shadow-md': shadow === 'md',
          'shadow-lg': shadow === 'lg',
          'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-95': onClick,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

