'use client'

import Image from 'next/image'

import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import { BabkaSticker, BaguetteSticker } from '@/components/Stickers'
import { Tagline } from '@/components/Tagline'
import { useCart } from '@/hooks/useCart'

const products = [
  { name: 'chocolate sourdough loaf', image: '/loaf.png', price: '15' },
  { name: 'chocolate babka', image: '/pan.png', price: '10' },
  { name: 'snack pass', image: '/pass.png', price: '5' },
]

export default function Home() {
  const { cart, addToCart, removeFromCart } = useCart()

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

      <header className="border-brand-primary grid border-b-2 p-6 sm:p-12 lg:min-h-svh lg:grid-cols-[2fr,3fr] lg:gap-12">
        <div className="flex w-full flex-col justify-between">
          <div />

          <Logo className="max-w-44 sm:max-w-60 lg:mx-auto lg:max-w-96" />

          <div className="sm:p0 py-8">
            <h2 className="font-pangram mb-1 text-xl font-extrabold">
              Made with love, built on Ethereum
            </h2>
            <p className="max-w-80">
              This is Greg. He loves bread and he wants you to love bread too.
            </p>
          </div>
        </div>

        <div className="relative flex w-full justify-center lg:max-h-[90svh] lg:rotate-6 lg:scale-90">
          <BabkaSticker className="absolute -bottom-8 -left-6 w-32 -rotate-[60deg] lg:-bottom-14 lg:left-14 lg:w-48 lg:rotate-0" />

          <BaguetteSticker className="absolute -top-24 right-24 hidden w-56 lg:block" />

          <Image
            src="/gallery/babka.jpg"
            alt="Babka"
            width={600}
            height={800}
            className="border-brand-primary rounded-lg border-2 object-cover"
          />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-3" id="items">
          {products.map((product) => (
            <div
              key={product.name}
              className="flex flex-col items-center"
              onClick={() => addToCart(product.name)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-24 w-24"
              />
              <Button className="mt-4" disabled={cart.includes(product.name)}>
                ADD TO CART
              </Button>
            </div>
          ))}
        </div>
      </main>

      <Tagline className="mx-auto max-w-96 px-6 pb-12 pt-4" />

      <footer className="bg-brand-primary text-brand-background flex justify-between gap-4 px-6 py-2 text-sm">
        <span>&copy; 2024 Good Bread by Greg</span>
        <a href="https://warpcast.com/greg" target="_blank">
          Follow Greg on Farcaster &#8599;
        </a>
      </footer>
    </>
  )
}
