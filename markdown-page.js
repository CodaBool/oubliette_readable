import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const defaultMarkdownPath = fileURLToPath(
  new URL("./full_text.md", import.meta.url),
);

// HTML entry (by basename) -> markdown source. Anything unlisted uses full_text.md.
const markdownPaths = {
  "iframe.html": fileURLToPath(new URL("./iframe_text.md", import.meta.url)),
};

const watchedPaths = [defaultMarkdownPath, ...Object.values(markdownPaths)];

function markdownPathFor(filename) {
  const basename = filename.split(/[\\/]/).pop();
  return markdownPaths[basename] || defaultMarkdownPath;
}

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

export default function markdownPage() {
  return {
    name: "crown-end-markdown-page",

    buildStart() {
      for (const path of watchedPaths) this.addWatchFile(path);
    },

    configureServer(server) {
      server.watcher.add(watchedPaths);
      server.watcher.on("change", (changedPath) => {
        if (watchedPaths.includes(changedPath)) {
          server.ws.send({ type: "full-reload" });
        }
      });
    },

    transformIndexHtml: {
      order: "pre",
      async handler(html, context) {
        const source = await readFile(markdownPathFor(context.filename), "utf8");
        const { content, data } = matter(source);
        const title = escapeHtml(data.title || "");

        return html
          .replace("<!-- PAGE_TITLE -->", title)
          .replace("<!-- MARKDOWN_CONTENT -->", markdown.render(content));
      },
    },
  };
}
