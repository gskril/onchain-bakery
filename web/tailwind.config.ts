import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-pangram-sans-compact)'], // overrides the default
        pangram: ['var(--font-pangram-sans)'],
        kelsi: ['var(--font-kelsi)'],
      },
      colors: {
        brand: {
          primary: '#0033E6',
          background: '#FFEED8',
        },
      },
    },
  },
  plugins: [],
}

export default config
