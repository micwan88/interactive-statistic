import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project is served from https://micwan88.github.io/interactive-statistic/
// so assets must be referenced under that base path on GitHub Pages.
export default defineConfig({
  base: "/interactive-statistic/",
  plugins: [react()],
});
