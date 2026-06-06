import type { Config } from "tailwindcss";
import { palette, fonts } from "./src/style/theme";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Centralised design tokens — see src/style/theme.ts
      colors: palette,
      fontFamily: {
        sans: fonts.sans,
        mono: fonts.mono,
        display: fonts.display,
      },
    },
  },
  plugins: [],
} satisfies Config;
