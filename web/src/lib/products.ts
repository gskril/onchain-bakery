type Product = {
  id: bigint
  active?: boolean
  fullLoaf?: boolean
  name: string
  image: string
  description: string
  ingredients?: string
  illustration?: string
}

export const products: Product[] = [
  {
    id: BigInt(1),
    name: 'Good Bread by Greg',
    image: '/nft/launch.png',
    description:
      'Celebratory NFT to commemorate the launch of Good Bread by Greg.',
  },
  {
    id: BigInt(2),
    active: true,
    fullLoaf: true,
    name: 'Chocolate sourdough',
    image: '/product/chocolate-loaf.jpg',
    description:
      'Double chocolate sourdough loaf because more chocolate is always a good thing.',
    ingredients:
      'Flour, water, salt, brown sugar, cocoa powder, chocolate chips, pure vanilla extract.',
  },
  {
    id: BigInt(3),
    active: true,
    fullLoaf: true,
    name: 'Chocolate babka',
    image: '/product/babka.jpg',
    description:
      "Most normal people eat babka for dessert but there's nothing better than a warm slice for breakfast.",
    ingredients:
      'Flour, water, salt, yeast, sugar, pure vanilla extract, whole milk, butter, eggs, chocolate chips, cocoa powder, cinnamon.',
  },
  {
    id: BigInt(4),
    active: true,
    name: 'Snack pass',
    image: '/product/snack-pass.png',
    description:
      'Don’t want to commit to a whole bread? Get a slice of bread. It’s snack sized and tiny and you get a small treat to have while you hang out.',
    ingredients:
      'See the others. If more snacks appear, the ingredients will be listed at pickup.',
  },
]
