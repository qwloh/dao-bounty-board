import React from 'react';

import { Plus } from './Icons/Plus';

export const AddButton = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`font-medium rounded shadow-ghost-button-shadow cursor-pointer py-2 px-4 rounded-l gap-1 flex items-center justify-center bg-button-ghost-bg w-fit transition-all select-none text-text-secondary hover:text-text-primary hover:outline hover:outline-1 hover:outline-accent hover:brightness-150 active:brightness-75 ${
      className || ''
    }`}
    {...rest}
  >
    <Plus className="text-accent text-base" />
    {children}
  </div>
)
