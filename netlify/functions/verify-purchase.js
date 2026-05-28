// Verifies a Shopify purchase for the TRC paid apps (/decoder, /scripts).
// The apps POST { email, product } where product is "workbook"|"decoder" or
// "research"|"scripts". Returns { verified: boolean, message? }.
//
// Env (Netlify, TRC site):
//   SHOPIFY_STORE_DOMAIN     e.g. theregulatedchild.myshopify.com
//   SHOPIFY_ACCESS_TOKEN     Admin API token with read_orders (TRC store)
//   DECODER_PRODUCT_TITLE    exact Shopify product title for the Workbook
//   SCRIPTS_PRODUCT_TITLE    exact Shopify product title for the Scripts Pack

const ALLOW_ORIGIN = "https://apps.regulatedchild.com";
const API_VERSION = "2024-10";

const cors = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function productTitleFor(product) {
  const p = String(product || "").toLowerCase();
  if (p === "decoder" || p === "workbook") return process.env.DECODER_PRODUCT_TITLE;
  if (p === "scripts" || p === "research") return process.env.SCRIPTS_PRODUCT_TITLE;
  return null;
}

const json = (statusCode, body) => ({ statusCode, headers: cors, body: JSON.stringify(body) });

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

  const wantedTitle = productTitleFor(product);
  if (!wantedTitle) return json(400, { verified: false, message: "Unknown product. Check DECODER_PRODUCT_TITLE / SCRIPTS_PRODUCT_TITLE env vars." });

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!domain || !token) return json(500, { verified: false, message: "Purchase verification is not configured." });

  try {
    const url = `https://${domain}/admin/api/${API_VERSION}/orders.json` +
      `?email=${encodeURIComponent(email)}&status=any&financial_status=paid&fields=id,email,financial_status,line_items&limit=250`;
    const r = await fetch(url, { headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" } });
    if (!r.ok) return json(502, { verified: false, message: "Could not reach the store. Please try again." });

    const data = await r.json();
    const orders = Array.isArray(data.orders) ? data.orders : [];
    const want = wantedTitle.trim().toLowerCase();

    const verified = orders.some((o) =>
      ["paid", "partially_paid", "partially_refunded"].includes(o.financial_status) &&
      (o.line_items || []).some((li) => (li.title || "").trim().toLowerCase().includes(want))
    );

    return json(200, verified
      ? { verified: true }
      : { verified: false, message: "No matching purchase found for this email." });
  } catch {
    return json(502, { verified: false, message: "Verification error. Please try again." });
  }
};
