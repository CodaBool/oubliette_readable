import { defineConfig } from "vite";
import markdownPage from "./markdown-page.js";

export default defineConfig({
  base: "./",
  plugins: [markdownPage()],
});
