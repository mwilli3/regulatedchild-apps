// Data-subject erasure (GDPR/CCPA "right to deletion") for the TRC paid apps.
// Operator-run, NOT a public self-serve endpoint: a public delete-by-email with
// no auth would let anyone wipe a buyer's access, so an admin bearer token is
// required.
//
// Removes the email from the Netlify Blobs "purchases" allowlist (independent of
// the verify-purchase read path, so the order-confirmation chain keeps working
// for everyone else) and best-effort queues a Klaviyo profile deletion.
//
// Usage:
//   curl -X POST https://apps.regulatedchild.com/.netlify/functions/delete-purchase \
//     -H "Authorization: Bearer $ADMIN_DELETE_TOKEN" \
//     -H "Content-Type: application/json" \
//     -d '{"email":"buyer@example.com"}'
//
// Env (Netlify, TRC site):
//   ADMIN_DELETE_TOKEN        required — long random secret, operator-held.
//   KLAVIYO_PRIVATE_API_KEY   optional — also queues Klaviyo profile deletion.

import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const json = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

// Constant-time bearer-token check (length-guarded so timingSafeEqual won't throw).
function tokenOk(sent, expected) {
  if (!sent || !expected) return false;
  const a = Buffer.from(sent);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Klaviyo's GDPR deletion endpoint queues full erasure by email — no id lookup.
async function deleteKlaviyoProfile(email) {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey) return "skipped (no key)";
  try {
    const r = await fetch("https://a.klaviyo.com/api/data-privacy-deletion-jobs/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${apiKey}`,
        "revision": "2024-10-15",
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        data: {
          type: "data-privacy-deletion-job",
          attributes: { profile: { data: { type: "profile", attributes: { email } } } },
        },
      }),
    });
    return r.status >= 200 && r.status < 300 ? "queued" : `error ${r.status}`;
  } catch {
    return "network error";
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { ok: false, message: "Method not allowed" });

  const expected = process.env.ADMIN_DELETE_TOKEN;
  if (!expected) return json(500, { ok: false, message: "Deletion endpoint not configured." });

  const auth = event.headers["authorization"] || event.headers["Authorization"] || "";
  const sent = auth.replace(/^Bearer\s+/i, "");
  if (!tokenOk(sent, expected)) return json(401, { ok: false, message: "Unauthorized." });

  let email;
  try { ({ email } = JSON.parse(event.body || "{}")); }
  catch { return json(400, { ok: false, message: "Invalid request body." }); }

  email = (email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return json(400, { ok: false, message: "Enter a valid email." });

  // Blobs delete is idempotent — a missing key is still a successful erasure.
  let purchases = "not configured";
  try {
    await getStore("purchases").delete(email);
    purchases = "deleted";
  } catch {
    purchases = "error";
  }

  const klaviyo = await deleteKlaviyoProfile(email);

  return json(200, { ok: true, email, purchases, klaviyo });
};
