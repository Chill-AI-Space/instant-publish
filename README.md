# instant-publish

Turn any document into a shareable link on [chillai.space](https://chillai.space).

Your AI generates a report, a page, a document — `instant-publish` gives it a permanent URL in one command. No hosting setup, no deploy pipeline. Just a link.

## Supported formats

| Format | Browser | AI access (`?raw`) |
|--------|---------|-------------------|
| `.md` / `.markdown` | Rendered as clean HTML with GitHub-style typography | Raw markdown |
| `.txt` | Monospace text | Raw text |
| `.html` | Served as-is | — |

**Markdown is the recommended format** for text-heavy content. AI agents can access the raw source instantly via `?raw` — no HTML parsing needed.

## Setup

```bash
npx instant-publish init
```

This does three things:
1. Generates your API key
2. Registers it with `chillai.space`
3. Adds instructions to Claude Code so it knows how to publish automatically

## Usage

```bash
# Publish markdown (recommended)
npx instant-publish deploy report.md --slug quarterly-report
# → Published: https://chillai.space/p/quarterly-report?password=A1b2C3dE
# → Raw (for AI): https://chillai.space/p/quarterly-report?password=A1b2C3dE&raw

# Publish HTML (self-contained, inline CSS)
npx instant-publish deploy page.html --slug landing-page

# Publish plain text
npx instant-publish deploy notes.txt --slug meeting-notes

# Republish (preserves password)
npx instant-publish deploy report-v2.md --slug quarterly-report --password A1b2C3dE

# List your pages
npx instant-publish list

# Delete a page
npx instant-publish delete quarterly-report

# Open portal — admin dashboard to browse, preview, and manage all your pages
npx instant-publish portal
```

## Raw access for AI agents

When you publish `.md` or `.txt` files, the raw source is stored alongside the rendered HTML. AI agents can read it by appending `&raw` to the URL:

```
https://chillai.space/p/my-doc?password=xxx&raw
```

This returns plain `text/markdown` or `text/plain` — no HTML wrapper, no parsing needed. Content negotiation also works: requests with `Accept: text/markdown` or `Accept: text/plain` headers get raw source automatically.

## How it works

- Content is stored on Cloudflare R2 (edge-cached globally)
- Pages are password-protected by default (SHA-256 hashed)
- Markdown is rendered to HTML at deploy time (via `marked`), raw source stored separately
- Republishing preserves the password — existing links keep working
- Pages are served at `https://chillai.space/p/<slug>`
- **Portal** at `https://chillai.space/portal?key=YOUR_API_KEY` — admin dashboard to browse, preview, and manage all your published pages
- API key lives in `~/.config/instant-publish/config.json`
- No database, no accounts — just a key and your content

## Why not PDF?

PDF takes 12 seconds to generate. HTML takes 0.4 seconds. PDF needs a viewer. HTML needs a browser you already have open. PDF is an email attachment. HTML is a link.

[Read the full investigation](https://chillai.space/p/death-to-pdf)

## License

MIT
