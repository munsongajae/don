import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  className?: string;
}

export const Button = ({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx('btn', `btn-${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  );
};

