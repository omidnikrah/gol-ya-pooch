// eslint-disable-next-line @typescript-eslint/no-require-imports
const { join } = require('path');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        custom: ['IranYekan'],
      },
      fontWeight: {
        thin: 100,
        light: 300,
        'extra-bold': 500,
        black: 700,
        'extra-black': 900,
      },
      colors: {
        primary: '#F24A4A',
        secondary: '#48256B',
        'primary-50': '#FF8181',
        'secondary-50': '#643890',
        'purple-white': '#DED1ED',
        'purple-80': '#231B2F',
        'blue-team': '#75a5dc',
        'red-team': '#fd757a',
      },
      keyframes: {
        'move-top-left': {
          '0%': {
            transform: 'translate(0, 0)',
          },
          '100%': {
            transform: 'translate(-10px, -10px) scale(1.05)',
          },
        },
        'move-top-right': {
          '0%': {
            transform: 'translate(-10px, 10px) scale(1.05)',
          },
          '100%': {
            transform: 'translate(0, 0)',
          },
        },
        'move-bottom-left': {
          '0%': {
            transform: 'translate(0, 0)',
          },
          '100%': {
            transform: 'translate(10px, -10px) scale(1.05)',
          },
        },
        'move-bottom-right': {
          '0%': {
            transform: 'translate(10px, 10px) scale(1.05)',
          },
          '100%': {
            transform: 'translate(0, 0)',
          },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '50%': { transform: 'rotateY(540deg) scale(2) translateY(-100%)' },
          '100%': { transform: 'rotateY(1080deg) scale(1)' },
        },
      },
      animation: {
        'move-top-left':
          'move-top-left 2s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate',
        'move-top-right':
          'move-top-right 2s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate',
        'move-bottom-left':
          'move-bottom-left 2s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate',
        'move-bottom-right':
          'move-bottom-right 2s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate',
        flip: 'flip 1s ease-in-out',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.transform-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.rotate-y-180': {
          transform: 'rotateY(-180deg)',
        },
        '.rotate-y-0': {
          transform: 'rotateY(0deg)',
        },
      });
    },
  ],
};
