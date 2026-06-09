import { useState } from "react";
import { subscribeFree, isSubscribed } from "../lib/subscribeFree.js";

/* ── Design tokens (OKLCH, brand hues preserved) ───────────────────── */
const C = {
  text: "oklch(0.26 0.03 45)", muted: "oklch(0.50 0.02 55)", cite: "oklch(0.55 0.02 55)",
  bg: "oklch(0.975 0.008 70)", surface: "oklch(0.995 0.004 75)", line: "oklch(0.90 0.01 60)",
  brand: "oklch(0.53 0.12 40)", brandDark: "oklch(0.44 0.11 40)", terracotta: "oklch(0.53 0.12 40)",
  // warm dark theme for the in-the-moment / emergency mode (NOT pure black):
  dark: "oklch(0.20 0.012 40)", darkSurface: "oklch(0.255 0.014 40)", darkLine: "oklch(0.34 0.014 40)",
  darkText: "oklch(0.96 0.006 70)", darkMuted: "oklch(0.72 0.012 60)",
};

const DISPLAY = "'Young Serif', serif";
const UI = "'Outfit', sans-serif";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// Calm "did this help / win" affirm tone for the dark mode.
const AFFIRM = "oklch(0.72 0.09 150)";
const AFFIRM_BG = "oklch(0.30 0.04 150)";

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
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      .rc-rise { opacity: 0; animation: rcFadeUp .7s ${EASE} forwards; }
      * { -webkit-tap-highlight-color: transparent; }
    `}</style>
  </>
);

/* ── Arc motif: logo, ring, faint field ───────────────────────────── */
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
    style={{ position: "absolute", inset: 0, ...style }} aria-hidden="true">
    <path d="M40 360 A320 320 0 0 1 360 40" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M90 360 A270 270 0 0 1 360 90" stroke={color} strokeWidth="2" fill="none" opacity="0.32" />
    <path d="M150 360 A210 210 0 0 1 360 150" stroke={color} strokeWidth="2" fill="none" opacity="0.18" />
  </svg>
);

/* ── Content (copy/data unchanged; category colors re-expressed in OKLCH) ── */
const categories = [
  { id: "meltdown", label: "Meltdown", num: "01", color: "oklch(0.53 0.12 40)", bg: "oklch(0.945 0.035 42)", icon: "△",
    intro: "For full sympathetic activation — when the peak has arrived or is arriving. No logic, no instructions. Body and voice only.",
    footer: "During a meltdown: no questions, no reasoning, no consequences. The prefrontal cortex is offline. These four scripts are your entire toolkit until the window reopens.",
    scripts: [
      { num: 1, situation: "At the peak", script: "“I’m here. I’m not going anywhere.”", note: "Slow. Low. Soft. No urgency. Say it once and mean it.", doNot: "Do not say ‘calm down,’ ‘use your words,’ or ‘stop crying.’ The prefrontal cortex is offline." },
      { num: 2, situation: "When they’re moving toward you", script: "“I can see your body is really activated right now. I’m going to stay right here.”", note: "Don’t step back. Stepping back registers as abandonment. Hold your ground calmly.", doNot: "Do not step backward or create distance. The nervous system reads retreat as abandonment." },
      { num: 3, situation: "When they say ‘I hate you’", script: "“I know you’re having a really big body moment. I love you. That doesn’t change.”", note: "Do not correct the statement. Do not explain. The nervous system cannot process explanation right now.", doNot: "Do not correct or lecture. The amygdala is driving the words, not the child." },
      { num: 4, situation: "When the peak is passing", script: "“You’re starting to come back. I’m right here. Take your time.”", note: "Only say this when you can see the body beginning to soften. Not during the peak.", doNot: "Do not rush to teach or debrief. Recovery takes 20–30 minutes after peak." },
    ],
  },
  { id: "shutdown", label: "Shutdown", num: "02", color: "oklch(0.45 0.07 300)", bg: "oklch(0.93 0.025 300)", icon: "▽",
    intro: "For dorsal vagal collapse — flat affect, won’t respond, seems checked out. The system has collapsed, not activated.",
    footer: "Shutdown looks like indifference. It is the opposite — it is a nervous system that has collapsed under overwhelm. Warm, quiet presence is the on-ramp back.",
    scripts: [
      { num: 5, situation: "When they go flat and quiet", script: "“I notice you’ve gone quiet. I’m right here. You don’t have to say anything.”", note: "Remove the demand for response. The shutdown nervous system needs safety without expectation.", doNot: "Do not demand eye contact or a verbal response. Pushing for engagement escalates shutdown." },
      { num: 6, situation: "When they won’t make eye contact", script: "“I’m going to sit near you for a few minutes. No agenda. Just here.”", note: "Proximity without demand. Physical warmth if they’ll accept it. Rhythm helps more than words here.", doNot: "Do not ask ‘what’s wrong?’ repeatedly. The question itself is a demand the system cannot meet." },
      { num: 7, situation: "When they say ‘I don’t know’ or ‘I don’t care’", script: "“That’s okay. Your body might not have the words yet. I’m not going anywhere.”", note: "They may genuinely not know. Interoception is underdeveloped. Don’t push for a feeling label.", doNot: "Do not interpret ‘I don’t know’ as evasion. It is often neurologically accurate." },
    ],
  },
  { id: "deescalation", label: "De-escalation", num: "03", color: "oklch(0.50 0.04 150)", bg: "oklch(0.93 0.018 150)", icon: "◇",
    intro: "For catching it before it peaks — when the window is narrowing but the body hasn’t fully activated. This is where prevention lives.",
    footer: "De-escalation is the highest-leverage moment. The goal is catching the drift before the peak — not managing the peak after it arrives.",
    scripts: [
      { num: 8, situation: "When you see the early signs", script: "“I notice your body might be getting activated. Let’s slow down before we keep going.”", note: "Name it without judgment. Naming the state accurately is itself a regulatory signal.", doNot: "Do not say ‘you’re about to have a meltdown.’ Predicting the worst primes it." },
      { num: 9, situation: "When they’re getting rigid or snappy", script: "“Something’s feeling hard right now. I’m not going to make it harder. What do you need?”", note: "Removing pressure when the window is narrowing prevents escalation more reliably than any strategy.", doNot: "Do not add a consequence threat. Threats narrow the window further." },
      { num: 10, situation: "Before a known difficult moment", script: "“This next part might feel hard for your body. I’m right here and we’ll do it together.”", note: "Predictability reduces threat. Naming the difficulty in advance reduces the nervous system’s threat assessment.", doNot: "Do not surprise a narrow-window nervous system. Preview everything." },
      { num: 11, situation: "When they need to move first", script: "“Your body needs to move before your brain can think. Let’s do that first.”", note: "Rhythmic movement completes the stress cycle. Offer a walk, jumping, stretching — before you ask for anything cognitive.", doNot: "Do not insist on sitting still. Stillness is a prefrontal demand that a mobilized body cannot meet." },
    ],
  },
  { id: "transition", label: "Transition", num: "04", color: "oklch(0.50 0.035 250)", bg: "oklch(0.93 0.014 250)", icon: "○",
    intro: "For the moments between activities — endings, beginnings, and the space between. Transitions are threat signals to a nervous system that relies on predictability.",
    footer: "Transitions are disproportionately hard for nervous systems with high sensory sensitivity or narrow windows of tolerance.",
    scripts: [
      { num: 12, situation: "The five-minute warning", script: "“Five more minutes and then we’re going to wrap up. I’ll let you know when it’s time.”", note: "The warning is not about time management. It is a nervous system safety signal: what is coming is predictable.", doNot: "Do not abruptly end an activity without warning. Sudden stops narrow the window." },
      { num: 13, situation: "When they resist ending something", script: "“I know stopping is hard. Your brain is still in that activity. Let’s give your body a moment to catch up.”", note: "Validate the biology, not the resistance. Task disengagement is a prefrontal cortex demand.", doNot: "Do not say ‘you knew this was coming.’ Knowledge does not override the nervous system." },
      { num: 14, situation: "Arriving somewhere new or difficult", script: "“We’re about to go in. You know what’s going to happen: [brief preview]. I’ll be right there.”", note: "Preview removes the unknown. The nervous system can tolerate known discomfort better than unpredictable situations.", doNot: "Do not minimize: ‘it’ll be fine.’ The nervous system doesn’t believe fine. It believes data." },
    ],
  },
  { id: "morning", label: "Morning", num: "05", color: "oklch(0.62 0.10 50)", bg: "oklch(0.945 0.03 50)", icon: "○",
    intro: "For before the window is fully open — the cortisol awakening response peaks 20–30 minutes after waking.",
    footer: "Morning dysregulation is not oppositional behavior — it is the cortisol awakening response meeting a demand before the nervous system has found its daytime baseline.",
    scripts: [
      { num: 15, situation: "When they wake up already activated", script: "“Good morning. I’m here. No rush. Let’s just be here for a minute.”", note: "No demands for the first ten minutes. The window needs time to open. This is not permissiveness — it is biology.", doNot: "Do not start the morning with a list of demands. The prefrontal cortex is still booting up." },
      { num: 16, situation: "When the morning is falling apart", script: "“Your body is still waking up. We’re going to slow down and do one thing at a time.”", note: "Lower the cognitive load. One instruction at a time. No multi-step sequences until the window is open.", doNot: "Do not raise your voice to speed things up. Volume registers as threat before it registers as urgency." },
    ],
  },
  { id: "homework", label: "Homework", num: "06", color: "oklch(0.52 0.045 245)", bg: "oklch(0.93 0.018 245)", icon: "○",
    intro: "For the end-of-day depletion wall — homework arrives at the worst possible moment for executive function.",
    footer: "The homework meltdown is not about homework. It is a depleted prefrontal cortex meeting a cognitive demand. A 20–30 minute decompression buffer is the most effective homework intervention available.",
    scripts: [
      { num: 17, situation: "When they won’t start", script: "“Your brain has been working hard all day. We’re going to wait thirty minutes and then try. You’re not in trouble.”", note: "The decompression buffer is the intervention. The resistance is accurate body communication, not defiance.", doNot: "Do not interpret resistance as laziness. A depleted prefrontal cortex cannot initiate on command." },
      { num: 18, situation: "When they say ‘I can’t do it’ or ‘it’s too hard’", script: "“Your brain is tired, not broken. Let’s just read the first problem together. That’s all we’re doing right now.”", note: "Task initiation is the barrier, not capability. Reduce the scope to the smallest possible first step.", doNot: "Do not say ‘you did this fine yesterday.’ Yesterday’s window was different." },
    ],
  },
  { id: "repair", label: "Repair", num: "07", color: "oklch(0.53 0.12 40)", bg: "oklch(0.945 0.035 42)", icon: "○",
    intro: "For after you’ve lost your own regulated state — only when both nervous systems are back in the window of tolerance.",
    footer: "What predicts healthy development is not the absence of ruptures — it is the quality of repairs. A parent who repairs consistently is modeling something more valuable than perfect regulation.",
    scripts: [
      { num: 19, situation: "The repair opener", script: "“I want to talk about what happened earlier. I got loud and I shouldn’t have. That was my nervous system — not your fault.”", note: "Acknowledge before you explain. Explanation without acknowledgment reads as justification.", doNot: "Do not add a behavior correction to the repair conversation. Repair is only about the relationship." },
      { num: 20, situation: "The reconnection close", script: "“I love you. We’re okay. You didn’t do anything wrong by having a hard moment — and neither did I.”", note: "The relationship is intact. Say it plainly. Physical contact if they’re receptive. This is the whole repair.", doNot: "Do not attempt repair before the window has reopened. Premature repair reads as more pressure." },
    ],
  },
];

const allScripts = categories.flatMap(c => c.scripts.map(s => ({ ...s, catId: c.id, catLabel: c.label, catColor: c.color, catBg: c.bg })));

/* ── Browse: expandable script card (no side stripes) ──────────────── */
function ScriptCard({ s, isFav, onToggleFav, showCat }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.line}`, overflow: "hidden", background: C.surface, marginBottom: 10 }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 13, cursor: "pointer" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: s.catBg, color: s.catColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 400, fontFamily: DISPLAY, flexShrink: 0, marginTop: 1 }}>{s.num}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {showCat && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: s.catColor, marginBottom: 4, fontFamily: UI }}>{s.catLabel}</div>}
          <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 600, letterSpacing: ".02em", color: C.muted, marginBottom: 6, textTransform: "uppercase" }}>{s.situation}</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 18, color: C.text, lineHeight: 1.4 }}>{s.script}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onToggleFav(s.num); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, padding: 0, color: isFav ? C.terracotta : C.line }}>{isFav ? "★" : "☆"}</button>
          <div style={{ fontSize: 15, color: C.muted, transform: open ? "rotate(180deg)" : "rotate(0)", transition: `transform .3s ${EASE}` }}>{"▾"}</div>
        </div>
      </div>
      {open && (
        <div className="rc-rise" style={{ animationDuration: ".4s", padding: "0 18px 18px 61px" }}>
          <div style={{ background: s.catBg, borderRadius: 12, padding: "12px 15px", marginBottom: 10 }}>
            <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: s.catColor, marginBottom: 5 }}>Why it works</div>
            <p style={{ fontFamily: UI, fontSize: 13.5, color: C.text, lineHeight: 1.6, margin: 0 }}>{s.note}</p>
          </div>
          {s.doNot && (
            <div style={{ background: "oklch(0.945 0.035 42)", borderRadius: 12, padding: "12px 15px" }}>
              <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.terracotta, marginBottom: 5 }}>Don't</div>
              <p style={{ fontFamily: UI, fontSize: 13.5, color: C.text, lineHeight: 1.6, margin: 0 }}>{s.doNot}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Gate ──────────────────────────────────────────────────────────── */
function Gate({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const ok = email.includes("@") && email.includes(".");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    if (!ok || submitting) return;
    setSubmitting(true); setError("");
    const res = await subscribeFree({ app: "scripts", name: name.trim(), email: email.trim() });
    if (res.ok) { onSubmit(name || "there"); return; }
    setError(res.message);
    setSubmitting(false);
  };

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
          In-the-Moment Scripts Pack
        </p>
        <h1 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(38px, 11vw, 60px)", lineHeight: 1.04, letterSpacing: "-0.01em", margin: "0 0 20px" }}>
          In-the-Moment Scripts Pack
        </h1>
        <p className="rc-rise" style={{ animationDelay: ".18s", fontSize: 17, color: C.muted, lineHeight: 1.6, margin: "0 0 clamp(32px, 9vw, 48px)", maxWidth: "34ch" }}>
          20 phrases for the moments when you don't know what to say — organized by situation, grounded in nervous system science.
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
          <button onClick={submit} disabled={!ok || submitting} style={{
            width: "100%", padding: "17px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600, fontFamily: UI,
            cursor: ok && !submitting ? "pointer" : "default", background: ok && !submitting ? C.brand : C.line, color: ok && !submitting ? "white" : C.muted,
            letterSpacing: ".01em", transition: `all .3s ${EASE}`,
          }}>{submitting ? "Sending…" : "Open the scripts"}</button>
          {error && <p style={{ marginTop: 14, fontSize: 13, color: C.brand, lineHeight: 1.5 }}>{error}</p>}
        </div>

        <p className="rc-rise" style={{ animationDelay: ".3s", fontSize: 13, color: C.muted, fontWeight: 500, marginTop: 34, paddingTop: 26, borderTop: `1px solid ${C.line}` }}>
          7 categories · 20 scripts · Emergency mode included
        </p>
      </div>
    </div>
  );
}

/* ── Home ──────────────────────────────────────────────────────────── */
function Home({ onMode }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text, position: "relative", overflow: "hidden" }}>
      <FontLink />
      <div style={{ position: "absolute", top: "-18%", left: "-30%", width: "80vw", maxWidth: 460, height: "80vw", maxHeight: 460, pointerEvents: "none" }}>
        <ArcField color={C.brand} />
      </div>
      <div style={{ position: "relative", maxWidth: 520, margin: "0 auto", padding: "clamp(28px, 9vw, 56px) 20px 48px" }}>
        <div className="rc-rise" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(28px, 9vw, 44px)" }}>
          <ArcLogo size={30} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand }}>The Regulated Child</span>
        </div>

        <h1 className="rc-rise" style={{ animationDelay: ".06s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(30px, 8vw, 44px)", lineHeight: 1.08, letterSpacing: "-0.01em", margin: "0 0 28px" }}>
          In-the-Moment Scripts Pack
        </h1>

        <button onClick={() => onMode("emergency")} className="rc-rise" style={{ animationDelay: ".12s", width: "100%", background: C.dark, color: C.darkText, border: "none", borderRadius: 18, padding: "20px", marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", transition: `transform .25s ${EASE}` }}>
          <div style={{ width: 46, height: 46, borderRadius: 23, background: C.terracotta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: "white", fontWeight: 700 }}>{"△"}</div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 20, marginBottom: 3 }}>I need a script now</div>
            <div style={{ color: C.darkMuted, fontSize: 12.5 }}>Pick the situation, get the words — under 30 seconds</div>
          </div>
        </button>

        <button onClick={() => onMode("browse")} className="rc-rise" style={{ animationDelay: ".18s", width: "100%", background: C.surface, color: C.text, border: `1px solid ${C.line}`, borderRadius: 18, padding: "20px", marginBottom: 28, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", transition: `transform .25s ${EASE}` }}>
          <div style={{ width: 46, height: 46, borderRadius: 23, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, color: "white", fontFamily: DISPLAY, fontWeight: 400 }}>20</div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 20, marginBottom: 3 }}>Browse all scripts</div>
            <div style={{ color: C.muted, fontSize: 12.5 }}>Filter by category · Save favorites</div>
          </div>
        </button>

        <div className="rc-rise" style={{ animationDelay: ".24s", background: "oklch(0.93 0.025 300)", borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.brand, marginBottom: 8 }}>The one rule</div>
          <p style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(16px, 4.4vw, 19px)", color: C.text, lineHeight: 1.45, margin: 0 }}>Your regulated nervous system delivers the script. The state you're in when you speak matters more than the words. If you are activated, use the physiological sigh first — double inhale through the nose, long exhale through the mouth — then approach.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Did this help? (warm-dark) ────────────────────────────────────── */
function DidThisHelp({ cat, onYes, onNo, wins }) {
  const showUpsell = wins >= 3;
  return (
    <div style={{ minHeight: "100vh", background: C.dark, fontFamily: UI, padding: "20px", position: "relative", overflow: "hidden" }}>
      <FontLink />
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div className="rc-rise" style={{ width: 54, height: 54, borderRadius: 27, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: cat.color }} />
        </div>
        <h2 className="rc-rise" style={{ animationDelay: ".06s", color: C.darkText, fontFamily: DISPLAY, fontWeight: 400, fontSize: 30, textAlign: "center", marginBottom: 10 }}>Did this help?</h2>
        <p className="rc-rise" style={{ animationDelay: ".12s", color: C.darkMuted, fontSize: 14, textAlign: "center", marginBottom: 30, maxWidth: 300, lineHeight: 1.5 }}>No wrong answer. Tracking what works helps you see the pattern.</p>
        <div className="rc-rise" style={{ animationDelay: ".18s", display: "flex", gap: 12, width: "100%", maxWidth: 340 }}>
          <button onClick={onYes} style={{ flex: 1, padding: "16px", borderRadius: 14, border: "none", background: AFFIRM_BG, color: AFFIRM, fontSize: 15, fontWeight: 600, fontFamily: UI, cursor: "pointer" }}>Yes, this helped</button>
          <button onClick={onNo} style={{ flex: 1, padding: "16px", borderRadius: 14, border: `1px solid ${C.darkLine}`, background: "transparent", color: C.darkMuted, fontSize: 15, fontWeight: 600, fontFamily: UI, cursor: "pointer" }}>Not this time</button>
        </div>
        {wins > 0 && !showUpsell && (
          <p style={{ color: C.darkMuted, opacity: 0.7, fontSize: 11, marginTop: 18 }}>Scripts that worked: {wins}</p>
        )}
      </div>
    </div>
  );
}

/* ── Win upsell (warm-dark) ────────────────────────────────────────── */
function WinUpsell({ wins, onDismiss, onBrowse }) {
  return (
    <div style={{ minHeight: "100vh", background: C.dark, fontFamily: UI, padding: "20px", position: "relative", overflow: "hidden" }}>
      <FontLink />
      <div style={{ position: "absolute", top: "-14%", right: "-30%", width: "78vw", maxWidth: 420, height: "78vw", maxHeight: 420, pointerEvents: "none", opacity: 0.5 }}>
        <ArcField color={C.brand} />
      </div>
      <div style={{ position: "relative", maxWidth: 440, margin: "0 auto", paddingTop: "15vh" }}>
        <div className="rc-rise" style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 10, background: AFFIRM_BG, marginBottom: 18 }}>
            <span style={{ color: AFFIRM, fontSize: 12, fontWeight: 600 }}>{wins} moment{wins === 1 ? "" : "s"} resolved</span>
          </div>
          <h2 style={{ color: C.darkText, fontFamily: DISPLAY, fontWeight: 400, fontSize: 30, marginBottom: 10 }}>The scripts are working.</h2>
          <p style={{ color: C.darkMuted, fontSize: 14, lineHeight: 1.6, maxWidth: 360, marginInline: "auto" }}>You've de-escalated {wins} moment{wins === 1 ? "" : "s"} using these scripts. Ready to understand the patterns beneath the behaviors so you need the scripts less?</p>
        </div>
        <div className="rc-rise" style={{ animationDelay: ".08s", background: C.darkSurface, borderRadius: 18, padding: "22px", border: `1px solid ${C.darkLine}`, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: AFFIRM, marginBottom: 10 }}>The next step</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 22, color: C.darkText, marginBottom: 14 }}>Behavior Decoder Workbook</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
            {[
              "Map every behavior to the nervous system state driving it",
              "5-Day Tracker to identify your child's patterns",
              "Build your child's unique State Signature",
              "AI-powered Pattern Analyzer and Signature Coach",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, borderRadius: 3, background: AFFIRM, flexShrink: 0, marginTop: 7 }} />
                <span style={{ fontSize: 13, color: C.darkMuted, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 28, color: C.darkText, marginBottom: 16 }}>$49</div>
          <a href="https://regulatedchild.com/workbook" target="_blank" rel="noopener" style={{ display: "block", width: "100%", padding: "15px", borderRadius: 12, border: "none", background: C.brand, color: "white", fontSize: 15, fontWeight: 600, fontFamily: UI, cursor: "pointer", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>Get the Workbook</a>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBrowse} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1px solid ${C.darkLine}`, background: "transparent", color: C.darkMuted, fontSize: 13, fontFamily: UI, cursor: "pointer" }}>Browse scripts</button>
          <button onClick={onDismiss} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1px solid ${C.darkLine}`, background: "transparent", color: C.darkMuted, fontSize: 13, fontFamily: UI, cursor: "pointer" }}>Not right now</button>
        </div>
      </div>
    </div>
  );
}

/* ── Emergency mode (warm-dark) ────────────────────────────────────── */
function Emergency({ onBack, wins, onWin, onBrowse }) {
  const [catId, setCatId] = useState(null);
  const [feedback, setFeedback] = useState(null); // null | "ask" | "upsell"

  if (feedback === "upsell") {
    return <WinUpsell wins={wins} onDismiss={() => { setFeedback(null); setCatId(null); }} onBrowse={() => { setFeedback(null); onBrowse(); }} />;
  }

  if (feedback === "ask" && catId) {
    const cat = categories.find(c => c.id === catId);
    return <DidThisHelp cat={cat} wins={wins} onYes={() => {
      const newWins = wins + 1;
      onWin();
      if (newWins >= 3 && newWins % 3 === 0) {
        setFeedback("upsell");
      } else {
        setFeedback(null);
        setCatId(null);
      }
    }} onNo={() => { setFeedback(null); setCatId(null); }} />;
  }

  const StatusBar = ({ right }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "oklch(0.62 0.21 25)", animation: "pulse 1.5s infinite" }} />
        <span style={{ color: "oklch(0.75 0.10 30)", fontSize: 11, fontWeight: 600, letterSpacing: ".14em" }}>IN-THE-MOMENT MODE</span>
      </div>
      {right}
    </div>
  );

  if (catId) {
    const cat = categories.find(c => c.id === catId);
    return (
      <div style={{ minHeight: "100vh", background: C.dark, fontFamily: UI, padding: "20px" }}>
        <FontLink />
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <StatusBar right={
            <button onClick={() => setCatId(null)} style={{ background: "none", border: `1px solid ${C.darkLine}`, color: C.darkMuted, borderRadius: 16, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: UI }}>{"←"} Back</button>
          } />
          <div className="rc-rise" style={{ color: cat.color, fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>{cat.label}</div>
          <p className="rc-rise" style={{ animationDelay: ".05s", color: C.darkMuted, fontSize: 13.5, lineHeight: 1.55, marginBottom: 24 }}>{cat.intro}</p>
          {cat.scripts.map((s, i) => (
            <div key={s.num} className="rc-rise" style={{ animationDelay: `${0.1 + i * 0.06}s`, background: C.darkSurface, borderRadius: 16, padding: "20px 22px", marginBottom: 12, border: `1px solid ${C.darkLine}` }}>
              <div style={{ fontSize: 11, color: cat.color, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>{s.situation}</div>
              <p style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(22px, 6vw, 27px)", color: C.darkText, lineHeight: 1.32, margin: "0 0 12px" }}>{s.script}</p>
              <p style={{ fontSize: 12.5, color: C.darkMuted, lineHeight: 1.55, margin: 0 }}>{s.note}</p>
            </div>
          ))}
          <button onClick={() => setFeedback("ask")} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: AFFIRM_BG, color: AFFIRM, fontSize: 14, fontWeight: 600, fontFamily: UI, cursor: "pointer", marginTop: 8 }}>I used a script — did it help?</button>
          <button onClick={onBack} style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${C.darkLine}`, background: "transparent", color: C.darkMuted, fontSize: 13, fontFamily: UI, cursor: "pointer", marginTop: 8 }}>Back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.dark, fontFamily: UI, padding: "20px" }}>
      <FontLink />
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <StatusBar right={
          <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.darkLine}`, color: C.darkMuted, borderRadius: 16, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: UI }}>Exit</button>
        } />
        <h2 className="rc-rise" style={{ color: C.darkText, fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7vw, 34px)", lineHeight: 1.1, marginBottom: 8 }}>What's happening right now?</h2>
        <p className="rc-rise" style={{ animationDelay: ".05s", color: C.darkMuted, fontSize: 13.5, marginBottom: 22 }}>Tap the situation. Get the script.</p>
        {categories.map((cat, i) => (
          <button key={cat.id} onClick={() => setCatId(cat.id)} className="rc-rise" style={{ animationDelay: `${0.08 + i * 0.04}s`, width: "100%", background: C.darkSurface, border: `1px solid ${C.darkLine}`, borderRadius: 14, padding: "16px 18px", marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
            <div style={{ width: 38, height: 38, borderRadius: 19, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 9, height: 9, borderRadius: 5, background: cat.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 18, color: C.darkText, marginBottom: 1 }}>{cat.label}</div>
              <div style={{ fontSize: 12, color: C.darkMuted }}>{cat.scripts.length} scripts</div>
            </div>
          </button>
        ))}
        {wins > 0 && (
          <div style={{ textAlign: "center", marginTop: 14, padding: "10px", borderRadius: 12, background: AFFIRM_BG }}>
            <span style={{ color: AFFIRM, fontSize: 12, fontWeight: 500 }}>{wins} moment{wins === 1 ? "" : "s"} resolved with these scripts</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Browse mode ───────────────────────────────────────────────────── */
function Browse({ onBack, favorites, onToggleFav }) {
  const [filter, setFilter] = useState(null);
  const [tab, setTab] = useState("all");

  const displayScripts = tab === "favorites"
    ? allScripts.filter(s => favorites.includes(s.num))
    : filter ? allScripts.filter(s => s.catId === filter) : allScripts;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.line}`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", color: C.brand, fontSize: 13, fontWeight: 600, fontFamily: UI, cursor: "pointer" }}>{"←"} Home</button>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <ArcLogo size={20} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: C.brand, textTransform: "uppercase" }}>Scripts Pack</span>
            </div>
            <button onClick={() => onBack("emergency")} style={{ background: C.dark, color: C.darkText, border: "none", borderRadius: 16, padding: "6px 13px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: UI }}>{"△"} Now</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button onClick={() => setTab("all")} style={{ padding: "7px 15px", borderRadius: 10, border: "none", background: tab === "all" ? C.brand : "oklch(0.93 0.025 300)", color: tab === "all" ? "#fff" : C.brand, fontFamily: UI, fontWeight: 600, fontSize: 12, cursor: "pointer", transition: `all .25s ${EASE}` }}>All ({allScripts.length})</button>
            <button onClick={() => setTab("favorites")} style={{ padding: "7px 15px", borderRadius: 10, border: "none", background: tab === "favorites" ? C.brand : "oklch(0.93 0.025 300)", color: tab === "favorites" ? "#fff" : C.brand, fontFamily: UI, fontWeight: 600, fontSize: 12, cursor: "pointer", transition: `all .25s ${EASE}` }}>{"★"} Saved ({favorites.length})</button>
          </div>
          {tab === "all" && (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
              <button onClick={() => setFilter(null)} style={{ padding: "6px 13px", borderRadius: 8, border: `1.5px solid ${!filter ? C.brand : C.line}`, background: !filter ? "oklch(0.93 0.025 300)" : C.surface, color: !filter ? C.brand : C.muted, fontSize: 11, fontWeight: 600, fontFamily: UI, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>All</button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setFilter(cat.id)} style={{ padding: "6px 13px", borderRadius: 8, border: `1.5px solid ${filter === cat.id ? cat.color : C.line}`, background: filter === cat.id ? cat.bg : C.surface, color: filter === cat.id ? cat.color : C.muted, fontSize: 11, fontWeight: 600, fontFamily: UI, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{cat.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 60px" }}>
        {displayScripts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{tab === "favorites" ? "No favorites saved yet. Tap the star on any script to save it here." : "No scripts match this filter."}</p>
          </div>
        ) : (
          displayScripts.map(s => <ScriptCard key={s.num} s={s} isFav={favorites.includes(s.num)} onToggleFav={onToggleFav} showCat={!filter} />)
        )}
        <div style={{ background: "oklch(0.93 0.025 300)", borderRadius: 16, padding: "20px", marginTop: 18, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: C.muted, margin: "0 0 6px" }}>Want the full nervous system framework?</p>
          <p style={{ fontSize: 13.5, color: C.text, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>Comment <strong style={{ color: C.brand }}>REGULATE</strong> on @regulatedchild · Visit <strong style={{ color: C.brand }}>regulatedchild.com</strong></p>
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <ArcLogo size={20} />
            <a href="https://www.tiktok.com/@regulatedchild" target="_blank" rel="noopener" style={{ fontSize: 13, color: C.brand, textDecoration: "none", fontWeight: 600, fontFamily: UI }}>@regulatedchild</a>
          </div>
          <p style={{ fontSize: 11, color: C.cite, fontStyle: "italic" }}>Educational content, not clinical advice. © The Regulated Child · regulatedchild.com</p>
        </div>
      </div>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────────── */
export default function ScriptsPack() {
  const [screen, setScreen] = useState(() => isSubscribed("scripts") ? "app" : "gate");
  const [mode, setMode] = useState("home");
  const [favorites, setFavorites] = useState([]);
  const [wins, setWins] = useState(() => {
    try { const s = window.storage?.get("rc-script-wins"); return 0; } catch { return 0; }
  });

  // Load wins from storage on mount
  useState(() => {
    (async () => {
      try { const r = await window.storage?.get("rc-script-wins"); if (r?.value) setWins(parseInt(r.value) || 0); } catch {}
    })();
  });

  const addWin = () => {
    const n = wins + 1;
    setWins(n);
    try { window.storage?.set("rc-script-wins", String(n)); } catch {}
  };

  const toggleFav = (num) => setFavorites(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);

  if (screen === "gate") return <Gate onSubmit={() => setScreen("app")} />;

  if (mode === "emergency") return <Emergency onBack={() => setMode("home")} wins={wins} onWin={addWin} onBrowse={() => setMode("browse")} />;
  if (mode === "browse") return <Browse onBack={(m) => setMode(m || "home")} favorites={favorites} onToggleFav={toggleFav} />;
  return <Home onMode={setMode} />;
}
