#!/usr/bin/env node
// Minimal, dependency-light preview server for the GitHub profile README.
// Renders README.md the way GitHub roughly would (github-markdown-css + raw
// HTML pass-through) and serves the local assets/ directory so eyecatch
// images can be previewed without pushing to GitHub.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

import MarkdownIt from "markdown-it";

const require = createRequire(import.meta.url);
const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]+$/, "");
const PORT = Number(process.env.PORT) || 4321;
const HOST = process.env.HOST || "0.0.0.0";

const md = new MarkdownIt({ html: true, linkify: true, breaks: false });

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".css": "text/css; charset=utf-8",
  ".ico": "image/x-icon",
};

async function renderReadme() {
  const source = await readFile(join(ROOT, "README.md"), "utf8");
  const body = md.render(source);
  const cssPath = require.resolve("github-markdown-css/github-markdown-dark.css");
  const css = await readFile(cssPath, "utf8");
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>README preview — YushiYamamoto</title>
  <style>${css}</style>
  <style>
    body { margin: 0; background: #0d1117; }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
  </style>
</head>
<body>
  <article class="markdown-body">${body}</article>
</body>
</html>`;
}

// Prevent path traversal outside of the repo root when serving static files.
function safeJoin(base, target) {
  const resolved = normalize(join(base, target));
  if (resolved !== base && !resolved.startsWith(base + sep)) return null;
  return resolved;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/" || pathname === "/index.html") {
      const html = await renderReadme();
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    if (pathname === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
      return;
    }

    const filePath = safeJoin(ROOT, "." + pathname);
    if (!filePath) {
      res.writeHead(400).end("Bad request");
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, { "content-type": MIME[extname(filePath).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
      return;
    }
    res.writeHead(500, { "content-type": "text/plain" }).end("Server error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`README preview running at http://${HOST}:${PORT}/ (assets under /assets)`);
});
