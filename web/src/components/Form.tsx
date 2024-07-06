import { Button } from './Button'

function Root({
  title,
  children,
  handler,
  button,
  ...props
}: {
  title: string
  button?: string
  handler: (targets: Record<string, string>) => void
} & React.HTMLProps<HTMLFormElement>) {
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        type Target = Record<string, { id: string; value: string }>
        const targets = e.target as unknown as Target

        const values = Object.fromEntries(
          Object.entries(targets)
            .map(([_, { id, value }]) => [id, value])
            .filter(([id]) => id)
        )

        handler(values)
      }}
      {...props}
    >
      <p className="font-pangram font-extrabold">{title}</p>

      {children}

      <Button className="w-full" type="submit">
        {button || 'Send'}
      </Button>
    </form>
  )
}

function Input(props: React.HTMLProps<HTMLInputElement>) {
  return (
    <input
      autoComplete="off"
      className="border-brand-primary rounded-full border px-3 py-1"
      {...props}
    />
  )
}

export const Form = Object.assign(Root, { Input })
