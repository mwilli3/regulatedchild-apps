import { useEffect, useState } from "react";

/* Shared email-capture gate for the FREE TRC apps.
 * On mount: GETs /.netlify/functions/klaviyo-subscribe?app=<id> to learn whether
 *   the per-app KLAVIYO_*_LIST_ID env var is set.
 *     - missing  -> "not live yet" state (no gate, no app)
 *     - present  -> show email gate
 * On submit: POSTs to the same function. On 200 ok:true -> unlock + persist
 * locally so returning visitors skip the gate. On any failure: show inline
 * error and stay on the gate (do NOT advance).
 *
 * Paid apps are NOT wrapped with this — they use their own PurchaseGate. */

const C = {
  text: "oklch(0.26 0.03 45)",
  muted: "oklch(0.50 0.02 55)",
  bg: "oklch(0.975 0.008 70)",
  surface: "oklch(0.995 0.004 75)",
  line: "oklch(0.90 0.01 60)",
  brand: "oklch(0.53 0.12 40)",
  brandTint: "oklch(0.945 0.035 42)",
};
const UI = "'Outfit', sans-serif";
const DISPLAY = "'Young Serif', serif";
const STORAGE_KEY = (app) => `trc-subscribed-${app}`;

const FontLink = () => (
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Outfit:wght@400;500;600;700&display=swap" />
);

export function FreeAppGate({ appId, appName, kicker, lede, cta, children }) {
  const [status, setStatus] = useState("checking"); // checking | gate | notLive | unlocked
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const ready = name.trim() && email.trim();

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY(appId))) { setStatus("unlocked"); return; }
    } catch {}
    (async () => {
      try {
        const r = await fetch(`/.netlify/functions/klaviyo-subscribe?app=${encodeURIComponent(appId)}`);
        const d = await r.json();
        setStatus(d.live ? "gate" : "notLive");
      } catch {
        setStatus("notLive");
      }
    })();
  }, [appId]);

  const submit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const r = await fetch("/.netlify/functions/klaviyo-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app: appId, name: name.trim(), email: email.trim() }),
      });
      const d = await r.json();
      if (d.ok) {
        try { localStorage.setItem(STORAGE_KEY(appId), JSON.stringify({ name: name.trim(), email: email.trim(), ts: Date.now() })); } catch {}
        setStatus("unlocked");
        return;
      }
      if (d.notLive) { setStatus("notLive"); return; }
      setError(d.message || "Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  if (status === "unlocked") return children;

  if (status === "checking") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, color: C.muted, fontSize: 13 }}>
        <FontLink />
        Loading…
      </div>
    );
  }

  if (status === "notLive") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <FontLink />
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand, marginBottom: 14 }}>The Regulated Child</span>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(28px, 7vw, 38px)", lineHeight: 1.1, letterSpacing: "-0.01em", margin: "0 0 12px" }}>{appName}</h1>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.55, margin: 0 }}>This tool isn't live yet. Check back soon.</p>
          <p style={{ marginTop: 24, fontSize: 13 }}>
            <a href="/" style={{ color: C.brand, fontWeight: 600, textDecoration: "none" }}>← Back to all apps</a>
          </p>
        </div>
      </div>
    );
  }

  // status === "gate"
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "clamp(40px, 12vw, 72px) 24px 48px" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand, marginBottom: 18 }}>{kicker || "Free tool"}</span>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(32px, 9vw, 46px)", lineHeight: 1.05, letterSpacing: "-0.01em", margin: "0 0 14px" }}>{appName}</h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6, margin: "0 0 32px", maxWidth: "34ch" }}>{lede || "Enter your email to get instant access. We'll also send you a copy."}</p>

        <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", color: C.muted, display: "block", marginBottom: 4 }}>Your name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ready && submit()}
          placeholder="First name"
          onFocus={(e) => (e.target.style.borderColor = C.brand)}
          onBlur={(e) => (e.target.style.borderColor = C.line)}
          style={{ width: "100%", padding: "13px 0", border: "none", borderBottom: `1.5px solid ${C.line}`, fontSize: 16, fontFamily: UI, color: C.text, background: "transparent", outline: "none", marginBottom: 22, boxSizing: "border-box", transition: "border-color .3s" }}
        />

        <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", color: C.muted, display: "block", marginBottom: 4 }}>Email address</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ready && submit()}
          placeholder="your@email.com"
          onFocus={(e) => (e.target.style.borderColor = C.brand)}
          onBlur={(e) => (e.target.style.borderColor = C.line)}
          style={{ width: "100%", padding: "13px 0", border: "none", borderBottom: `1.5px solid ${C.line}`, fontSize: 16, fontFamily: UI, color: C.text, background: "transparent", outline: "none", marginBottom: 26, boxSizing: "border-box", transition: "border-color .3s" }}
        />

        <button onClick={submit} disabled={!ready || submitting}
          style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600, fontFamily: UI, cursor: ready && !submitting ? "pointer" : "default", background: ready && !submitting ? C.brand : C.line, color: ready && !submitting ? "white" : C.muted, letterSpacing: ".01em" }}
        >
          {submitting ? "Sending…" : (cta || "Get instant access")}
        </button>

        {error && (
          <div style={{ marginTop: 18, background: C.brandTint, borderRadius: 12, padding: "12px 14px" }}>
            <p style={{ fontSize: 13, color: C.brand, lineHeight: 1.5, margin: 0 }}>{error}</p>
          </div>
        )}

        <p style={{ marginTop: 22, fontSize: 12, color: C.muted, lineHeight: 1.55 }}>
          By submitting, you agree to receive emails from The Regulated Child. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
