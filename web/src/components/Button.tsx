import { VariantProps, cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/lib/utils'

import { Spinner } from './Spinner'

export const buttonStyles = cva(
  'flex flex-row gap-2 items-center justify-center font-pangram border-brand-primary w-fit rounded-full border px-4 py-1 text-center text-xl uppercase disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        outline:
          'text-brand-primary hover:bg-brand-accent-purple disabled:hover:bg-transparent',
        filled:
          'bg-brand-primary text-brand-background-secondary hover:bg-[#365eea]',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  }
)

export function Button({
  children,
  className,
  loading,
  variant,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & { loading?: boolean }) {
  return (
    <button
      className={cn(buttonStyles({ className, variant }))}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && <Spinner />}

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
      {loading && <Spinner color="brand-background-primary" />}

      {children}
    </button>
  )
}
