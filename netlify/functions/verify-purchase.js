// Verifies a Shopify purchase for the TRC paid apps (/decoder, /scripts).
// The apps POST { email, product } where product is "workbook"|"decoder" or
// "research"|"scripts". Returns { verified: boolean, message? }.
//
// Env (Netlify, TRC site):
//   SHOPIFY_STORE_DOMAIN     e.g. the-regulated-child.myshopify.com
//   SHOPIFY_ACCESS_TOKEN     Admin API token with read_orders (optional)
//   DECODER_PRODUCT_TITLE    exact Shopify product title for the Workbook
//   SCRIPTS_PRODUCT_TITLE    exact Shopify product title for the Scripts Pack
//   ALLOWED_EMAILS           comma-separated emails that bypass Shopify check

const ALLOW_ORIGIN = "https://apps.regulatedchild.com";
const API_VERSION = "2026-04";

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
  if (!wantedTitle) return json(400, { verified: false, message: "Unknown product." });

  // Manual allowlist bypass — covers purchasers until Shopify Admin API auth is wired up.
  const allowed = (process.env.ALLOWED_EMAILS || "")
    .toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(email)) return json(200, { verified: true });

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!domain || !token) return json(200, { verified: false, message: "No matching purchase found for this email." });

  try {
    const gql = `
      query OrdersByEmail($q: String!) {
        orders(first: 50, query: $q, sortKey: PROCESSED_AT, reverse: true) {
          edges { node {
            id email displayFinancialStatus
            lineItems(first: 50) { edges { node { title } } }
          } }
        }
      }`;
    const r = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ query: gql, variables: { q: `email:${email}` } }),
    });
    if (!r.ok) return json(200, { verified: false, message: "No matching purchase found for this email." });

    const data = await r.json();
    const orders = data?.data?.orders?.edges?.map((e) => e.node) || [];
    const want = wantedTitle.trim().toLowerCase();
    const PAID = new Set(["PAID", "PARTIALLY_PAID", "PARTIALLY_REFUNDED"]);

    const verified = orders.some((o) =>
      PAID.has(o.displayFinancialStatus) &&
      (o.lineItems?.edges || []).some((li) => (li.node.title || "").trim().toLowerCase().includes(want))
    );

    return json(200, verified
      ? { verified: true }
      : { verified: false, message: "No matching purchase found for this email." });
  } catch {
    return json(200, { verified: false, message: "No matching purchase found for this email." });
  }
};
