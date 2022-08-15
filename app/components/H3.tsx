import React from 'react';

export const H3 = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={
      'text-lg font-bold text-tday-100 dark:text-tnight-100' +
      ` ${className || ''}`
    }
    {...rest}
  />
)
