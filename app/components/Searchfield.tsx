import React from 'react';

export const SearchField = ({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative">
    <input
      className={
        'rounded px-4 py-2 flex gap-1 h-11 text-tday-100 bg-slate-100 dark:bg-input-500 dark:text-tnight-100 text-sm font-medium' +
        ` ${className || ''}`
      }
      {...rest}
    />
  </div>
)
