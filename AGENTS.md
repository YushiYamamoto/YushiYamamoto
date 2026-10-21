# AGENTS.md

## Cursor Cloud specific instructions

### What this repository is

This is a **GitHub profile README repository** (the special `YushiYamamoto/YushiYamamoto` repo whose `README.md` renders on the GitHub profile page). It is **not a runnable application** and has **no build system, package manager, dependencies, tests, lint config, or services**.

Tracked contents:
- `README.md` — the profile page (GitHub-Flavored Markdown + HTML tables, mostly Japanese). Uses external image services (shields.io, github-readme-stats, skillicons.dev, capsule-render, readme-typing-svg, streak-stats, quotes-github-readme).
- `assets/` — static blog "eyecatch" thumbnail images (PNG/JPG) referenced by external Qiita articles.

### Setup / build / test / lint / run

- **Install / build / test / lint:** none exist. There is nothing to install (no `package.json`, `requirements.txt`, etc.) and no tests or linters. The startup update script is intentionally a no-op.
- **"Running" the product:** the product is the rendered profile page. GitHub renders `README.md` in production; there is no local server to run for real.

### Previewing the README locally (optional, not a project dependency)

To visually verify `README.md` the way GitHub renders it (tables, HTML, GFM styling), use `grip`, which proxies GitHub's markdown API. This is a preview convenience only — do NOT add it to the update script.

```bash
pip3 install --user --break-system-packages grip
~/.local/bin/grip README.md 0.0.0.0:6419
# then open http://127.0.0.1:6419/
```

Notes / gotchas:
- Rendering requires network access to `api.github.com` (and the external badge/image hosts for images to appear). Anonymous GitHub API calls are rate-limited; a single preview render is fine.
- The many `img.shields.io` / `skillicons.dev` / `*.vercel.app` badges are **decorative external services**, not project dependencies.
