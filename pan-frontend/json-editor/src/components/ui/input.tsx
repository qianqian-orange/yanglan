import * as React from 'react'

import { cn } from '@/lib/utils'

function Input(
  props: React.ComponentProps<'input'> & React.RefAttributes<HTMLInputElement>,
) {
  const { className, type, ref, ...rest } = props

  return (
    <input
      type={type}
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...rest}
    />
  )
}

export { Input }
