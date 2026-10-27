import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import markdownPage from "./markdown-page.js";

export default defineConfig({
  base: "./",
  plugins: [markdownPage()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        iframe: fileURLToPath(new URL("./iframe.html", import.meta.url)),
      },
    },
  },
});
