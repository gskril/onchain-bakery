import { Button } from '@/components/Button'
import { useCart } from '@/hooks/useCart'
import { useEthPrice } from '@/hooks/useEthPrice'
import { useInventory } from '@/hooks/useInventory'

export function Products() {
  const { cart, addToCart, removeFromCart } = useCart()
  const { data: ethPrice } = useEthPrice()
  const inventory = useInventory({})

  if (inventory.isLoading) {
    return <p className="text-center text-lg">Loading...</p>
  }

  if (!inventory.data || inventory.data.length === 0) {
    return (
      <>
        <p className="pt-4 text-center text-lg">
          No bread available right now &#9785;
        </p>

        <p className="pb-4 text-center text-lg">
          Come back on August 8th for more
        </p>
      </>
    )
  }

  return (
    <div className="grid items-stretch gap-10 md:grid-cols-3">
      {inventory.data.map((product) => (
        <div key={product.name} className="flex flex-col items-center">
          <h3 className="font-pangram mb-2 text-3xl">{product.name}</h3>

          <img
            src={product.image}
            alt={product.name}
            className="border-brand-primary w-full rounded-lg border sm:max-w-72"
          />

          <div className="bg-brand-background-secondary relative mb-4 mt-8 flex h-full w-full flex-col items-start gap-4 rounded-lg p-8 pb-6 text-left">
            <div className="text-brand-background-secondary bg-brand-primary absolute -top-6 right-0 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold italic">
              {product.quantity.formatted} left
            </div>

            <div className="grid gap-4">
              <hr className="border-brand-primary w-full" />
              <p className="leading-5">{product.description}</p>
            </div>

            <a href="/ingredients" className="mt-4">
              See ingredients →
            </a>

            <div className="grid w-full gap-4">
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
          </div>

          <Button
            className="self-start"
            disabled={product.quantity.formatted === 0}
            onClick={() => {
              if (cart.includes(product.id)) {
                removeFromCart(product.id)
              } else {
                addToCart(product.id)
              }
            }}
          >
            {product.quantity.formatted === 0
              ? 'Sold out'
              : cart.includes(product.id)
                ? 'Remove from cart'
                : 'Add to cart'}
          </Button>
        </div>
      ))}
    </div>
  )
}
