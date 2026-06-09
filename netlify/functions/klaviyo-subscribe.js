// Klaviyo email-capture for the free TRC apps.
// One function, two methods:
//   GET  ?app=<id>           -> { live: boolean }      // is this app's list configured?
//   POST { app, email }      -> { ok: true } | { ok: false, notLive?, message }
//
// Per-app list routing — each app subscribes to its OWN Klaviyo list, read from
// a per-app env var. If the env var is unset, the app is "not live yet".
//
// Env (Netlify, TRC apps site):
//   KLAVIYO_PRIVATE_API_KEY   pk_... (private key, server-only, NEVER ship to client)
//   KLAVIYO_BODY_LIST_ID      list id for /body
//   KLAVIYO_DECODE_LIST_ID    list id for /decoder-free
//   KLAVIYO_SCRIPTS_LIST_ID   list id for /scripts-free
//   KLAVIYO_REGULATE_LIST_ID  list id for /coregulation
//   KLAVIYO_QUIZTRC_LIST_ID   list id for /quiz

const ALLOW_ORIGIN = "https://apps.regulatedchild.com";

const APP_LIST_ENV = {
  body: "KLAVIYO_BODY_LIST_ID",
  decode: "KLAVIYO_DECODE_LIST_ID",
  scripts: "KLAVIYO_SCRIPTS_LIST_ID",
  regulate: "KLAVIYO_REGULATE_LIST_ID",
  quiztrc: "KLAVIYO_QUIZTRC_LIST_ID",
};

const cors = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};
const json = (statusCode, body) => ({ statusCode, headers: cors, body: JSON.stringify(body) });

const listIdFor = (app) => {
  const key = APP_LIST_ENV[app];
  if (!key) return null;
  const v = process.env[key];
  return v && v.trim() ? v.trim() : null;
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };

  if (event.httpMethod === "GET") {
    const app = String(event.queryStringParameters?.app || "").toLowerCase();
    if (!APP_LIST_ENV[app]) return json(400, { live: false, message: "Unknown app." });
    return json(200, { live: !!listIdFor(app) });
  }

  if (event.httpMethod !== "POST") return json(405, { ok: false, message: "Method not allowed" });

  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch { return json(400, { ok: false, message: "Invalid request body." }); }

  const app = String(payload.app || "").toLowerCase();
  const email = String(payload.email || "").trim().toLowerCase();

  if (!APP_LIST_ENV[app]) return json(400, { ok: false, message: "Unknown app." });
  if (!email || !email.includes("@")) return json(400, { ok: false, message: "Enter a valid email." });

  const listId = listIdFor(app);
  if (!listId) return json(200, { ok: false, notLive: true, message: "This tool isn't live yet." });

  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey) return json(500, { ok: false, message: "Email signup is not configured." });

  try {
    const r = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
      method: "POST",
      headers: {
        "Authorization": `Klaviyo-API-Key ${apiKey}`,
        "revision": "2024-10-15",
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [{
                type: "profile",
                attributes: {
                  email,
                  subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                  properties: { source: "trc-apps", last_app: app },
                },
              }],
            },
            historical_import: false,
          },
          relationships: {
            list: { data: { type: "list", id: listId } },
          },
        },
      }),
    });

    if (r.status >= 200 && r.status < 300) return json(200, { ok: true });
    // Klaviyo error - keep details server-side, send a friendly message.
    return json(502, { ok: false, message: "Sign-up couldn't complete. Please try again." });
  } catch {
    return json(502, { ok: false, message: "Network error. Please try again." });
  }
};
