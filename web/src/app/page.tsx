'use client'

import { Button } from '@/components/Button'
import { EmblaCarousel } from '@/components/EmblaCarousel'
import { Logo } from '@/components/Logo'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import { BabkaSticker, BaguetteSticker } from '@/components/Stickers'
import { Tagline } from '@/components/Tagline'
import { useCart } from '@/hooks/useCart'
import { useInventory } from '@/hooks/useInventory'
import { cn } from '@/lib/utils'

export default function Home() {
  const { cart, addToCart, removeFromCart } = useCart()
  const inventory = useInventory()

  return (
    <>
      {cart?.length > 0 && (
        <div className="fixed right-4 top-4">
          <Popover>
            <PopoverTrigger className="h-10 w-10 rounded-full bg-white">
              C
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-4 bg-white">
              {cart.map((item) => (
                <div key={item} className="flex flex-col">
                  <span>{item}</span>
                  <Button onClick={() => removeFromCart(item)}>Remove</Button>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      )}

      <header className="border-brand-primary grid border-b-2 p-6 sm:p-12 lg:min-h-svh lg:grid-cols-[4fr,7fr] lg:gap-12">
        <div className="flex w-full flex-col justify-between">
          <div />

          <Logo className="max-w-44 sm:max-w-60 lg:mx-auto lg:max-w-96" />

          <div className="py-8 sm:py-0">
            <h2 className="font-pangram mb-1 text-xl font-extrabold">
              Made with love, built on Ethereum
            </h2>
            <p className="max-w-80">
              This is Greg. He loves bread and he wants you to love bread too.
            </p>
          </div>
        </div>

        <div className="flex max-h-[89svh] justify-center lg:overflow-hidden">
          <div className="aspect-[3/4] rotate-2 scale-95 lg:rotate-3 lg:scale-[83%] xl:rotate-6 xl:scale-[92%]">
            <BabkaSticker
              className={cn([
                'absolute -bottom-10 -left-4 z-10 w-28 -rotate-[60deg]',
                'lg:-bottom-16 lg:-left-[1.125rem] lg:w-44',
                'xl:-left-16 xl:w-48 xl:rotate-0',
              ])}
            />

            <BaguetteSticker
              className={cn([
                'absolute -right-6 -top-10 z-10 w-28',
                'lg:-right-6 lg:-top-16 lg:w-44',
                'xl:-right-12 xl:w-56',
              ])}
            />

            <div className="border-brand-primary bg-brand-primary z-0 flex h-full items-center overflow-hidden rounded-lg border-2">
              <EmblaCarousel />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {(() => {
          if (!inventory.data) {
            return <p className="text-center">Loading...</p>
          }

          if (inventory.data.length === 0) {
            return (
              <p className="text-center">
                No bread available right now &#9785;
              </p>
            )
          }

          return (
            <div className="grid items-end gap-12 md:grid-cols-3">
              {inventory.data.map((product) => (
                <div
                  key={product.name}
                  className="flex flex-col gap-4"
                  onClick={() => addToCart(product.name)}
                >
                  <h3 className="font-kelsi text-3xl">{product.name}</h3>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="border-brand-primary w-full rounded-lg border sm:max-w-72"
                  />

                  {/* <Button disabled={cart.includes(product.name)}> */}
                  <Button disabled={true}>ADD TO CART</Button>
                </div>
              ))}
            </div>
          )
        })()}
      </main>

      <Tagline className="mx-auto max-w-96 px-6 pb-12 pt-4" />

      <footer className="bg-brand-primary text-brand-background flex justify-between gap-4 px-6 py-2 text-sm">
        <span>&copy; 2024 Good Bread by Greg</span>
        <a href="https://warpcast.com/greg" target="_blank">
          Farcaster &#8599;
        </a>
      </footer>
    </>
  )
}
