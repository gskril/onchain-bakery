import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '360px',
      },
      fontFamily: {
        sans: ['var(--font-pangram-sans-compact)'], // overrides the default
        pangram: ['var(--font-pangram-sans)'],
        kelsi: ['var(--font-kelsi)'],
      },
      colors: {
        brand: {
          primary: '#0033E6',
          background: {
            primary: '#FFF6EA',
            secondary: '#FFEED8',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
