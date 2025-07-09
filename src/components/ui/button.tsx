import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500',
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
