import React, { HTMLAttributes } from 'react';

import { LaunchScreen } from './LaunchScreen';

export const Main = ({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) => (
  <main className="z-10 flex-1 relative">
    <LaunchScreen />
    <div
      className={'max-w-screen-xl mx-auto px-4 py-8' + ` ${className || ''}`}
      {...rest}
    />
  </main>
)
