import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export const buttonStyles = cva(
  'font-pangram border-brand-primary text-brand-primary w-fit rounded-full border text-xl px-4 py-1 text-center disabled:cursor-not-allowed uppercase hover:bg-brand-accent-purple'
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
