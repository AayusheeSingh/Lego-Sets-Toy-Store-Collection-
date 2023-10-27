/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./*.html`], // all .html files
  daisyui: {
    themes: ['fantasy'],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

