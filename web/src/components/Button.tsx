import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export const buttonStyles = cva(
  'flex flex-row gap-2 items-center font-pangram border-brand-primary text-brand-primary hover:bg-brand-accent-purple w-fit rounded-full border px-4 py-1 text-center text-xl uppercase disabled:cursor-not-allowed disabled:hover:bg-transparent'
)

export function Button({
  children,
  className,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button className={cn(buttonStyles({ className }))} {...props}>
      {loading && (
        <svg
          className="text-brand-primary h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          data-motion-id="svg 2"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      <span className="pt-[0.0625rem]">{children}</span>
    </button>
  )
}
