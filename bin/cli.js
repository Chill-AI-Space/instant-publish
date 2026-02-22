#!/usr/bin/env node

import { program } from "commander";
import {
  readFileSync,
  mkdirSync,
  writeFileSync,
  appendFileSync,
  existsSync,
} from "fs";
import { join } from "path";
import { homedir } from "os";
import { randomBytes } from "crypto";

const API_BASE = "https://chillai.space/api";
const CONFIG_DIR = join(homedir(), ".config", "instant-publish");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

const CLAUDE_INSTRUCTIONS = `
## instant-publish

When the user asks to create an HTML page, report, or document that should be shareable — publish it using instant-publish.

\`\`\`bash
# Deploy an HTML file and get a public link
npx instant-publish deploy <file.html> --slug <name>

# List published pages
npx instant-publish list

# Delete a published page
npx instant-publish delete <slug>
\`\`\`

- Published pages are available at \`https://chillai.space/p/<slug>\`
- API key is stored in \`~/.config/instant-publish/config.json\`
- Always use \`--slug\` with a readable name derived from the content
- After publishing, show the user the URL
`;

function loadConfig() {
  if (!existsSync(CONFIG_FILE)) return null;
  return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
}

function saveConfig(config) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

function getApiKey() {
  const config = loadConfig();
  if (!config?.api_key) {
    console.error("Not initialized. Run: instant-publish init");
    process.exit(1);
  }
  return config.api_key;
}

function addClaudeInstructions() {
  const claudeDir = join(homedir(), ".claude");
  const claudeMd = join(claudeDir, "CLAUDE.md");

  if (existsSync(claudeMd)) {
    const content = readFileSync(claudeMd, "utf-8");
    if (content.includes("instant-publish")) {
      return false;
    }
    appendFileSync(claudeMd, "\n" + CLAUDE_INSTRUCTIONS);
  } else {
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(claudeMd, CLAUDE_INSTRUCTIONS.trimStart());
  }
  return true;
}

program
  .name("instant-publish")
  .description("Turn any document into a shareable link on chillai.space")
  .version("1.0.0");

program
  .command("init")
  .description("Generate an API key, register with the server, and configure Claude Code")
  .action(async () => {
    const existing = loadConfig();
    if (existing?.api_key) {
      console.log("Already initialized.");
      console.log(`Config: ${CONFIG_FILE}`);

      const added = addClaudeInstructions();
      if (added) {
        console.log("Added instructions to ~/.claude/CLAUDE.md");
      }
      return;
    }

    const apiKey = randomBytes(24).toString("base64url");

    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Registration failed:", err.error || res.statusText);
      process.exit(1);
    }

    saveConfig({ api_key: apiKey, server: API_BASE });
    console.log("Initialized successfully.");
    console.log(`Config saved to: ${CONFIG_FILE}`);

    const added = addClaudeInstructions();
    if (added) {
      console.log("Added instructions to ~/.claude/CLAUDE.md");
      console.log(
        "\nClaude Code will now automatically publish HTML documents via instant-publish."
      );
    }
  });

program
  .command("deploy <file>")
  .description("Upload an HTML file and get a shareable link")
  .option("--slug <slug>", "Custom slug for the URL")
  .option("--title <title>", "Page title")
  .action(async (file, opts) => {
    const apiKey = getApiKey();

    if (!existsSync(file)) {
      console.error(`File not found: ${file}`);
      process.exit(1);
    }

    const content = readFileSync(file, "utf-8");

    const body = { content };
    if (opts.slug) body.slug = opts.slug;
    if (opts.title) body.title = opts.title;

    const res = await fetch(`${API_BASE}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Deploy failed:", err.error || res.statusText);
      process.exit(1);
    }

    const data = await res.json();
    console.log(`Published: ${data.url}`);
  });

program
  .command("list")
  .description("List all published pages")
  .action(async () => {
    const apiKey = getApiKey();

    const res = await fetch(`${API_BASE}/pages`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Failed:", err.error || res.statusText);
      process.exit(1);
    }

    const data = await res.json();
    if (data.pages.length === 0) {
      console.log("No pages published yet.");
      return;
    }

    for (const page of data.pages) {
      console.log(`  ${page.slug}  ${page.title}  ${page.created}`);
    }
  });

program
  .command("delete <slug>")
  .description("Delete a published page")
  .action(async (slug) => {
    const apiKey = getApiKey();

    const res = await fetch(`${API_BASE}/publish`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ slug }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Delete failed:", err.error || res.statusText);
      process.exit(1);
    }

    console.log(`Deleted: ${slug}`);
  });

program.parse();
