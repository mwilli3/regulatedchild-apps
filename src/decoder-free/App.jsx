import { useState } from "react";

/* ── Design tokens (OKLCH, brand hues preserved) ───────────────────── */
const C = {
  text: "oklch(0.26 0.03 45)",
  muted: "oklch(0.50 0.02 55)",
  cite: "oklch(0.55 0.02 55)",
  bg: "oklch(0.975 0.008 70)",
  surface: "oklch(0.995 0.004 75)",
  line: "oklch(0.90 0.01 60)",
  brand: "oklch(0.53 0.12 40)",
  brandDark: "oklch(0.44 0.11 40)",
  terracotta: "oklch(0.53 0.12 40)",
};

const DISPLAY = "'Young Serif', serif";
const UI = "'Outfit', sans-serif";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const FontLink = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Young+Serif&display=swap"
      rel="stylesheet"
    />
    <style>{`
      @keyframes rcFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      @keyframes rcArcDraw { from { stroke-dashoffset: var(--rc-arc-len); } to { stroke-dashoffset: var(--rc-arc-off); } }
      .rc-rise { opacity: 0; animation: rcFadeUp .7s ${EASE} forwards; }
      * { -webkit-tap-highlight-color: transparent; }
    `}</style>
  </>
);

/* ── Arc motif: logo + faint field ────────────────────────────────── */
const ArcLogo = ({ size = 40 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
    <path d="M100 22 A78 78 0 0 1 178 100" stroke="oklch(0.53 0.12 40)" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M178 100 A78 78 0 0 1 100 178" stroke="oklch(0.68 0.09 44)" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M100 178 A78 78 0 0 1 22 100" stroke="oklch(0.45 0.07 300)" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M22 100 A78 78 0 0 1 100 22" stroke="oklch(0.53 0.12 40)" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.32" />
    <circle cx="100" cy="100" r="16" fill="oklch(0.53 0.12 40)" />
  </svg>
);

// Big faint arc field used as calm background texture.
const ArcField = ({ color, style }) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, ...style }} aria-hidden="true">
    <path d="M40 360 A320 320 0 0 1 360 40" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M90 360 A270 270 0 0 1 360 90" stroke={color} strokeWidth="2" fill="none" opacity="0.32" />
    <path d="M150 360 A210 210 0 0 1 360 150" stroke={color} strokeWidth="2" fill="none" opacity="0.18" />
  </svg>
);

/* ── State config (labels/subs/icons preserved, recolored to brand) ── */
const stateConfig = {
  SYMPATHETIC: { label: "Sympathetic", sub: "Fight / flight", color: "oklch(0.53 0.12 40)", bg: "oklch(0.945 0.035 42)", icon: "△" },
  DORSAL: { label: "Dorsal vagal", sub: "Shutdown / freeze", color: "oklch(0.45 0.07 300)", bg: "oklch(0.93 0.025 300)", icon: "▽" },
  LOW_SYM: { label: "Low sympathetic", sub: "Low-grade activation", color: "oklch(0.50 0.035 250)", bg: "oklch(0.93 0.014 250)", icon: "◇" },
};

/* ── Content (unchanged) ──────────────────────────────────────────── */
const behaviors = [
  { behavior: "Meltdown / full tantrum", looks: "Screaming, throwing things, hitting, collapsing — can’t be reached by words or logic", state: "SYMPATHETIC", needs: "Lower your voice. Stay close. No instructions or consequences until the peak passes. Wait for full recovery before repair or teaching." },
  { behavior: "Aggression / hitting", looks: "Hitting, biting, kicking, throwing — often sudden, often at the adult closest to them", state: "SYMPATHETIC", needs: "Calm adult nervous system first. Create space without abandoning. No consequences in the moment — the body cannot process cause-and-effect. Address when fully regulated." },
  { behavior: "Homework resistance", looks: "Avoids starting, argues, cries, says they don’t know anything — after a full school day", state: "SYMPATHETIC", needs: "A 20–30 minute decompression buffer before any demand. The prefrontal cortex is depleted from a full school day. The resistance is the window of tolerance communicating its limit." },
  { behavior: "Clinginess / separation distress", looks: "Won’t let the adult leave, follows room to room, escalates when parent is out of sight", state: "SYMPATHETIC", needs: "Presence, not reassurance words. The nervous system needs a regulated body nearby. Predictable rituals at transition help the system anticipate safety rather than threat." },
  { behavior: "Sensory overload / covering ears", looks: "Hands over ears, meltdown in loud spaces, refuses textures/foods/clothing, overwhelmed by transitions", state: "SYMPATHETIC", needs: "Environmental reduction first. Lower input before requesting behavior change. The system is processing more than it can regulate — removing the load is the intervention." },
  { behavior: "Refusal / “I can’t”", looks: "Won’t start a task, says it’s too hard, lies down, goes blank — even with tasks they have done before", state: "DORSAL", needs: "Safety before demand. A warm presence, low-pressure check-in, one small step. The system has shut down — it needs proof the environment is safe before re-engaging." },
  { behavior: "Shutdown / going quiet", looks: "Flat affect, won’t respond, stares, leaves the room emotionally even when physically present", state: "DORSAL", needs: "Gentle presence, no demand. Soft voice, physical warmth, no questions. The system has collapsed — pushing for response escalates. Rhythm is the on-ramp back." },
  { behavior: "“I don’t know” / emotional blankness", looks: "Can’t identify what they feel, gives no answer to “what’s wrong,” seems disconnected from their experience", state: "DORSAL", needs: "Body-first: ask where they feel it, not how they feel. Interoception is underdeveloped — they genuinely cannot access the emotion. Build vocabulary through body sensation, not emotion labels." },
  { behavior: "Eye-rolling / “whatever”", looks: "Dismissiveness, minimal response, checked out, low-level defiance without escalation", state: "LOW_SYM", needs: "Connection before correction. The system is in low-level activation. Genuine curiosity from the adult is more effective than a consequence." },
];

/* ── State badge: dot + label chip in state tint ──────────────────── */
function StateBadge({ state }) {
  const s = stateConfig[state];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999,
      background: s.bg, fontSize: 11.5, fontWeight: 600, fontFamily: UI, color: s.color, letterSpacing: ".01em",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 4, background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

/* ── Expandable behavior row ──────────────────────────────────────── */
function BehaviorRow({ item, index, isFirst }) {
  const [open, setOpen] = useState(false);
  const s = stateConfig[item.state];

  return (
    <div
      className="rc-rise"
      style={{
        animationDelay: `${0.06 + index * 0.04}s`,
        borderTop: isFirst ? "none" : `1px solid ${C.line}`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          display: "flex", gap: 14, alignItems: "flex-start", width: "100%", padding: "18px 4px",
          background: "transparent", border: "none", textAlign: "left", cursor: "pointer", fontFamily: UI,
        }}
      >
        {/* Leading state-color marker (dot, not a side stripe) */}
        <span style={{
          flexShrink: 0, width: 12, height: 12, borderRadius: 6, marginTop: 5,
          background: s.color, boxShadow: `0 0 0 4px ${s.bg}`,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: UI, fontSize: 16, fontWeight: 600, color: C.text, lineHeight: 1.3, marginBottom: 5 }}>{item.behavior}</div>
          <div style={{ fontFamily: UI, fontSize: 13.5, color: C.muted, lineHeight: 1.55, marginBottom: 9 }}>{item.looks}</div>
          <StateBadge state={item.state} />
        </div>
        <span style={{
          flexShrink: 0, fontSize: 16, color: C.muted, marginTop: 3,
          transform: open ? "rotate(180deg)" : "rotate(0)", transition: `transform .35s ${EASE}`,
        }}>{"▾"}</span>
      </button>

      {open && (
        <div
          style={{
            overflow: "hidden", padding: "0 4px 18px 26px",
            animation: `rcFadeUp .45s ${EASE} forwards`,
          }}
        >
          {/* Full tinted block — NOT a left stripe */}
          <div style={{ background: s.bg, borderRadius: 14, padding: "16px 18px", border: `1px solid ${s.color}1f` }}>
            <p style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: s.color, margin: "0 0 8px" }}>
              What it actually needs
            </p>
            <p style={{ fontFamily: UI, fontSize: 14.5, color: C.text, lineHeight: 1.65, margin: 0 }}>{item.needs}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Gate ─────────────────────────────────────────────────────────── */
function Gate({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const ok = email.includes("@") && email.includes(".");
  const submit = () => ok && onSubmit({ name: name || "there", email });

  const inputStyle = {
    width: "100%", padding: "13px 0", borderRadius: 0, border: "none",
    borderBottom: `1.5px solid ${C.line}`, fontSize: 16, fontFamily: UI,
    color: C.text, background: "transparent", outline: "none", boxSizing: "border-box",
    transition: `border-color .3s ${EASE}`,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text, position: "relative", overflow: "hidden" }}>
      <FontLink />
      <div style={{ position: "absolute", top: "-22%", right: "-32%", width: "92vw", maxWidth: 560, height: "92vw", maxHeight: 560, pointerEvents: "none" }}>
        <ArcField color={C.brand} />
      </div>
      <div style={{ position: "relative", maxWidth: 520, margin: "0 auto", padding: "clamp(28px, 9vw, 64px) 24px 48px" }}>
        <div className="rc-rise" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(40px, 12vw, 72px)" }}>
          <ArcLogo size={34} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand }}>The Regulated Child</span>
        </div>

        <p className="rc-rise" style={{ animationDelay: ".06s", fontSize: 12, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.terracotta, margin: "0 0 14px" }}>
          The Behavior Decoder
        </p>
        <h1 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(38px, 11vw, 60px)", lineHeight: 1.04, letterSpacing: "-0.01em", margin: "0 0 20px" }}>
          Behavior Decoder
        </h1>
        <p className="rc-rise" style={{ animationDelay: ".18s", fontSize: 17, color: C.muted, lineHeight: 1.6, margin: "0 0 clamp(32px, 9vw, 48px)", maxWidth: "36ch" }}>
          Every behavior is your child’s nervous system trying to solve a problem. This decoder maps what you see to what’s happening in the body — and what the body actually needs.
        </p>

        <div className="rc-rise" style={{ animationDelay: ".24s" }}>
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", color: C.muted, display: "block", marginBottom: 4 }}>First name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your first name"
            onFocus={e => e.target.style.borderColor = C.brand} onBlur={e => e.target.style.borderColor = C.line}
            style={{ ...inputStyle, marginBottom: 24 }} />
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", color: C.muted, display: "block", marginBottom: 4 }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
            onKeyDown={e => e.key === "Enter" && submit()}
            onFocus={e => e.target.style.borderColor = C.brand} onBlur={e => e.target.style.borderColor = C.line}
            style={{ ...inputStyle, marginBottom: 30 }} />
          <button onClick={submit} disabled={!ok} style={{
            width: "100%", padding: "17px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600, fontFamily: UI,
            cursor: ok ? "pointer" : "default", background: ok ? C.brand : C.line, color: ok ? "white" : C.muted,
            letterSpacing: ".01em", transition: `all .3s ${EASE}`,
          }}>Open the decoder</button>
        </div>

        <div className="rc-rise" style={{ animationDelay: ".3s", display: "flex", flexWrap: "wrap", gap: "10px 22px", marginTop: 34, paddingTop: 26, borderTop: `1px solid ${C.line}` }}>
          {Object.entries(stateConfig).map(([key, s]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: s.color }} />
              <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Filter bar (logic preserved) ─────────────────────────────────── */
function FilterBar({ active, onChange }) {
  const filters = [
    { key: "ALL", label: "All behaviors", color: C.brand },
    { key: "SYMPATHETIC", label: "Fight / flight", color: stateConfig.SYMPATHETIC.color },
    { key: "DORSAL", label: "Shutdown / freeze", color: stateConfig.DORSAL.color },
    { key: "LOW_SYM", label: "Low activation", color: stateConfig.LOW_SYM.color },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
      {filters.map(fl => {
        const on = active === fl.key;
        return (
          <button key={fl.key} onClick={() => onChange(fl.key)} style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "8px 14px", borderRadius: 999, border: `1.5px solid ${on ? fl.color : C.line}`,
            background: on ? fl.color : C.surface, color: on ? "white" : C.muted,
            fontSize: 12.5, fontWeight: 600, fontFamily: UI, cursor: "pointer", letterSpacing: ".01em",
            transition: `all .25s ${EASE}`,
          }}>
            {fl.key !== "ALL" && (
              <span style={{ width: 7, height: 7, borderRadius: 4, background: on ? "white" : fl.color, flexShrink: 0 }} />
            )}
            {fl.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── State key legend (dots, no stripes) ──────────────────────────── */
function StateKey() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginBottom: 26, paddingBottom: 22, borderBottom: `1px solid ${C.line}` }}>
      {Object.entries(stateConfig).map(([key, s]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: UI }}>
          <span style={{ width: 9, height: 9, borderRadius: 5, background: s.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.label}</span>
          <span style={{ fontSize: 12.5, fontWeight: 400, color: C.muted }}>{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Decoder screen ───────────────────────────────────────────────── */
function Decoder() {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? behaviors : behaviors.filter(b => b.state === filter);

  const Kicker = ({ children, color = C.brand, style }) => (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color, margin: "0 0 14px", ...style }}>{children}</p>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />

      <header style={{ padding: "16px 20px", background: C.surface, borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 9 }}>
          <ArcLogo size={26} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand }}>The Regulated Child</span>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "clamp(28px, 8vw, 52px) 20px 64px" }}>
        <p className="rc-rise" style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.terracotta, margin: "0 0 14px" }}>
          The Behavior Decoder
        </p>
        <h1 className="rc-rise" style={{ animationDelay: ".05s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(32px, 9vw, 46px)", lineHeight: 1.05, letterSpacing: "-0.01em", margin: "0 0 14px" }}>
          Behavior Decoder
        </h1>
        <p className="rc-rise" style={{ animationDelay: ".1s", fontSize: 16, color: C.muted, lineHeight: 1.6, margin: "0 0 28px", maxWidth: "44ch" }}>
          Tap any behavior to see the nervous system state behind it and what your child actually needs in that moment.
        </p>

        <div className="rc-rise" style={{ animationDelay: ".16s" }}>
          <FilterBar active={filter} onChange={setFilter} />
          <StateKey />
        </div>

        <div>
          {filtered.map((b, i) => <BehaviorRow key={b.behavior} item={b} index={i} isFirst={i === 0} />)}
        </div>

        {/* Go deeper */}
        <section style={{ marginTop: "clamp(40px, 11vw, 60px)" }}>
          <Kicker>Go deeper</Kicker>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden", background: C.surface }}>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>Co-Regulation Guide</div>
              <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55 }}>The five-step protocol for what to do once you’ve identified the state. Comment <strong style={{ color: C.brand, fontWeight: 700 }}>REGULATE</strong> on @regulatedchild.</div>
            </div>
            <div style={{ padding: "18px 20px", borderTop: `1px solid ${C.line}` }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>In-the-Moment Scripts Pack</div>
              <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55 }}>20 exact phrases for the most common moments. Comment <strong style={{ color: C.brand, fontWeight: 700 }}>SCRIPTS</strong> on @regulatedchild.</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: "center", marginTop: "clamp(36px, 9vw, 48px)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <ArcLogo size={20} />
            <a href="https://www.tiktok.com/@regulatedchild" target="_blank" rel="noopener" style={{ fontSize: 13, color: C.brand, textDecoration: "none", fontWeight: 600 }}>@regulatedchild</a>
          </div>
          <p style={{ fontSize: 12, color: C.cite, fontStyle: "italic", lineHeight: 1.55, maxWidth: "44ch", margin: "0 auto 8px" }}>
            This is educational information about nervous system science. For clinical concerns about your child’s development or behavior, please consult a licensed professional.
          </p>
          <p style={{ fontSize: 11, color: C.cite }}>© The Regulated Child · Larice · regulatedchild.com</p>
        </footer>
      </main>
    </div>
  );
}

/* ── App ──────────────────────────────────────────────────────────── */
export default function BehaviorDecoder() {
  const [screen, setScreen] = useState("gate");

  if (screen === "gate") return <Gate onSubmit={() => setScreen("decoder")} />;
  return <Decoder />;
}
