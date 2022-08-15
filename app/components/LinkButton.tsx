import React from 'react'
import Link  from 'next/link'


export function LinkButton ({ href = '#', className, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link href={href} passHref>
      <a className={` ${className}`} {...rest} />
      </Link>
  )
}