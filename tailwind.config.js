/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#191512',
        surface: '#221D18',
        surfaceHover: '#2A241E',
        primary: '#ECA75D',
        primaryHover: '#D99854',
        'text-primary': '#E8DED3',
        'text-secondary': '#A19385',
        status: {
          active: '#6A8B5F',
          overdue: '#C36453',
          pending: '#C68A48',
          returned: '#547B69',
        },
        genre: {
          classic: '#8B6B9E',
          fiction: '#C68A48',
          scifi: '#5F85A1',
          fantasy: '#6A9E6B',
          mystery: '#B86F9A',
          science: '#5FA193',
          romance: '#A56075',
          history: '#908552',
          biography: '#799E6B',
          poetry: '#9E936B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
