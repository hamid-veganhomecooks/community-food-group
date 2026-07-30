/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        terracotta: '#C26A4F',
        'terracotta-light': '#D98266',
        'terracotta-dark': '#A8553B',
        sage: '#7A9B7A',
        'sage-light': '#9AB89A',
        'sage-dark': '#5C7A5C',
        cream: '#F5F0E8',
        'cream-dark': '#E8E0D4',
        earthy: {
          50: '#FAF6F0',
          100: '#F5EDE1',
          200: '#E8DBC8',
          300: '#DBC9AF',
          400: '#CEB796',
          500: '#C1A57D',
          600: '#B49364',
          700: '#A7814B',
          800: '#9A6F32',
          900: '#8D5D19',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};