'use client'

import { Button, buttonStyles } from '@/components/Button'
import { DividerOne } from '@/components/Dividers'
import { EmblaCarousel } from '@/components/EmblaCarousel'
import { Logo } from '@/components/Logo'
import { NumberOne, NumberThree, NumberTwo } from '@/components/Numbers'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import { UnderlineScribble } from '@/components/Scribbles'
import { BabkaSticker, BaguetteSticker } from '@/components/Stickers'
import { Tagline } from '@/components/Tagline'
import { useCart } from '@/hooks/useCart'
import { useEthPrice } from '@/hooks/useEthPrice'
import { useInventory } from '@/hooks/useInventory'
import { cn } from '@/lib/utils'

export default function Home() {
  const { cart, addToCart, removeFromCart } = useCart()
  const { data: ethPrice } = useEthPrice()
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

      <div className="font-pangram mx-auto my-6 w-[calc(100%-6rem)] rounded-full bg-[#F86232] p-2 text-center text-white">
        NOTE: DO NOT SHARE THIS PUBLICLY.
      </div>

      <header className="grid p-6 sm:p-12 lg:min-h-svh lg:grid-cols-[7fr,4fr] lg:gap-10">
        <div className="flex w-full flex-col justify-between lg:order-2">
          <div />

          <Logo className="max-w-44 sm:max-w-60 lg:max-w-96" />

          <div className="py-8 lg:py-0">
            <span className="font-pangram mb-1 text-xl font-extrabold">
              Made with love, built on Ethereum
            </span>

            <p className="max-w-80">
              This is greg. He loves bread and he wants you to love bread too.
            </p>

            <a
              className={buttonStyles({ className: 'mt-2 block' })}
              href="#shop"
            >
              Buy Greg's Bread
            </a>
          </div>
        </div>

        <div className="flex max-h-[89svh] justify-center lg:order-1 lg:overflow-hidden">
          <div className="aspect-[3/4] rotate-2 scale-95 lg:rotate-3 lg:scale-[80%] xl:rotate-6 xl:scale-[92%]">
            <BabkaSticker
              className={cn([
                'absolute -bottom-10 -left-4 z-10 w-28 -rotate-[60deg]',
                'lg:-bottom-16 lg:-left-[1.125rem] lg:w-44',
                'xl:-left-8 xl:w-44 xl:-rotate-12',
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

      <DividerOne className="max-w-full" />

      <main>
        <div className="bg-brand-background-secondary">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-12">
            <h2 className="font-pangram text-4xl font-extrabold">
              how it works
            </h2>

            <UnderlineScribble className="-mt-3 mb-10 pl-2" />

            <div className="grid max-w-80 gap-12 md:max-w-full md:grid-cols-3">
              <div className="grid grid-cols-[1fr,4fr]">
                <NumberOne />
                <div className="flex flex-col items-center gap-3">
                  <img src="/process/1.svg" alt="" />
                  <span className="font-pangram text-center text-lg font-extrabold leading-5">
                    order bread
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr,4fr]">
                <NumberTwo />
                <div className="flex flex-col items-center gap-3">
                  <img src="/process/2.svg" alt="" />
                  <span className="font-pangram text-center text-lg font-extrabold leading-5">
                    pay on ethereum
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr,4fr]">
                <NumberThree />
                <div className="flex flex-col items-center gap-3">
                  <img src="/process/3.svg" alt="" />
                  <span className="font-pangram text-center text-lg font-extrabold leading-5">
                    pick up bread on the weekend in manhattan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12" id="shop">
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
                    className="grid gap-4"
                    onClick={() => addToCart(product.name)}
                  >
                    <h3 className="font-kelsi text-3xl">{product.name}</h3>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="border-brand-primary w-full rounded-lg border sm:max-w-72"
                    />

                    <div className="flex items-center gap-2">
                      {/* <Button disabled={cart.includes(product.name)}> */}
                      <Button disabled={true}>ADD TO CART</Button>
                      <span>
                        {product.price.formatted} ETH{' '}
                        {ethPrice &&
                          `($${(product.price.formatted * ethPrice).toFixed(0)})`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </main>

      <Tagline className="mx-auto max-w-96 px-6 pb-12 pt-4" />

      <footer className="bg-brand-primary text-brand-background-secondary flex justify-between gap-4 px-6 py-2 text-sm">
        <span>&copy; 2024 Good Bread by Greg</span>
        <a href="https://warpcast.com/greg" target="_blank">
          Farcaster &#8599;
        </a>
      </footer>
    </>
  )
}
