import React from 'react';

export const H2 = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={
      'text-xl font-bold text-tday-100 dark:text-tnight-100' +
      ` ${className || ''}`
    }
    {...rest}
  />
)
