import React, { HTMLAttributes } from 'react';

export const Main = (props: HTMLAttributes<HTMLDivElement>) => (
  <main className={'container'}>
    <div className="max-w-screen-xl mx-auto px-4 py-8" {...props} />
  </main>
)
