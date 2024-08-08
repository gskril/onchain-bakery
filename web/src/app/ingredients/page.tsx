'use client'

import { Logo } from '@/components/Logo'
import { products as _products } from '@/lib/products'

// Deduplicate products
const productNames = new Set()
const products = _products.filter((product) => {
  if (
    productNames.has(product.name) ||
    product.name === 'Snack pack' ||
    product.id === BigInt(1)
  ) {
    return false
  }

  productNames.add(product.name)
  return true
})

export default function Ingredients() {
  return (
    <div className="bg-brand-background-primary mx-auto flex min-h-svh flex-col items-center overflow-hidden px-6 py-11">
      <Logo className="mb-12 w-36" />

      <div className="flex w-full flex-col gap-8 sm:max-w-3xl">
        <div className="flex max-w-md flex-col gap-2">
          <h1 className="font-pangram text-4xl font-extrabold">Ingredients</h1>

          <p className="text-lg">
            Listed below is all the ingredients used in our products. Note that
            everything is baked in a home kitchen and may contain traces of
            nuts, gluten, dairy, and other allergens.
          </p>
        </div>

        <hr className="border-brand-primary w-full" />

        {products.map((product) => (
          <>
            <div key={product.name} className="flex max-w-md flex-col gap-2">
              <h2 className="text-2xl">{product.name}</h2>
              <ul>{product.ingredients}</ul>
            </div>

            <hr className="border-brand-primary w-full" />
          </>
        ))}
      </div>
    </div>
  )
}
