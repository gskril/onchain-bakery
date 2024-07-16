'use client'

import { Button, buttonStyles } from '@/components/Button'
import { DividerOne, DividerTwo } from '@/components/Dividers'
import { EmblaCarousel } from '@/components/EmblaCarousel'
import { Faqs } from '@/components/Faqs'
import { Logo } from '@/components/Logo'
import { NumberOne, NumberThree, NumberTwo } from '@/components/Numbers'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import {
  CircleScribble,
  UnderlineScribble,
  UnderlineScribble2,
} from '@/components/Scribbles'
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

      <header className="grid p-6 sm:p-12 lg:min-h-svh lg:grid-cols-[7fr,4fr] lg:gap-10">
        <div className="flex w-full flex-col justify-between lg:order-2">
          <div />

          <Logo className="max-w-44 sm:max-w-60 lg:max-w-96" />

          <div className="py-8 lg:py-0 lg:pt-8">
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
                'short:scale-90 extra-short:hidden',
              ])}
            />

            <BaguetteSticker
              className={cn([
                'absolute -right-6 -top-10 z-10 w-28',
                'lg:-right-6 lg:-top-16 lg:w-44',
                'xl:-right-12 xl:w-56',
                'short:scale-90 extra-short:hidden',
              ])}
            />

            <div className="border-brand-primary bg-brand-primary z-0 flex h-full items-center overflow-hidden rounded-lg border-2">
              <EmblaCarousel />
            </div>
          </div>
        </div>
      </header>

      <main>
        <DividerOne className="max-w-full" />

        <div className="bg-brand-background-secondary">
          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-12">
            <h2 className="section-title">how it works</h2>

            <UnderlineScribble className="-mt-3 mb-10 pl-2" />

            {(() => {
              const steps = [
                'order bread',
                'pay on ethereum',
                'pick up bread on the weekend in manhattan',
              ]

              return (
                <div className="grid max-w-80 gap-12 md:max-w-full md:grid-cols-3">
                  {steps.map((step, index) => (
                    <div className="grid grid-cols-[1fr,4fr]" key={step}>
                      {index === 0 ? (
                        <NumberOne />
                      ) : index === 1 ? (
                        <NumberTwo />
                      ) : (
                        <NumberThree />
                      )}

                      <div className="flex flex-col items-center gap-3">
                        <img src={`/process/${index + 1}.svg`} alt="" />
                        <span className="font-pangram text-center text-lg font-extrabold leading-5">
                          {step}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>

        <DividerTwo className="max-w-full" />

        <div
          className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-12 pt-0 text-center"
          id="shop"
        >
          <h2 className="section-title xs:mb-0 mb-10">these are the breads</h2>

          <CircleScribble className="xs:block pointer-events-none -mt-[6.25rem] mb-10 hidden w-[21rem] pl-2 sm:-mt-[6.75rem] sm:w-[34rem]" />

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
              <div className="grid items-end gap-10 md:grid-cols-3">
                {inventory.data.map((product) => (
                  <div
                    key={product.name}
                    className="flex flex-col items-center"
                    onClick={() => addToCart(product.name)}
                  >
                    <h3 className="font-pangram mb-2 text-3xl">
                      {product.name}
                    </h3>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="border-brand-primary w-full rounded-lg border sm:max-w-72"
                    />

                    <div className="bg-brand-background-secondary relative mb-4 mt-8 flex w-full flex-col items-start gap-4 rounded-lg p-8 text-left">
                      <div className="text-brand-background-secondary bg-brand-primary absolute -top-6 right-0 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold italic">
                        {product.quantity.formatted} left
                      </div>

                      <hr className="border-brand-primary w-full" />

                      <p className="leading-5">{product.description}</p>

                      <hr className="border-brand-primary w-[20%]" />

                      <span className="font-pangram font-extrabold">
                        ingredients
                      </span>

                      <p className="leading-5">{product.ingredients}</p>

                      <hr className="border-brand-primary w-full" />

                      <div className="flex w-full justify-between gap-4">
                        <span className="font-pangram text-lg font-extrabold">
                          {product.price.formatted} ETH{' '}
                        </span>
                        {ethPrice && (
                          <span>
                            ${(product.price.formatted * ethPrice).toFixed(0)}{' '}
                            USD
                          </span>
                        )}
                      </div>
                    </div>

                    <Button disabled={true} className="self-start">
                      Buy Now
                    </Button>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        <div className="mx-auto mt-6 flex flex-col items-center">
          <h2 className="section-title mb-2 max-w-lg px-6 text-center sm:mb-4">
            Questions that we thought you might ask
          </h2>

          <UnderlineScribble2 className="w-full max-w-xl px-6" />

          <div className="bg-brand-background-secondary my-8 w-full">
            <Faqs className="mx-auto max-w-7xl px-6 py-6" />
          </div>
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
