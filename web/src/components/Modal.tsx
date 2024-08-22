export function Modal({
  setIsModalOpen,
  open,
  children,
}: {
  setIsModalOpen: (isOpen: boolean) => void
  open: boolean
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed z-10 flex h-full w-full items-center justify-center p-6">
      <div
        className="absolute bottom-0 left-0 right-0 top-0 bg-black/50"
        onClick={() => setIsModalOpen(false)}
      />

      <div className="bg-brand-background-primary absolute flex max-w-lg flex-col gap-4 rounded-lg p-6">
        {children}
      </div>
    </div>
  )
}
