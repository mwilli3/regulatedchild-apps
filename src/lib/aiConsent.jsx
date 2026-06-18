// First-click AI consent modal for the TRC paid apps — ports the LL pattern.
// Same UX and persistence model (localStorage consent key, runs the action on
// Continue, runs directly on subsequent clicks), adapted to TRC's plain inline-
// style modals (no framer-motion) and brand tokens.
//
// Usage in a host App:
//   const { request, Modal } = useAiConsent({ consentKey, appLabel, accent, ... });
//   return <AiConsentProvider value={request}> ...app... {Modal} </AiConsentProvider>;
//
// AI buttons (often nested several components deep) reach the gate via context:
//   const requestAi = useAiConsentRequest();
//   <button onClick={() => requestAi(async () => { /* the analyze call */ })}>…</button>

import { useState, useCallback, useEffect, createContext, useContext } from "react";

// Default fails open (runs the action) so a missing provider never blocks AI.
const AiConsentCtx = createContext((fn) => { if (typeof fn === "function") fn(); });

export const AiConsentProvider = AiConsentCtx.Provider;
export const useAiConsentRequest = () => useContext(AiConsentCtx);

export function useAiConsent({
  consentKey,
  appLabel,
  accent,
  surface,
  ink,
  muted,
  serif,
  sans,
  heading,
  paragraphs = [],
  privacyUrl = "/privacy",
}) {
  const [open, setOpen] = useState(false);
  const [pendingFn, setPendingFn] = useState(null);

  const hasConsent = () => {
    try { return !!localStorage.getItem(consentKey); } catch { return false; }
  };

  const request = useCallback((fn) => {
    if (typeof fn !== "function") return;
    if (hasConsent()) { fn(); return; }
    setPendingFn(() => fn);
    setOpen(true);
  }, [consentKey]);

  const handleContinue = () => {
    try { localStorage.setItem(consentKey, new Date().toISOString()); } catch {}
    const fn = pendingFn;
    setPendingFn(null);
    setOpen(false);
    if (fn) fn();
  };

  const handleCancel = () => {
    setPendingFn(null);
    setOpen(false);
  };

  // Esc to close + lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") handleCancel(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const Modal = !open ? null : (
    <div role="dialog" aria-modal="true" aria-label={`AI processing consent for ${appLabel}`}
      onClick={handleCancel}
      style={{ position: "fixed", inset: 0, zIndex: 1100, background: "oklch(0.26 0.03 45 / 0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: sans,
        backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", background: surface,
          borderRadius: 16, padding: "28px 28px 24px", boxShadow: "0 24px 60px oklch(0.26 0.03 45 / 0.28)",
          color: ink, textAlign: "left" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Privacy</div>
        <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 400, lineHeight: 1.2, marginBottom: 14, color: ink }}>{heading}</div>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ fontSize: 13.5, lineHeight: 1.7, color: muted, margin: "0 0 12px" }}>{p}</p>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <a href={privacyUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12.5, color: muted, textDecoration: "underline", textUnderlineOffset: 3, opacity: 0.9 }}>
            Read full privacy policy ↗
          </a>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleCancel}
              style={{ padding: "10px 18px", fontSize: 13, fontWeight: 500, fontFamily: sans, color: muted, background: "transparent", border: "none", borderRadius: 10, cursor: "pointer" }}>
              Not now
            </button>
            <button onClick={handleContinue}
              style={{ padding: "10px 22px", fontSize: 13, fontWeight: 600, fontFamily: sans, color: "#fff", background: accent, border: "none", borderRadius: 10, cursor: "pointer", letterSpacing: ".04em" }}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return { request, Modal };
}
