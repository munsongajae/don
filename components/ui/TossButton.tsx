'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface TossButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export default function TossButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: TossButtonProps) {
  return (
    <button
      className={clsx(
        'font-semibold rounded-xl transition-all duration-200',
        'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        {
          // Variants
          'bg-gradient-to-r from-toss-blue-500 to-purple-500 text-white shadow-lg shadow-toss-blue-500/30 hover:shadow-xl hover:shadow-toss-blue-500/40':
            variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
          'border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50': variant === 'outline',
          'bg-transparent text-gray-700 hover:bg-gray-100': variant === 'ghost',
          
          // Sizes
          'h-10 px-4 text-sm': size === 'sm',
          'h-12 px-6 text-base': size === 'md',
          'h-14 px-8 text-lg': size === 'lg',
          
          // Full width
          'w-full': fullWidth,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

