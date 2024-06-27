import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export const buttonStyles = cva(
  'font-pangram border-brand-primary text-brand-primary w-fit rounded-full border-2 px-3 py-1 text-center disabled:cursor-not-allowed'
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
