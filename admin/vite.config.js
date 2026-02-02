// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import postcssNesting from "postcss-nesting";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        postcssNesting(), // ✅ correct ESM import
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
});
