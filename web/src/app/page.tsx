'use client'

import { Button, buttonStyles } from '@/components/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
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

      <header className="flex h-svh max-h-[42rem] flex-col justify-end bg-neutral-200 p-6">
        <h1 className="text-7xl">Title</h1>
        <h2 className="mb-6 mt-1 text-xl">something about the bread</h2>
        <a href="#items" className={buttonStyles()}>
          BUY BREAD
        </a>
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

      <footer className="flex justify-between gap-4 bg-neutral-200 px-6 py-2 text-sm">
        <span>&copy; 2024 blah blah</span>
        <a href="https://warpcast.com/greg" target="_blank">
          follow on farcaster &#8599;
        </a>
      </footer>
    </>
  )
}
