# Print-Ready HTML: How to Make Pages That Export to Clean PDFs

A practical guide to writing HTML and CSS that produces professional PDFs when printed from the browser — no Puppeteer, no wkhtmltopdf, no headless Chrome.

## Why Browser Print?

| Method | Speed | Quality | Setup |
|--------|-------|---------|-------|
| `Cmd+P` / `Ctrl+P` | Instant | Good | None |
| Puppeteer/Playwright | 2-5 sec | Good | Node + Chromium |
| wkhtmltopdf | 1-3 sec | Mediocre | Binary install |
| Prince XML | Fast | Excellent | $3,800 license |
| WeasyPrint | 2-4 sec | Good | Python + deps |

Browser print is free, instant, and available everywhere. The catch: your CSS must be print-aware or the result will be garbage.

This guide shows you how to write that CSS.

---

## Quick Fix: Use instant-publish

If you're generating reports/docs from Markdown and want PDF-ready output:

```bash
npx instant-publish deploy report.md --slug my-report
```

The published page has a **print** button. Click it → clean PDF. All the CSS in this guide is already built in.

---

## The Core Print Stylesheet

Add this to any HTML document to make it print-ready:

```css
@media print {
  /* === Page Setup === */
  @page {
    size: A4;                          /* or "letter" for US */
    margin: 20mm 18mm 25mm 18mm;       /* top right bottom left */
  }

  /* === Base === */
  html { font-size: 12pt; }           /* pt, not px — print uses points */

  body {
    max-width: none;                   /* use full page width */
    padding: 0;                        /* @page margin handles spacing */
    color: #000;                       /* pure black for print */
    background: #fff;                  /* no background colors */
    line-height: 1.6;
  }

  /* === Page Break Control — the most important part === */

  /* Never break INSIDE these elements */
  pre, blockquote, table, figure, img {
    break-inside: avoid;
    page-break-inside: avoid;          /* legacy fallback */
  }

  tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Never break AFTER headings (keep heading with its content) */
  h1, h2, h3, h4, h5, h6 {
    break-after: avoid;
    page-break-after: avoid;
  }

  /* Never break BEFORE the element right after a heading */
  h1 + *, h2 + *, h3 + *, h4 + * {
    break-before: avoid;
    page-break-before: avoid;
  }

  /* === Tables === */
  thead {
    display: table-header-group;       /* repeat header on every page */
  }

  /* === Links — show URLs in print === */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
    color: #666;
    word-break: break-all;
  }

  /* Don't show URL for anchors and mailto */
  a[href^="#"]::after,
  a[href^="mailto:"]::after {
    content: none;
  }

  /* === Code Blocks — wrap, don't scroll === */
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* === Clean backgrounds === */
  blockquote { background: none; }
  tr:nth-child(even) { background: none; }
  th { background: #f0f0f0; }
  code { background: #f0f0f0; }

  /* === Typography === */
  p {
    orphans: 3;                        /* min 3 lines at bottom of page */
    widows: 3;                         /* min 3 lines at top of page */
  }

  /* === Hide interactive elements === */
  button, .no-print, nav, .toolbar {
    display: none !important;
  }
}
```

### Adding a Print Button

```html
<button onclick="window.print()" class="print-btn">Print / Save PDF</button>
```

```css
.print-btn {
  position: fixed;
  top: 12px;
  right: 16px;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid #d8dee4;
  background: #f6f8fa;
  cursor: pointer;
}

@media print {
  .print-btn { display: none !important; }
}
```

---

## The 7 Things That Break PDFs

### 1. Page breaks split headings from content

**Problem**: A heading appears at the bottom of a page, its content starts on the next page.

**Fix**:
```css
h1, h2, h3, h4 {
  break-after: avoid;
}
```

### 2. Tables split mid-row

**Problem**: A table row is cut in half between pages — top half of text on one page, bottom on the next.

**Fix**:
```css
tr {
  break-inside: avoid;
}

/* For long tables, repeat the header */
thead {
  display: table-header-group;
}
```

**Limitation**: If a single row is taller than a page, the browser has no choice but to split it. Keep rows short.

### 3. Code blocks get cut off

**Problem**: A code block splits across pages, or worse — overflows horizontally (the scrollbar doesn't exist in PDF).

**Fix**:
```css
@media print {
  pre {
    break-inside: avoid;         /* don't split */
    white-space: pre-wrap;       /* wrap instead of scroll */
    word-wrap: break-word;
  }
}
```

**Limitation**: Very long code blocks (50+ lines) will still split. Consider breaking them into smaller blocks in your source.

### 4. Images overflow or get cropped

**Problem**: A large image extends beyond the page margin.

**Fix**:
```css
img {
  max-width: 100%;
  height: auto;
}

@media print {
  img {
    break-inside: avoid;
    max-width: 100% !important;
  }
}
```

### 5. Background colors disappear

**Problem**: Table headers, code blocks, blockquotes lose their background in print — by default, browsers don't print backgrounds.

**Two options**:

Option A — tell browsers to print backgrounds:
```css
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

Option B — use borders instead of backgrounds (more reliable):
```css
@media print {
  th { border-bottom: 2px solid #333; background: none; font-weight: 700; }
  code { border: 1px solid #ddd; background: none; }
}
```

**Recommendation**: Option B. Background printing is a user setting and can't be forced.

### 6. Links become useless in PDF

**Problem**: Blue "click here" text in a PDF — the reader can't click it and doesn't know the URL.

**Fix**:
```css
@media print {
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
    color: #666;
  }
}
```

**Be selective** — don't show URLs for internal anchors or mailto links:
```css
a[href^="#"]::after,
a[href^="mailto:"]::after {
  content: none;
}
```

### 7. Orphans and widows

**Problem**: A single line of a paragraph appears alone at the top or bottom of a page.

**Fix**:
```css
p {
  orphans: 3;    /* at least 3 lines at the bottom of a page */
  widows: 3;     /* at least 3 lines at the top of a page */
}
```

---

## Testing Your Print CSS

### In Chrome DevTools

1. Open DevTools (`Cmd+Opt+I`)
2. `Cmd+Shift+P` → type "rendering"→ select "Show Rendering"
3. Scroll to **Emulate CSS media type** → select **print**

This shows you the print layout live in the browser — no need to actually print.

### In Safari

1. Develop menu → "Enter Responsive Design Mode" won't help here
2. Instead: `Cmd+P` → PDF preview shows the actual print output

### Gotchas

- Chrome and Safari handle `break-inside: avoid` differently — always test both
- Firefox ignores `@page size` — it uses the system paper size
- `break-*` properties need the `page-break-*` fallback for older browsers
- The "Save as PDF" output in Chrome can differ slightly from actual printing

---

## Complete Template

Here's a minimal, self-contained HTML file that handles everything above:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Document Title</title>
  <style>
    /* Screen styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.7;
      color: #24292f;
      max-width: 820px;
      margin: 0 auto;
      padding: 48px 32px;
    }

    h1 { font-size: 2em; border-bottom: 2px solid #e8e8e8; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
    h1, h2, h3 { margin-top: 1.8em; margin-bottom: 0.6em; font-weight: 700; }

    table { border-collapse: collapse; width: 100%; margin: 0 0 1.2em; }
    th, td { border: 1px solid #d8dee4; padding: 10px 14px; text-align: left; }
    th { background: #f0f3f6; font-weight: 600; }

    pre { background: #f6f8fa; border: 1px solid #d8dee4; border-radius: 8px; padding: 16px; overflow-x: auto; }
    code { background: #f0f3f6; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.88em; }
    pre code { background: none; padding: 0; }

    blockquote { border-left: 4px solid #d0d7de; padding: 0.5em 1em; color: #57606a; background: #f8f9fa; margin: 0 0 1.2em; }

    img { max-width: 100%; height: auto; }

    .print-btn {
      position: fixed; top: 12px; right: 16px;
      padding: 5px 12px; border-radius: 6px;
      border: 1px solid #d8dee4; background: #f6f8fa;
      font-size: 12px; cursor: pointer;
    }

    /* Print styles */
    @media print {
      @page { size: A4; margin: 20mm 18mm 25mm 18mm; }
      html { font-size: 12pt; }
      body { max-width: none; padding: 0; color: #000; }
      .print-btn { display: none !important; }

      h1, h2, h3, h4 { break-after: avoid; }
      pre, blockquote, table, figure, img, tr { break-inside: avoid; }
      h1 + *, h2 + *, h3 + * { break-before: avoid; }
      thead { display: table-header-group; }

      pre { white-space: pre-wrap; word-wrap: break-word; }
      a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.85em; color: #666; }
      a[href^="#"]::after { content: none; }
      p { orphans: 3; widows: 3; }

      blockquote, tr:nth-child(even) { background: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Print</button>
  <article>
    <!-- Your content here -->
  </article>
</body>
</html>
```

---

## For AI Agents

If you're building an AI agent that generates documents:

1. **Prefer Markdown over HTML** — let a tested template handle the rendering
2. **Use `npx instant-publish deploy file.md`** — it applies all print-ready CSS automatically
3. **If you must generate HTML** — copy the template above and fill in the `<article>` content
4. **Never generate PDF directly** — it's slow (Puppeteer/Chrome) and the output is often worse than browser print

The published page has a **print** button. Users click it → get a clean PDF. No server-side rendering needed.

---

## See Also

- [Markdown → HTML Guide](./markdown-to-html-guide.md) — how to convert Markdown to well-styled HTML
- [instant-publish](https://github.com/Chill-AI-Space/instant-publish) — one-command publishing with print-ready templates built in
