#!/usr/bin/env node
/**
 * Validates that OPENAI_API_KEY is set in .env.local.
 * Run: node scripts/check-env.js
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found. Copy .env.example to .env.local and add your OPENAI_API_KEY.");
  process.exit(1);
}
const content = fs.readFileSync(envPath, "utf8");
const match = content.match(/OPENAI_API_KEY\s*=\s*(.+)/m);
const key = match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
if (!key || key === "sk-..." || key.startsWith("sk-your")) {
  console.error("❌ OPENAI_API_KEY not set in .env.local. Add your key from https://platform.openai.com/api-keys");
  process.exit(1);
}
console.log("✓ OPENAI_API_KEY is set");
process.exit(0);
