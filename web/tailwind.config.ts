import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

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
          accent: {
            purple: '#C8B5FF',
            orange: '#F86232',
          },
        },
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('short', '@media(max-height:810px)')
      addVariant('extra-short', '@media(max-height:700px)')
      addVariant('tall', '@media(min-height:970px)')
      addVariant('extra-tall', '@media(min-height:1150px)')
    }),
  ],
}

export default config
