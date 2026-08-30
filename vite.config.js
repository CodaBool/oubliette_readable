import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { defineConfig } from "vite";

const markdownPath = fileURLToPath(new URL("./full_text.md", import.meta.url));

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
});

const defaultLinkRenderer =
  markdown.renderer.rules.link_open ||
  ((tokens, index, options, environment, renderer) =>
    renderer.renderToken(tokens, index, options));

markdown.renderer.rules.link_open = (
  tokens,
  index,
  options,
  environment,
  renderer,
) => {
  tokens[index].attrSet("target", "_blank");
  tokens[index].attrSet("rel", "noopener noreferrer");

  return defaultLinkRenderer(tokens, index, options, environment, renderer);
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markdownPage() {
  return {
    name: "crown-end-markdown-page",

    buildStart() {
      this.addWatchFile(markdownPath);
    },

    configureServer(server) {
      server.watcher.add(markdownPath);
      server.watcher.on("change", (changedPath) => {
        if (changedPath === markdownPath) {
          server.ws.send({ type: "full-reload" });
        }
      });
    },

    transformIndexHtml: {
      order: "pre",
      async handler(html) {
        const source = await readFile(markdownPath, "utf8");
        const { content, data } = matter(source);
        const title = escapeHtml(data.title || "");

        return html
          .replace("<!-- PAGE_TITLE -->", title)
          .replace("<!-- MARKDOWN_CONTENT -->", markdown.render(content));
      },
    },
  };
}

export default defineConfig({
  // Relative asset paths work at a custom domain and at /repository-name/.
  base: "./",
  plugins: [markdownPage()],
});
