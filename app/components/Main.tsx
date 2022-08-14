import React, { HTMLAttributes } from 'react';

export const Main = ({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) => (
  <main className="flex-1">
    <div
      className={'max-w-screen-xl mx-auto px-4 py-8' + ` ${className || ''}`}
      {...rest}
    />
  </main>
)
