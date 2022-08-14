import React from 'react';

export const H1 = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={
      'text-2xl font-bold text-tday-100 dark:text-tnight-100' +
      ` ${className || ''}`
    }
    {...rest}
  />
)
