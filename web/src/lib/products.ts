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
    image: '/loaf.png',
  },
  {
    id: BigInt(2),
    name: 'chocolate babka',
    image: '/pan.png',
  },
  {
    id: BigInt(3),
    name: 'snack pass',
    image: '/pass.png',
  },
]
