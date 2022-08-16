import React from 'react';

export const Select = ({
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={`rounded bg-text-field-secondary px-2 h-8 uppercase text-sm ${
      className || ''
    }`}
    {...rest}
  />
)
