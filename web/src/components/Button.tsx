import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/lib/utils'

export const buttonStyles = cva(
  'flex flex-row gap-2 items-center justify-center font-pangram border-brand-primary text-brand-primary hover:bg-brand-accent-purple w-fit rounded-full border px-4 py-1 text-center text-xl uppercase disabled:cursor-not-allowed disabled:hover:bg-transparent'
)

export function Button({
  children,
  className,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={cn(buttonStyles({ className }))}
      disabled={props.disabled || loading}
      {...props}
    >
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

export const buttonFilledStyles = cva(
  'bg-brand-primary border-brand-primary border-2 text-brand-background-primary mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:bg-[#7E97EF]',
  {
    variants: {
      variant: {
        primary: '',
        secondary: 'text-brand-primary bg-opacity-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

// TODO: Turn this into a variant of the primary <Button> component
export function ButtonFilled({
  children,
  className,
  loading,
  variant,
  ...props
}: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonFilledStyles>) {
  return (
    <button
      className={cn(buttonFilledStyles({ variant, className }))}
      {...props}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="text-brand-background-primary h-4 w-4 animate-spin"
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

      {children}
    </button>
  )
}
