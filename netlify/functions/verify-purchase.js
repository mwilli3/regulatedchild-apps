// Verifies a Shopify purchase for the TRC paid apps (/decoder, /scripts).
// Checks three sources, in order:
//   1. Netlify Blobs "purchases" store — populated by shopify-order-webhook
//      on every paid order from Shopify.
//   2. purchases-backfill.json — past orders seeded once via MCP.
//   3. ALLOWED_EMAILS env var — manual override (comma-separated).
//
// No Shopify Admin API call at runtime. Auth-free, fast, no token mess.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getStore } from "@netlify/blobs";

let backfill = { emails: {} };
try {
  const here = dirname(fileURLToPath(import.meta.url));
  backfill = JSON.parse(readFileSync(join(here, "purchases-backfill.json"), "utf8"));
} catch {
  // Missing file is fine -> Blobs + env override still work.
}

const ALLOW_ORIGIN = "https://apps.regulatedchild.com";

const cors = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (statusCode, body) => ({ statusCode, headers: cors, body: JSON.stringify(body) });

function productKey(input) {
  const p = String(input || "").toLowerCase();
  if (p === "decoder" || p === "workbook") return "workbook";
  if (p === "scripts" || p === "research") return "scripts";
  return null;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return json(405, { verified: false, message: "Method not allowed" });

  let email, product;
  try {
    ({ email, product } = JSON.parse(event.body || "{}"));
  } catch {
    return json(400, { verified: false, message: "Invalid request body." });
  }

  email = (email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return json(400, { verified: false, message: "Enter a valid email." });

  const wanted = productKey(product);
  if (!wanted) return json(400, { verified: false, message: "Unknown product." });

  // 1. Live webhook allowlist (Netlify Blobs).
  try {
    const rec = await getStore("purchases").get(email, { type: "json" });
    if (rec?.products?.includes(wanted)) return json(200, { verified: true });
  } catch {
    // Blobs not configured yet -> fall through.
  }

  // 2. Backfilled past orders.
  const seeded = backfill?.emails?.[email];
  if (Array.isArray(seeded) && seeded.includes(wanted)) return json(200, { verified: true });

  // 3. Manual env-var override.
  const allowed = (process.env.ALLOWED_EMAILS || "")
    .toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(email)) return json(200, { verified: true });

  return json(200, { verified: false, message: "No matching purchase found for this email." });
};
