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
  brandTint: "oklch(0.945 0.035 42)",
  plum: "oklch(0.45 0.07 300)",
  plumTint: "oklch(0.93 0.025 300)",
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
      .rc-rise { opacity: 0; animation: rcFadeUp .7s ${EASE} forwards; }
      * { -webkit-tap-highlight-color: transparent; }
      html { scroll-behavior: smooth; }
    `}</style>
  </>
);

const ArcLogo = ({ size = 40 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
    <path d="M100 22 A78 78 0 0 1 178 100" stroke="oklch(0.53 0.12 40)" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M178 100 A78 78 0 0 1 100 178" stroke="oklch(0.68 0.09 44)" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M100 178 A78 78 0 0 1 22 100" stroke="oklch(0.45 0.07 300)" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M22 100 A78 78 0 0 1 100 22" stroke="oklch(0.53 0.12 40)" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.32" />
    <circle cx="100" cy="100" r="16" fill="oklch(0.53 0.12 40)" />
  </svg>
);

const ArcField = ({ color, style }) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }} aria-hidden="true">
    <path d="M40 360 A320 320 0 0 1 360 40" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M90 360 A270 270 0 0 1 360 90" stroke={color} strokeWidth="2" fill="none" opacity="0.32" />
    <path d="M150 360 A210 210 0 0 1 360 150" stroke={color} strokeWidth="2" fill="none" opacity="0.18" />
  </svg>
);

const FREE_APPS = [
  { href: "/quiz", title: "Regulation Profile Quiz", blurb: "Find your child's nervous-system profile in a few minutes, and what it means for how they meet the world." },
  { href: "/body", title: "The Body Behind the Behavior", blurb: "An interactive map of the four nervous-system states — and what each one is trying to accomplish." },
  { href: "/coregulation", title: "Co-Regulation Guide", blurb: "How your own regulated presence becomes the tool that helps your child come back to calm." },
  { href: "/decoder-free", title: "Behavior Decoder", blurb: "A free preview of the decoder: look up a behavior and see the state and need underneath it." },
  { href: "/scripts-free", title: "In-the-Moment Scripts", blurb: "A free sampler of regulating things to say when the moment is already hard." },
];

const PAID_APPS = [
  { href: "/decoder", title: "Behavior Decoder Workbook", price: "$47", blurb: "The full workbook: antecedent tracker, your child's State Signature, AI pattern analysis, and a provider-ready report." },
  { href: "/scripts", title: "In-the-Moment Scripts Pack", sub: "Research Edition", price: "$47", blurb: "Scripts for every state and scenario, grounded in the research — plus AI help tailoring them to your child." },
];

function AppCard({ app, index, paid }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={app.href}
      className="rc-rise"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        animationDelay: `${0.05 + index * 0.05}s`,
        display: "block", textDecoration: "none",
        background: C.surface, borderRadius: 18,
        border: `1px solid ${hover ? (paid ? C.plum : C.brand) : C.line}`,
        padding: "20px 22px",
        boxShadow: hover ? "0 12px 30px oklch(0.53 0.12 40 / 0.10)" : "0 1px 2px oklch(0.53 0.12 40 / 0.04)",
        transform: hover ? "translateY(-3px)" : "none",
        transition: `all .3s ${EASE}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 20, lineHeight: 1.15, color: C.text, margin: 0 }}>
          {app.title}
        </h3>
        {paid && (
          <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, fontFamily: UI, color: C.plum }}>{app.price}</span>
        )}
      </div>
      {app.sub && (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: C.plum, marginBottom: 8, fontFamily: UI }}>{app.sub}</div>
      )}
      <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: "0 0 14px", fontFamily: UI }}>{app.blurb}</p>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 13, fontWeight: 600, fontFamily: UI,
        color: paid ? C.plum : C.brand,
      }}>
        {paid ? "Open" : "Start free"}
        <span style={{ transform: hover ? "translateX(3px)" : "none", transition: `transform .3s ${EASE}` }}>→</span>
      </span>
    </a>
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: UI, background: C.bg, color: C.text, minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <FontLink />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header style={{ position: "relative", overflow: "hidden", padding: "0 20px" }}>
        <ArcField color={C.brand} style={{ opacity: 0.6 }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "64px 0 48px", textAlign: "center" }}>
          <div className="rc-rise" style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <ArcLogo size={64} />
          </div>
          <p className="rc-rise" style={{ animationDelay: ".05s", fontSize: 12, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: C.terracotta, margin: "0 0 16px" }}>
            The Regulated Child
          </p>
          <h1 className="rc-rise" style={{ animationDelay: ".1s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(32px, 8vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.01em", color: C.text, margin: "0 0 18px" }}>
            Behavior is communication, not defiance.
          </h1>
          <p className="rc-rise" style={{ animationDelay: ".15s", fontSize: 16, color: C.muted, lineHeight: 1.65, maxWidth: 540, margin: "0 auto 28px" }}>
            A set of tools for reading your child's nervous system — so the hardest moments make sense, and you know what to do next. Grounded in polyvagal theory, developmental neuroscience, and attachment research.
          </p>
          <a className="rc-rise" href="#tools" style={{ animationDelay: ".2s", display: "inline-block", padding: "13px 28px", borderRadius: 999, background: C.brand, color: "white", fontSize: 14.5, fontWeight: 600, textDecoration: "none", boxShadow: "0 8px 22px oklch(0.53 0.12 40 / 0.22)" }}>
            Explore the tools
          </a>
        </div>
      </header>

      {/* ── Free tools ───────────────────────────────────────── */}
      <main id="tools" style={{ maxWidth: 880, margin: "0 auto", padding: "24px 20px 0" }}>
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(24px, 6vw, 32px)", color: C.text, margin: 0 }}>Start here — free</h2>
          </div>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, margin: "0 0 22px", maxWidth: 560 }}>
            No sign-up. These give you the lens — start with the quiz, then dig into whatever your family needs most.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {FREE_APPS.map((app, i) => <AppCard key={app.href} app={app} index={i} paid={false} />)}
          </div>
        </section>

        {/* ── Paid tools ─────────────────────────────────────── */}
        <section style={{ position: "relative", overflow: "hidden", borderRadius: 24, background: C.plumTint, padding: "32px 24px", marginBottom: 56 }}>
          <ArcField color={C.plum} style={{ opacity: 0.45 }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: C.plum, margin: "0 0 8px" }}>Go deeper</p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(24px, 6vw, 32px)", color: C.text, margin: "0 0 6px" }}>The full workbooks</h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, margin: "0 0 22px", maxWidth: 560 }}>
              The complete tools — tracking, AI analysis tuned to your child, and reports you can bring to a provider.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {PAID_APPS.map((app, i) => <AppCard key={app.href} app={app} index={i} paid />)}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 20px 40px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><ArcLogo size={32} /></div>
          <p style={{ fontSize: 12, color: C.cite, fontStyle: "italic", margin: "0 0 6px" }}>
            Educational content, not clinical advice. If you or your child are in crisis, call or text 988.
          </p>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
            © The Regulated Child ·{" "}
            <a href="https://regulatedchild.com" style={{ color: C.brand, textDecoration: "none", fontWeight: 600 }}>regulatedchild.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
