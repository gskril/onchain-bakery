import { Button } from '@/components/Button'
import { useCart } from '@/hooks/useCart'
import { useEthPrice } from '@/hooks/useEthPrice'
import { useInventory } from '@/hooks/useInventory'

export function Products() {
  const { cart, addToCart, removeFromCart } = useCart()
  const { data: ethPrice } = useEthPrice()
  const inventory = useInventory({ filter: true })

  if (inventory.isLoading) {
    return <p className="text-center">Loading...</p>
  }

  if (!inventory.data || inventory.data.length === 0) {
    return <p className="text-center">No bread available right now &#9785;</p>
  }

  return (
    <div className="grid items-end gap-10 md:grid-cols-3">
      {inventory.data.map((product) => (
        <div key={product.name} className="flex flex-col items-center">
          <h3 className="font-pangram mb-2 text-3xl">{product.name}</h3>

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

            <span className="font-pangram font-extrabold">ingredients</span>

            <p className="leading-5">{product.ingredients}</p>

            <hr className="border-brand-primary w-full" />

            <div className="flex w-full justify-between gap-4">
              <span className="font-pangram text-lg font-extrabold">
                {product.price.formatted} ETH{' '}
              </span>
              {ethPrice && (
                <span>
                  ${(product.price.formatted * ethPrice).toFixed(0)} USD
                </span>
              )}
            </div>
          </div>

          <Button
            className="self-start"
            onClick={() => {
              if (cart.includes(product.id)) {
                removeFromCart(product.id)
              } else {
                addToCart(product.id)
              }
            }}
          >
            {cart.includes(product.id) ? 'Remove from cart' : 'Add to cart'}
          </Button>
        </div>
      ))}
    </div>
  )
}
