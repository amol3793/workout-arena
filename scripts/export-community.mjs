#!/usr/bin/env node
/**
 * Export feedback + active marketing subscribers to Excel-compatible CSV files.
 * Usage: node scripts/export-community.mjs [output-directory]
 * Defaults to ./exports. Reads DATABASE_URL.
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const outDir = resolve(process.argv[2] || "exports");
mkdirSync(outDir, { recursive: true });

const csv = (rows) => {
  if (!rows.length) return "";
  const columns = Object.keys(rows[0]);
  const escape = (value) => {
    if (value == null) return "";
    const text = value instanceof Date ? value.toISOString() : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [columns.join(","), ...rows.map((row) => columns.map((c) => escape(row[c])).join(","))].join("\n") + "\n";
};

const pool = new Pool({ connectionString: url });
try {
  const feedback = await pool.query(`
    select id, type, name, email, message, page_path, status, created_at
    from feedback_submissions order by created_at desc
  `);
  const subscribers = await pool.query(`
    select id, email, consent, consent_text, source, status, created_at, updated_at
    from marketing_subscribers where status = 'subscribed' and consent = true
    order by updated_at desc
  `);
  writeFileSync(resolve(outDir, "feedback.csv"), csv(feedback.rows));
  writeFileSync(resolve(outDir, "subscribers.csv"), csv(subscribers.rows));
  console.log(`Exported ${feedback.rowCount} feedback rows and ${subscribers.rowCount} subscribers to ${outDir}`);
} finally {
  await pool.end();
}
