/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cta: {
          blue:   '#00a1de',
          red:    '#c60c30',
          green:  '#009b3a',
          purple: '#522398',
          orange: '#f9461c',
          yellow: '#f9e300',
          pink:   '#e27ea6',
          brown:  '#62361b',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.35s ease-out both',
        'fade-in':    'fade-in 0.25s ease-out both',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
};
