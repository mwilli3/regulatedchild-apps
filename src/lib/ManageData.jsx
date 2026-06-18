// "Manage my data" — a styled, on-page modal matching the LL paid-apps design.
// Replaces the old confirm()-based wipe button. Shows live counts of what will
// be deleted, and (like LL) PRESERVES purchase/unlock state so a wipe never
// forces the buyer to re-verify. The palette + fonts are passed in so each app
// renders in its own brand tokens.

import { useState, useEffect } from "react";
import { clearLocalData, readLocal } from "./clearData";

export function ManageData({ C, DISPLAY, UI, EASE, kicker, intro, getRows, deleteKeys }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [wiping, setWiping] = useState(false);

  // Recompute the "what will be deleted" counts each time the modal opens.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try { const r = await getRows(); if (alive) setRows(r || []); }
      catch { if (alive) setRows([]); }
    })();
    return () => { alive = false; };
  }, [open]);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const wipe = async () => {
    setWiping(true);
    await clearLocalData(deleteKeys); // access token is intentionally NOT in deleteKeys
    location.reload();
  };

  const linkStyle = {
    marginTop: 16, background: "none", border: "none", color: C.cite, fontSize: 11,
    fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", fontFamily: UI,
    textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer",
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={linkStyle}>Manage my data</button>

      {open && (
        <div role="dialog" aria-modal="true" onClick={() => !wiping && setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "oklch(0.26 0.03 45 / 0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
            backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 360, background: C.surface, borderRadius: 24,
              padding: "26px 24px 22px", boxShadow: "0 24px 60px oklch(0.26 0.03 45 / 0.28)",
              fontFamily: UI, textAlign: "left", maxHeight: "88vh", overflowY: "auto" }}>

            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: C.terracotta, margin: "0 0 10px" }}>{kicker}</p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 27, lineHeight: 1.1, color: C.text, margin: "0 0 12px" }}>Your data on this device</h2>
            <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: "0 0 20px" }}>{intro}</p>

            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>What will be deleted</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {rows.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: C.brandTint, borderRadius: 12, padding: "12px 14px" }}>
                  <span style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: C.cite, fontWeight: 600, flexShrink: 0 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: C.bg, borderRadius: 12, padding: "13px 15px", marginBottom: 20 }}>
              <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, margin: 0 }}>
                <strong style={{ color: C.text }}>Your access stays.</strong> Purchase verification, email, and unlock state are preserved so you don’t have to re-enter anything. To unsubscribe from marketing emails, use the link at the bottom of any email we’ve sent.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
              <button onClick={() => setOpen(false)} disabled={wiping}
                style={{ padding: "11px 18px", borderRadius: 12, border: "none", background: "none", color: C.muted, fontSize: 14, fontWeight: 600, fontFamily: UI, cursor: wiping ? "default" : "pointer" }}>Cancel</button>
              <button onClick={wipe} disabled={wiping}
                style={{ padding: "11px 20px", borderRadius: 12, border: "none", background: C.brand, color: "white", fontSize: 14, fontWeight: 600, fontFamily: UI, cursor: wiping ? "default" : "pointer", opacity: wiping ? 0.6 : 1, transition: `opacity .2s ${EASE}` }}>{wiping ? "Wiping…" : "Wipe my data"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
