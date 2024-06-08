'use client'

import { Button, buttonStyles } from '@/components/Button'

const products = [
  { name: 'chocolate sourdough loaf', image: '/loaf.png', price: '15' },
  { name: 'chocolate babka', image: '/pan.png', price: '10' },
  { name: 'snack pass', image: '/pass.png', price: '5' },
]

export default function Home() {
  return (
    <>
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
            <div key={product.name} className="flex flex-col items-center">
              <img
                src={product.image}
                alt={product.name}
                className="h-24 w-24"
              />
              <Button className="mt-4">ADD TO CART</Button>
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
