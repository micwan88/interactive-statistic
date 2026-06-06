import { palette, fonts } from "./src/style/theme.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Centralised design tokens — see src/style/theme.js
      colors: palette,
      fontFamily: {
        sans: fonts.sans,
        mono: fonts.mono,
        display: fonts.display,
      },
    },
  },
  plugins: [],
};
