import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className, hover = true }: CardProps) => {
  return (
    <div
      className={clsx(
        'card',
        hover && 'hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
};

