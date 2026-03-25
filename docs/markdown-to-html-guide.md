# Markdown → HTML: How to Get Clean, Professional Output

A practical guide to converting Markdown into well-rendered HTML — without broken tables, ugly code blocks, or mangled Cyrillic text.

## The Problem

You ask an AI agent (or a script) to turn a `.md` file into HTML. What you get:

- Bare HTML with no styling — looks like 1997
- Tables that overflow on mobile
- Code blocks with no syntax distinction
- Cyrillic/CJK text that breaks or displays wrong
- Headings that all look the same size
- No spacing, no rhythm, no readability

This guide covers how to fix all of that.

---

## Quick Fix: Use instant-publish

If you just need to turn a Markdown file into a shareable link with good styling — skip the manual work:

```bash
npx instant-publish deploy report.md --slug my-report
# → https://chillai.space/p/my-report?password=xxx
```

This renders your Markdown with a professional template, print-ready CSS, and a one-click PDF button. Done in 0.4 seconds.

For AI agents (Claude Code, etc.) — the raw Markdown is accessible at `?raw` for machine reading.

---

## Doing It Yourself: Step by Step

### 1. Choose a Markdown parser

| Parser | Language | Pros | Cons |
|--------|----------|------|------|
| **marked** | JS | Fast, zero deps, GFM support | No plugins |
| **markdown-it** | JS | Pluggable, extensible | Heavier |
| **remark/unified** | JS | AST-based, very flexible | Complex API |
| **pandoc** | Haskell (CLI) | Handles everything | Heavy binary |
| **Python-Markdown** | Python | Mature, extensible | Slower |

**Recommendation**: `marked` for simple docs, `markdown-it` if you need plugins (footnotes, emoji, etc.).

### 2. Enable GFM (GitHub Flavored Markdown)

Most content uses GFM features — tables, task lists, strikethrough. Make sure your parser handles them.

```js
import { marked } from 'marked';

// marked has GFM enabled by default since v5
const html = marked.parse(markdownSource);
```

### 3. Wrap in a proper HTML document

Never serve raw HTML fragments. Always wrap in a full document:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Title</title>
  <style>/* ... */</style>
</head>
<body>
  <article>
    ${renderedHtml}
  </article>
</body>
</html>
```

Key points:
- `charset="utf-8"` — required for Cyrillic, CJK, emoji
- `viewport` meta — required for mobile
- Wrap content in `<article>` — semantic, easier to style, better for print
- Inline all CSS — no external stylesheets for self-contained documents

### 4. The CSS That Actually Matters

Here's a minimal but complete stylesheet. Every rule is here for a reason.

```css
/* Reset — browsers have different defaults */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

/* Base typography */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, sans-serif;
  line-height: 1.7;           /* 1.5 is tight, 1.7 is comfortable */
  color: #24292f;              /* not pure black — easier on the eyes */
  max-width: 820px;            /* readable line length */
  margin: 0 auto;
  padding: 48px 32px 80px;
  -webkit-font-smoothing: antialiased;
}

/* Heading hierarchy — must be visually distinct */
h1 { font-size: 2.1em; border-bottom: 2px solid #e8e8e8; padding-bottom: 0.35em; margin-top: 0; }
h2 { font-size: 1.6em; border-bottom: 1px solid #eaecef; padding-bottom: 0.25em; }
h3 { font-size: 1.3em; }
h4 { font-size: 1.1em; }

h1, h2, h3, h4, h5, h6 {
  color: #1a1a2e;
  font-weight: 700;
  line-height: 1.3;
  margin-top: 1.8em;
  margin-bottom: 0.6em;
}

/* Paragraphs */
p { margin: 0 0 1.1em; }

/* Code — must look different from text */
code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  background: #f0f3f6;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.88em;
}

pre {
  background: #f6f8fa;
  border: 1px solid #d8dee4;
  border-radius: 8px;
  padding: 18px 20px;
  overflow-x: auto;            /* horizontal scroll, not overflow */
  margin: 0 0 1.2em;
}

pre code {
  background: none;            /* override inline code style */
  padding: 0;
  font-size: 0.85em;
}

/* Tables — the #1 source of rendering bugs */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 0 0 1.2em;
  font-size: 0.95em;
}

th, td {
  border: 1px solid #d8dee4;
  padding: 10px 14px;
  text-align: left;
  vertical-align: top;         /* prevents misalignment in multi-line cells */
}

th {
  background: #f0f3f6;
  font-weight: 600;
  white-space: nowrap;         /* header text shouldn't wrap */
}

tr:nth-child(even) { background: #f8f9fa; }

/* Blockquotes */
blockquote {
  border-left: 4px solid #d0d7de;
  padding: 0.5em 1em;
  color: #57606a;
  background: #f8f9fa;
  border-radius: 0 6px 6px 0;
  margin: 0 0 1.2em;
}

/* Lists */
ul, ol { padding-left: 2em; margin: 0 0 1.1em; }
li { margin: 0.3em 0; }

/* Images */
img { max-width: 100%; height: auto; border-radius: 8px; }

/* Horizontal rules */
hr { border: none; border-top: 2px solid #e8e8e8; margin: 2.5em 0; }

/* Links */
a { color: #0969da; text-decoration: none; }
a:hover { text-decoration: underline; }
```

### 5. Common Pitfalls

#### Tables display as `block` and lose structure

Some CSS resets set `table { display: block }` for responsive overflow. This breaks column alignment. Fix:

```css
table, thead, tbody { display: table; width: 100%; }
```

#### Inline code inside headings looks wrong

The heading font size applies but the code background looks huge:

```css
h1 code, h2 code, h3 code {
  font-size: 0.85em;  /* relative to the heading */
}
```

#### Long URLs in tables break layout

```css
td { word-break: break-word; }
```

#### Nested lists lose spacing

```css
li > ul, li > ol { margin-bottom: 0; }
```

#### Cyrillic bold text renders too heavy

System fonts handle this well, but if you use a custom font, ensure it has proper Cyrillic bold weight:

```css
strong { font-weight: 600; }  /* 600, not 700 — less aggressive */
```

---

## For AI Agents (Claude Code, Cursor, etc.)

If your AI generates Markdown and you want it published as clean HTML:

1. Write content as `.md` — it's faster and less error-prone than generating HTML
2. Use `npx instant-publish deploy file.md --slug name` to publish
3. The template handles typography, mobile, and print automatically
4. Raw Markdown is always accessible at `?raw` for other AI agents to read

This avoids the entire class of "AI-generated HTML looks broken" issues, because the Markdown-to-HTML conversion uses a tested, production template.

---

## See Also

- [Print-Ready HTML Guide](./print-ready-html-guide.md) — how to make HTML that converts to clean PDFs
- [instant-publish](https://github.com/Chill-AI-Space/instant-publish) — one-command Markdown publishing with all of the above built in
