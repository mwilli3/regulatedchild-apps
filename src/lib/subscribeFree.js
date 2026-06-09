// Shared Klaviyo subscription helper for the free TRC apps' branded gates.
// Each app's built-in <Gate> calls subscribeFree() on submit; on a successful
// subscribe it persists locally so returning visitors skip the gate.
//
// Returns: { ok: true }
//        | { ok: false, notLive: true, message }
//        | { ok: false, message }

const STORAGE_KEY = (app) => `trc-subscribed-${app}`;

export const getSubscribed = (app) => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY(app)) || "null"); } catch { return null; }
};

export const isSubscribed = (app) => !!getSubscribed(app);

export async function subscribeFree({ app, name, email }) {
  try {
    const r = await fetch("/.netlify/functions/klaviyo-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app, name, email }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.ok) {
      try { localStorage.setItem(STORAGE_KEY(app), JSON.stringify({ name, email, ts: Date.now() })); } catch {}
      return { ok: true };
    }
    if (d.notLive) return { ok: false, notLive: true, message: d.message || "This tool isn't live yet." };
    return { ok: false, message: d.message || "Sign-up couldn't complete. Please try again." };
  } catch {
    return { ok: false, message: "Network error. Please try again." };
  }
}
