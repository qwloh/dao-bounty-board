import React from 'react';

export const PrimaryButton = ({
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={
      'cursor-pointer shadow-button-shadow rounded-lg px-6 h-10 gap-1 flex items-center font-medium justify-center w-28 text-cta-night transition-all duration-300 bg-gradient-to-r from-cta-nightGradientFrom to-cta-nightGradientTo hover:brightness-150 active:duration-150 active:scale-95' +
      ` ${className || ''}`
    }
    {...rest}
  />
)
