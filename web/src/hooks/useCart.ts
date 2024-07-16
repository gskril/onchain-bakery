import { useLocalStorage } from 'usehooks-ts'

export function useCart() {
  // useLocalStorage() doesn't like bigints, so we store them as numbers internally but export them as bigint for better type safety in other files
  const [_cart, setCart] = useLocalStorage<Array<number>>('cart', [], {
    initializeWithValue: false,
  })

  const cart = _cart.map((i) => BigInt(i))

  function addToCart(item: bigint) {
    console.log(item, cart.includes(item))

    // avoid duplicates
    if (!cart.includes(item)) {
      setCart([..._cart, Number(item)])
    }
  }

  function removeFromCart(item: bigint) {
    setCart(_cart.filter((i) => i !== Number(item)))
  }

  return { cart, addToCart, removeFromCart }
}
