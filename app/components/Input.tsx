import React from 'react';

interface InputInterface extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string
  prefixLogo?: React.ReactNode | React.ReactNode[]
}

export const Input = React.forwardRef(function Input(
  { prefix, prefixLogo, className, ...rest }: InputInterface,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      className={`relative flex items-center justify-center text-sm ${
        className || ''
      }`}
    >
      {prefix && (
        <span className="absolute left-2 text-text-primary font-medium text-base">
          {prefix}
        </span>
      )}
      {prefixLogo && (
        <span className="absolute left-2 text-text-primary font-medium text-base">
          {prefixLogo}
        </span>
      )}
      <input
        className={`w-full h-8 p-2 pt-2 ${prefix ? 'pl-6' : ''}`}
        style={{ borderRadius: 'inherit', textAlign: 'inherit' }}
        {...rest}
      />
    </div>
  )
})
