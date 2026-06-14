// Receives Shopify "orders/paid" webhooks and records the buyer's email
// against the paid product(s) in Netlify Blobs. The /decoder and /scripts
// gates read from that allowlist via verify-purchase.
//
// Env (Netlify):
//   SHOPIFY_WEBHOOK_SECRET   secret shown when you create the webhook in
//                            Shopify admin → Settings → Notifications.
//
// Webhook setup:
//   1. Shopify admin → Settings → Notifications → Webhooks.
//   2. Create webhook: Event = "Order payment", Format = JSON, URL =
//      https://apps.regulatedchild.com/.netlify/functions/shopify-order-webhook
//   3. Copy the signing secret Shopify reveals -> Netlify env var
//      SHOPIFY_WEBHOOK_SECRET. Redeploy.

import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const PRODUCT_TAGS = {
  workbook: ["behavior decoder workbook"],
  scripts: ["scripts pack research", "research scripts pack"],
};

function classifyTitles(titles) {
  const owned = new Set();
  const lower = titles.map((t) => (t || "").trim().toLowerCase());
  for (const [tag, needles] of Object.entries(PRODUCT_TAGS)) {
    if (lower.some((t) => needles.some((n) => t.includes(n)))) owned.add(tag);
  }
  return [...owned];
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "" };

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return { statusCode: 500, body: "Webhook secret not configured." };

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64")
    : Buffer.from(event.body || "", "utf8");

  const sent = event.headers["x-shopify-hmac-sha256"] || event.headers["X-Shopify-Hmac-Sha256"];
  const computed = crypto.createHmac("sha256", secret).update(raw).digest("base64");
  const ok = sent && computed.length === sent.length &&
    crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(sent));
  if (!ok) return { statusCode: 401, body: "Invalid signature." };

  let order;
  try { order = JSON.parse(raw.toString("utf8")); }
  catch { return { statusCode: 400, body: "Invalid JSON." }; }

  const email = (order.email || order.contact_email || "").trim().toLowerCase();
  if (!email) return { statusCode: 200, body: "No email on order; ignored." };

  const status = String(order.financial_status || "").toLowerCase();
  if (!["paid", "partially_paid", "partially_refunded"].includes(status)) {
    return { statusCode: 200, body: `Ignored status=${status}.` };
  }

  const titles = (order.line_items || []).map((li) => li.title);
  const owned = classifyTitles(titles);
  if (owned.length === 0) return { statusCode: 200, body: "No gated product on order; ignored." };

  const store = getStore("purchases");
  const existing = (await store.get(email, { type: "json" })) || { products: [] };
  const merged = [...new Set([...(existing.products || []), ...owned])];
  await store.setJSON(email, { products: merged, updatedAt: Date.now() });

  return { statusCode: 200, body: `Recorded ${email} -> ${merged.join(",")}` };
};
