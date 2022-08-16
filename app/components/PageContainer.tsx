import React from 'react';

export const PageContainer = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={
      'w-full flex flex-col gap-6 rounded-lg py-8 px-6 bg-black/10 dark:bg-night-700' +
      ` ${className || ''}`
    }
    {...rest}
  />
)
