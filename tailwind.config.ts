import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // USA '94-inspired palette
        'brand-black': '#000000',
        'brand-blue':  '#0B4DB3',
        'brand-red':   '#EF1B1B',
        'brand-ink':   '#000000',
        'brand-white': '#FFFFFF',
      },
      fontFamily: {
        headline: ['Barlow Condensed', 'Arial Narrow', 'Impact', 'sans-serif'],
        body:     ['Outfit', 'system-ui', 'sans-serif'],
        mono:     ['Space Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
