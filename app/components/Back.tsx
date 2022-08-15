import { useRouter } from 'next/router';
import React from 'react';

import { LeftArrow } from './Icons/LeftArrow';

export const Back = ({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter()
  const goBack = () => router.back()
  return (
    <div
      className={
        'text-tnight-200 text-base gap-1 h-8 flex items-center font-medium cursor-pointer transition-all hover:opacity-60' +
        ` ${className || ''}`
      }
      onClick={goBack}
      {...rest}
    >
      <LeftArrow />
      {children || 'Go Back'}
    </div>
  )
}
