import { useCallback, useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export function useCart() {
  // useLocalStorage() doesn't like bigints, so we store them as numbers internally but export them as bigint for better type safety in other files
  const [_cart, setCart] = useLocalStorage<Array<number>>('cart', [])

  // Memoize the cart to maintain a stable reference
  const cart = useMemo(() => _cart.map((i) => BigInt(i)), [_cart])

  const addToCart = useCallback(
    (item: bigint) => {
      console.log(item, cart.includes(item))

      // avoid duplicates
      if (!cart.includes(item)) {
        setCart((prevCart) => [...prevCart, Number(item)])
      }
    },
    [cart, setCart]
  )

  const removeFromCart = useCallback(
    (item: bigint) => {
      setCart((prevCart) => prevCart.filter((i) => i !== Number(item)))
    },
    [setCart]
  )

  return { cart, addToCart, removeFromCart }
}
