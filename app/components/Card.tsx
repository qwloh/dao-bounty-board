import React from 'react';

interface ICard extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export const Card = ({ className, glow, ...rest }: ICard) => (
  <div
    className={`dark:bg-container-night rounded-lg border border-card ${
      glow ? 'shadow-card' : ''
    } ${className || ''}`}
    {...rest}
  />
)
