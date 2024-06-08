import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export const buttonStyles = cva(
  'w-fit min-w-52 bg-neutral-500 p-2 text-center text-white'
)

export function Button({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(buttonStyles({ className }))} {...props}>
      {children}
    </button>
  )
}
