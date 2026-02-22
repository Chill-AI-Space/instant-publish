# instant-publish

Turn any HTML document into a shareable link on [chillai.space](https://chillai.space).

Your AI generates a report, a page, a document — `instant-publish` gives it a permanent URL in one command. No hosting setup, no deploy pipeline. Just a link.

## Setup

```bash
npx instant-publish init
```

This does three things:
1. Generates your API key
2. Registers it with `chillai.space`
3. Adds instructions to Claude Code so it knows how to publish automatically

After this, when you ask Claude Code to create an HTML document, it will publish it via instant-publish and give you the link.

## Usage

```bash
# Publish a file
npx instant-publish deploy report.html --slug my-report
# → Published: https://chillai.space/p/my-report

# List your pages
npx instant-publish list

# Delete a page
npx instant-publish delete my-report
```

## How it works

- HTML is stored on Cloudflare R2 (edge-cached globally)
- Pages are served at `https://chillai.space/p/<slug>`
- API key lives in `~/.config/instant-publish/config.json`
- No database, no accounts — just a key and your content

## Why not PDF?

PDF takes 12 seconds to generate. HTML takes 0.4 seconds. PDF needs a viewer. HTML needs a browser you already have open. PDF is an email attachment. HTML is a link.

[Read the full investigation](https://chillai.space/p/death-to-pdf)

## License

MIT
