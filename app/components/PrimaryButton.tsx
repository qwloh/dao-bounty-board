import React from 'react';

interface IPrimaryButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ghost?: boolean
}

export const PrimaryButton = ({
  className,
  ghost,
  ...rest
}: IPrimaryButton) => (
  <button
    className={
      `cursor-pointer shadow-button-shadow rounded-lg px-6 h-10 gap-1 flex items-center font-medium justify-center min-w-[7rem] transition-all duration-300 whitespace-nowrap ${
        ghost
          ? 'bg-black text-white'
          : 'text-cta-night bg-gradient-to-r from-cta-nightGradientFrom to-cta-nightGradientTo'
      } hover:brightness-150 active:duration-150 active:scale-95` +
      ` ${className || ''}`
    }
    {...rest}
  />
)
