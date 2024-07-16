type Product = {
  id: bigint
  name: string
  image: string
  description: string
  ingredients: string
  illustration?: string
}

export const products: Product[] = [
  {
    id: BigInt(1),
    name: 'chocolate sourdough',
    image: '/product/chocolate-loaf.jpg',
    description:
      'Chocolate sourdough is so yummy. It’s sourdough but it’s chocolate. Have it as a little toast or use it in a sandwich for a chocolatey twist.',
    ingredients:
      'flour, water, salt, brown sugar, cocoa powder, chocolate chips, vanilla.',
  },
  {
    id: BigInt(2),
    name: 'chocolate babka',
    image: '/product/babka.jpg',
    description:
      'Chocolate babka is cool. you should eat it. here are some other facts about it. it’s a sweet little treat, you should def eat it.',
    ingredients:
      'flour, water, salt, yeast, sugar, vanilla, whole milk, butter, eggs, chocolate chips, cocoa powder, cinnamon.',
  },
  {
    id: BigInt(3),
    name: 'snack pass',
    image: '/product/snack-pass.png',
    description:
      'don’t want to commit to a whole bread? get little breads. they’re snack sized and tiny and you get a small treat to have while you hang out at the events.',
    ingredients: 'see the others.',
  },
]
