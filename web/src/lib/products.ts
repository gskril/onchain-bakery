type Product = {
  id: bigint
  name: string
  image: string
  illustration?: string
}

export const products: Product[] = [
  {
    id: BigInt(1),
    name: 'chocolate sourdough',
    image: '/product/chocolate-loaf.jpg',
  },
  {
    id: BigInt(2),
    name: 'chocolate babka',
    image: '/product/babka.jpg',
  },
  {
    id: BigInt(3),
    name: 'banana bread',
    image: '/product/banana-bread.jpg',
  },
]
