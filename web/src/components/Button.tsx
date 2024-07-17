import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export const buttonStyles = cva(
  'font-pangram border-brand-primary text-brand-primary hover:bg-brand-accent-purple w-fit rounded-full border px-4 py-1 text-center text-xl uppercase disabled:cursor-not-allowed disabled:hover:bg-transparent'
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
