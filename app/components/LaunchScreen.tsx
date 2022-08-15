import React from 'react';

import { useLoading } from '../hooks/useLoading';
import { Logo } from './Icons/Logo';

export const LaunchScreen = () => {
  const { loading, text } = useLoading()

  return (
    <div
      className={`absolute w-full h-full backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center text-m font-medium bg-white/50 transition-all dark:bg-black/50 ${
        loading
          ? ' pointer-events-auto opacity-100'
          : ' opacity-0 pointer-events-none'
      }`}
    >
      <Logo className="w-10 animate-ping" />
      <div className="animate-pulse">{text}</div>
    </div>
  )
}
