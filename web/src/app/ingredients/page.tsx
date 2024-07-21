'use client'

import { Logo } from '@/components/Logo'
import { products as _products } from '@/lib/products'

const products = [
  ..._products.filter(
    (product) => product.ingredients && product.name !== 'Snack pass'
  ),
]

products.unshift({
  id: BigInt(0),
  name: 'Plain sourdough loaf',
  ingredients: 'Flour, water, salt.',
  image: '',
  description: '',
})

export default function Ingredients() {
  return (
    <div className="bg-brand-background-secondary mx-auto flex min-h-svh flex-col overflow-hidden px-6 py-11">
      <Logo className="mb-6 w-32" />

      <div className="sm:max-w-96">
        <p className="text-lg">
          Listed below is all the ingredients used in our products. Note that
          everything is baked in a home kitchen and may contain traces of nuts,
          gluten, dairy, and other allergens.
        </p>

        {products.map((product) => (
          <div key={product.name} className="mt-8">
            <h2 className="text-2xl">{product.name}</h2>

            <ul className="mt-4">{product.ingredients}</ul>
          </div>
        ))}
      </div>
    </div>
  )
}
