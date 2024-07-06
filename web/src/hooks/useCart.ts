import { useLocalStorage } from 'usehooks-ts'

type Cart = Array<string>

export function useCart() {
  const [cart, setCart] = useLocalStorage<Cart>('cart', [], {
    initializeWithValue: false,
  })

  function addToCart(item: string) {
    // avoid duplicates
    if (!cart.includes(item)) {
      setCart([...cart, item])
    }
  }

  function removeFromCart(item: string) {
    setCart(cart.filter((i) => i !== item))
  }

  return { cart, addToCart, removeFromCart }
}
