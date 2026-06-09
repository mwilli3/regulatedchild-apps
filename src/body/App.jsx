import { useState, useEffect, useRef } from "react";
import { subscribeFree, isSubscribed, getSubscribed } from "../lib/subscribeFree.js";

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

// The three nervous-system states.
const STATE = {
  ventral: { solid: "oklch(0.50 0.04 150)", tint: "oklch(0.94 0.02 150)" },
  sympathetic: { solid: "oklch(0.53 0.12 40)", tint: "oklch(0.945 0.035 42)" },
  dorsal: { solid: "oklch(0.45 0.07 300)", tint: "oklch(0.93 0.025 300)" },
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

/* ── Arc motif: logo, ring progress, arc field ────────────────────── */
const ArcLogo = ({ size = 40 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
    <path d="M100 22 A78 78 0 0 1 178 100" stroke="oklch(0.53 0.12 40)" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M178 100 A78 78 0 0 1 100 178" stroke="oklch(0.68 0.09 44)" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M100 178 A78 78 0 0 1 22 100" stroke="oklch(0.45 0.07 300)" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M22 100 A78 78 0 0 1 100 22" stroke="oklch(0.53 0.12 40)" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.32" />
    <circle cx="100" cy="100" r="16" fill="oklch(0.53 0.12 40)" />
  </svg>
);

// Circular arc progress — replaces the segmented bar.
const ArcRing = ({ value, total, color, size = 46 }) => {
  const r = 20, cx = 24, cy = 24;
  const circ = 2 * Math.PI * r;
  const frac = Math.min(value / total, 1);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.line} strokeWidth="4" />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - frac)}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: `stroke-dashoffset .55s ${EASE}` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: UI, fontSize: 12, fontWeight: 600, color: C.text,
      }}>{value}<span style={{ color: C.muted, fontWeight: 500 }}>/{total}</span></div>
    </div>
  );
};

// Big faint arc field used as calm background texture.
const ArcField = ({ color, style }) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, ...style }} aria-hidden="true">
    <path d="M40 360 A320 320 0 0 1 360 40" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M90 360 A270 270 0 0 1 360 90" stroke={color} strokeWidth="2" fill="none" opacity="0.32" />
    <path d="M150 360 A210 210 0 0 1 360 150" stroke={color} strokeWidth="2" fill="none" opacity="0.18" />
  </svg>
);

/* ── Content (unchanged copy, data, citations) ────────────────────── */
const sections = [
  {
    id: "states", num: "01", label: "Section one",
    title: "Your child’s nervous system lives in three states",
    subtitle: "— and behavior is a window into which state they’re in.",
    blocks: [
      { type: "body", text: "Polyvagal Theory, developed by neuroscientist Stephen Porges, describes three distinct neural circuits that govern how human beings — including children — engage with the world around them. Understanding these three states is the foundation of everything that follows in this guide." },
      { type: "states", items: [
        { name: "Ventral vagal", aka: "Safe & connected", state: "ventral", icon: "○", body: "Your child is within their window of tolerance. They can learn, play, problem-solve, respond to your requests, and connect with you. This is the state where strategies, conversations, and consequences can actually land." },
        { name: "Sympathetic activation", aka: "Fight or flight", state: "sympathetic", icon: "△", body: "The nervous system has detected threat — real, perceived, or sensory. Cortisol and adrenaline are released. Heart rate rises, muscles tighten, breathing shallows. Your child becomes rigid, loud, impulsive, or aggressive. This looks like defiance. It is physiology." },
        { name: "Dorsal vagal", aka: "Shutdown & freeze", state: "dorsal", icon: "▽", body: "The nervous system has moved beyond fight-or-flight into collapse. Your child shuts down, goes quiet, refuses to engage, dissociates. This looks like indifference or manipulation. It is the body’s last-resort self-protection response." },
      ]},
      { type: "callout", text: "Children cycle through all three states multiple times per day. Transitions, hunger, fatigue, sensory input, and social stress all trigger state shifts. The behavior you see — the meltdown, the shutdown, the refusal — is a display of which state the nervous system is currently in. Once you can name the state, you know what intervention is actually available." },
      { type: "cite", text: "Porges, S.W. (2011). The Polyvagal Theory. W.W. Norton. | Siegel, D.J. (1999). The Developing Mind. Guilford Press." },
    ],
  },
  {
    id: "window", num: "02", label: "Section two",
    title: "Your child has a window of tolerance — and it’s narrower than yours",
    subtitle: "— and most of what looks like behavior problems happens outside it.",
    blocks: [
      { type: "body", text: "The window of tolerance, a concept developed by psychiatrist and neuroscientist Daniel Siegel, describes the zone of nervous system arousal within which a person can function effectively. Inside the window, the child can think, learn, regulate their emotions, and respond to the people around them. Outside the window — either too activated (sympathetic) or too shut down (dorsal vagal) — none of those things are fully available." },
      { type: "body", text: "Here is what parents need to understand: children’s windows of tolerance are developmentally narrower than adult windows. The prefrontal cortex — the part of the brain responsible for emotional regulation, impulse control, and executive function — is not fully developed until approximately age 25. A child is not choosing a narrow window. They are working with an immature regulatory system that is still under construction." },
      { type: "window-visual" },
      { type: "subhead", text: "What narrows the window further" },
      { type: "body", text: "A child’s window of tolerance is further compressed by: hunger, fatigue, illness, sensory overload, social stress, transitions, and accumulated demands — including the demands of regulating behavior at school all day. By 3:30pm, many children have very little window left. The after-school dysregulation that seems to come from nowhere is not random — it is a depleted window meeting the first unstructured moment of the day." },
      { type: "callout", text: "Bruce McEwen’s research on allostatic load documents how the cumulative burden of stress narrows regulatory capacity over time. A child who has managed nine hours of school-day demands arrives home with significantly diminished resources for regulation — even if no single event at school was acutely stressful. The window shrinks under accumulated load, not just acute threat." },
      { type: "cite", text: "Siegel, D.J. (1999). The Developing Mind. Guilford Press. | McEwen, B.S. (1998). Stress, adaptation, and disease. Annals of the New York Academy of Sciences, 840(1), 33–44." },
    ],
  },
  {
    id: "calm", num: "03", label: "Section three",
    title: "The brain cannot calm down on command",
    subtitle: "— not because your child won’t, but because the architecture of the brain during stress makes it neurobiologically impossible.",
    blocks: [
      { type: "body", text: "This is one of the most important — and most misunderstood — facts in child development. When a child is in sympathetic or dorsal vagal activation, the prefrontal cortex goes offline. This is not a metaphor. Neuroimaging research consistently shows reduced prefrontal cortical activity and heightened amygdala response during stress activation." },
      { type: "highlight", text: "The amygdala — the brain’s threat-detection center — does not have a language processing center. It processes threat signals: tone of voice, proximity, volume, facial expression. When you tell a dysregulated child to calm down, their amygdala receives the volume and urgency of your instruction as an additional threat signal before the meaning of the words is processed. This is why ‘calm down’ so reliably escalates rather than de-escalates." },
      { type: "subhead", text: "What the brain can do" },
      { type: "body", text: "What can reach a dysregulated nervous system? Prosodic cues — the rhythm, tone, and emotional content of the adult’s voice. Research on therapeutic vocal use in trauma-informed care consistently identifies vocal presence, not verbal instruction, as the primary regulatory tool. A slow, low, soft voice signals safety before a single word is processed. The tone is the first intervention." },
      { type: "callout", text: "Daniel Siegel and Tina Payne Bryson describe the prefrontal cortex as the ‘upstairs brain’ — responsible for regulation, empathy, planning, and logic. During stress activation, the ‘downstairs brain’ (amygdala and brainstem) takes over, and the upstairs brain goes temporarily offline. A child cannot access what isn’t available. Waiting for regulation before attempting reasoning is not permissiveness — it is neurobiological accuracy." },
      { type: "cite", text: "Perry, B.D. & Szalavitz, M. (2006). The Boy Who Was Raised as a Dog. Basic Books. | van der Kolk, B. (2014). The Body Keeps the Score. Viking. | Siegel, D.J. & Bryson, T.P. (2011). The Whole-Brain Child. Bantam Books." },
    ],
  },
  {
    id: "communication", num: "04", label: "Section four",
    title: "Every behavior is trying to communicate something",
    subtitle: "— and the behavior is always the last thing that happens, not the first.",
    blocks: [
      { type: "body", text: "Behavior does not emerge from nowhere. It emerges from a body that is trying to solve a problem — usually a problem of regulation, sensory processing, or unmet need. The foundational research on the function of behavior established that all behavior serves a purpose from the perspective of the person engaging in it." },
      { type: "body", text: "Through a nervous system lens, the behavior you see is the end of a sequence that began in the body, often long before the visible behavior peaked. The tantrum that appears to come from nowhere began with a narrowing window of tolerance — reduced sensory tolerance, increased irritability, less flexibility — that the parent may not have noticed because the signals were subtle." },
      { type: "subhead", text: "Reading the behavior as a message" },
      { type: "highlight", text: "The behavior is the body’s best available solution to a problem it does not yet have the words for. A child who throws something during homework is not making a choice to misbehave. Their nervous system has reached capacity for the cognitive demand of task initiation, and the throw is the body’s attempt to release the activation. The intervention that addresses the behavior without addressing the underlying state will not produce lasting change." },
      { type: "body", text: "This reframe — from ‘what is wrong with my child’ to ‘what is this body trying to communicate’ — is the most foundational shift this guide asks of you. It does not excuse behavior. It does not eliminate consequences. It changes the diagnostic question, which changes the intervention." },
      { type: "callout", text: "Interoception — the ability to sense the internal physiological state of the body — is increasingly recognized as the neurological foundation of emotional awareness. Many children who ‘don’t know’ what they’re feeling are giving an honest answer: they do not yet have access to the body signals that would tell them. The behavior erupts because the internal signal was never intercepted." },
      { type: "cite", text: "Carr, E.G. & Durand, V.M. (1985). Reducing behavior problems through functional communication training. JABA, 18(2), 111–126. | Craig, A.D. (2002). Interoception. Nature Reviews Neuroscience, 3(8), 655–666." },
    ],
  },
  {
    id: "coregulation", num: "05", label: "Section five",
    title: "The one thing that helps more than any strategy",
    subtitle: "— your regulated nervous system.",
    blocks: [
      { type: "body", text: "Co-regulation is the biological mechanism by which the immature nervous system of a child borrows regulation from the mature nervous system of a safe adult. This is not a soft or metaphorical concept — it is neurobiologically documented through research on attunement, the polyvagal theory of social engagement, and the developmental science of attachment." },
      { type: "highlight", text: "The child’s nervous system is designed to entrain to the nervous system of a co-regulator. When the co-regulator — you — is calm, connected, and present, the child’s nervous system has a biological signal to follow back toward the window of tolerance. When the co-regulator is dysregulated, the child’s nervous system has no signal to follow. In fact, it may entrain to the adult’s dysregulation, escalating further." },
      { type: "body", text: "This is why no strategy works consistently when the parent’s own nervous system is dysregulated. The scripts, the tools, the protocols in this guide — all of them work better when the adult’s nervous system is in the ventral vagal state. None of them work well when it is not." },
      { type: "subhead", text: "This is not about being perfect" },
      { type: "body", text: "Siegel and Hartzell’s research on rupture and repair offers an important counterpoint: it is not the absence of dysregulation that predicts a child’s healthy development — it is the quality of repairs. A parent who loses their window of tolerance and then repairs the rupture with honesty and reconnection is modeling something extraordinarily valuable: that nervous system dysregulation is survivable, that relationships can be restored after conflict, and that regulated adults do not abandon the relationship when they make mistakes." },
      { type: "callout", text: "Research on co-regulation consistently identifies the regulated adult as the primary intervention for childhood dysregulation — before strategies, before scripts, before environmental changes. Allan Schore’s work on affect regulation documents how the parent’s right-hemisphere emotional communication directly shapes the developing regulatory systems of the child’s brain. Your nervous system is not background. It is the intervention." },
      { type: "cite", text: "Porges, S.W. (2011). The Polyvagal Theory. W.W. Norton. | Schore, A.N. (2003). Affect Regulation and the Repair of the Self. W.W. Norton. | Siegel, D.J. & Hartzell, M. (2003). Parenting from the Inside Out. Guilford Press." },
    ],
  },
];

/* ── Window of tolerance diagram — three stacked zones, no stripes ── */
function WindowVisual() {
  const Zone = ({ tint, solid, kicker, line, big }) => (
    <div style={{
      background: tint, padding: big ? "22px 22px 24px" : "16px 22px", textAlign: "center",
    }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: solid, marginBottom: 5 }}>{kicker}</div>
      <div style={{ fontFamily: UI, fontSize: 14, color: C.text, lineHeight: 1.4 }}>{line}</div>
      {big && (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12, maxWidth: 280, margin: "18px auto 0" }}>
          {[
            { label: "Adult window", s: 1, c: STATE.ventral.solid },
            { label: "Child’s window", s: 0.52, c: STATE.sympathetic.solid },
          ].map((r) => (
            <div key={r.label} style={{ textAlign: "left" }}>
              <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 5 }}>{r.label}</div>
              <div style={{ height: 7, background: C.line, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "100%", background: r.c, borderRadius: 4, transformOrigin: "left", transform: `scaleX(${r.s})`, transition: `transform .6s ${EASE}` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <figure style={{ margin: "26px 0", borderRadius: 18, overflow: "hidden", border: `1px solid ${C.line}` }}>
      <Zone tint={STATE.sympathetic.tint} solid={STATE.sympathetic.solid} kicker="Above the window" line="Sympathetic hyperarousal — fight / flight" />
      <Zone tint={STATE.ventral.tint} solid={STATE.ventral.solid} kicker="Window of tolerance" line="Can learn, reason, process, connect" big />
      <Zone tint={STATE.dorsal.tint} solid={STATE.dorsal.solid} kicker="Below the window" line="Dorsal vagal hypoarousal — freeze / shutdown" />
    </figure>
  );
}

/* ── Expandable state card — restyled, no stripes ─────────────────── */
function StateCard({ s, delay }) {
  const [open, setOpen] = useState(false);
  const c = STATE[s.state];
  return (
    <div className="rc-rise" style={{ animationDelay: delay }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
        padding: "16px 18px", borderRadius: open ? "16px 16px 0 0" : 16, fontFamily: UI,
        background: open ? c.tint : C.surface, border: `1.5px solid ${open ? c.solid : C.line}`,
        borderBottom: open ? "none" : `1.5px solid ${open ? c.solid : C.line}`,
        transition: `background .25s ${EASE}, border-color .25s ${EASE}`,
      }}>
        <span style={{
          flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: c.solid, color: "white",
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 16,
        }}>{s.icon}</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 600, color: C.text }}>{s.name}</span>
          <span style={{ display: "block", fontSize: 12.5, color: C.muted }}>{s.aka}</span>
        </span>
        <span style={{ fontSize: 16, color: c.solid, transform: open ? "rotate(180deg)" : "none", transition: `transform .25s ${EASE}` }}>{"▾"}</span>
      </button>
      {open && (
        <div style={{ padding: "16px 18px", background: C.surface, border: `1.5px solid ${c.solid}`, borderTop: "none", borderRadius: "0 0 16px 16px" }}>
          <p style={{ fontFamily: UI, fontSize: 14.5, color: C.text, lineHeight: 1.62, margin: 0 }}>{s.body}</p>
        </div>
      )}
    </div>
  );
}

/* ── Block renderer ───────────────────────────────────────────────── */
function Block({ b, delay }) {
  if (b.type === "body")
    return <p className="rc-rise" style={{ animationDelay: delay, fontFamily: UI, fontSize: 16, fontWeight: 400, color: C.text, lineHeight: 1.62, margin: "0 0 18px", maxWidth: "64ch" }}>{b.text}</p>;

  if (b.type === "subhead")
    return <h3 className="rc-rise" style={{ animationDelay: delay, fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(20px, 5.2vw, 24px)", color: C.text, margin: "30px 0 12px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>{b.text}</h3>;

  if (b.type === "states")
    return <div className="rc-rise" style={{ animationDelay: delay, display: "flex", flexDirection: "column", gap: 10, margin: "22px 0" }}>{b.items.map((s, i) => <StateCard key={s.name} s={s} delay={`${0.05 + i * 0.06}s`} />)}</div>;

  if (b.type === "window-visual")
    return <div className="rc-rise" style={{ animationDelay: delay }}><WindowVisual /></div>;

  // Highlight → tinted block with an oversized Young Serif quote glyph (no side stripe).
  if (b.type === "highlight")
    return (
      <div className="rc-rise" style={{ animationDelay: delay, position: "relative", background: STATE.sympathetic.tint, borderRadius: 18, padding: "30px 26px 28px", margin: "24px 0", overflow: "hidden" }}>
        <span aria-hidden="true" style={{ position: "absolute", top: -14, left: 14, fontFamily: DISPLAY, fontSize: 110, lineHeight: 1, color: C.terracotta, opacity: 0.16 }}>“</span>
        <p style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(17px, 4.4vw, 20px)", lineHeight: 1.46, margin: 0, color: C.text }}>{b.text}</p>
      </div>
    );

  // Callout → full hairline-bordered tinted block (no stripe).
  if (b.type === "callout")
    return (
      <div className="rc-rise" style={{ animationDelay: delay, background: C.surface, borderRadius: 16, padding: "20px 22px", margin: "24px 0", border: `1px solid ${C.line}` }}>
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand, marginBottom: 9 }}>Research foundation</div>
        <p style={{ fontFamily: UI, fontSize: 14.5, color: C.text, lineHeight: 1.62, margin: 0, maxWidth: "62ch" }}>{b.text}</p>
      </div>
    );

  if (b.type === "cite")
    return <p className="rc-rise" style={{ animationDelay: delay, fontFamily: UI, fontSize: 11.5, fontStyle: "italic", color: C.cite, margin: "20px 0 0", paddingTop: 16, borderTop: `1px solid ${C.line}`, lineHeight: 1.6 }}>{b.text}</p>;

  return null;
}

/* ── Screens ──────────────────────────────────────────────────────── */
function Gate({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const ok = email.includes("@") && email.includes(".");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    if (!ok || submitting) return;
    setSubmitting(true); setError("");
    const res = await subscribeFree({ app: "body", name: name.trim(), email: email.trim() });
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
          The Body Behind The Behavior
        </p>
        <h1 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(38px, 11vw, 60px)", lineHeight: 1.04, letterSpacing: "-0.01em", margin: "0 0 20px" }}>
          The Body Behind The Behavior
        </h1>
        <p className="rc-rise" style={{ animationDelay: ".18s", fontSize: 17, color: C.muted, lineHeight: 1.6, margin: "0 0 clamp(32px, 9vw, 48px)", maxWidth: "34ch" }}>
          The nervous system science every parent needs — five things that change how you see your child’s behavior.
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
          }}>{submitting ? "Sending…" : "Start the guide"}</button>
          {error && <p style={{ marginTop: 14, fontSize: 13, color: C.brand, lineHeight: 1.5 }}>{error}</p>}
        </div>

        <p className="rc-rise" style={{ animationDelay: ".3s", fontSize: 13, color: C.muted, marginTop: 30, paddingTop: 24, borderTop: `1px solid ${C.line}`, fontWeight: 500 }}>
          Research-cited · No fluff · Read in under 10 minutes
        </p>
      </div>
    </div>
  );
}

function Intro({ name, onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text, position: "relative", overflow: "hidden" }}>
      <FontLink />
      <div style={{ position: "absolute", bottom: "-26%", left: "-30%", width: "88vw", maxWidth: 520, height: "88vw", maxHeight: 520, pointerEvents: "none", opacity: 0.7 }}>
        <ArcField color={C.terracotta} />
      </div>
      <div style={{ position: "relative", maxWidth: 520, margin: "0 auto", padding: "clamp(28px, 9vw, 64px) 24px 56px" }}>
        <div className="rc-rise" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(36px, 11vw, 60px)" }}>
          <ArcLogo size={30} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand }}>The Regulated Child</span>
        </div>
        <p className="rc-rise" style={{ animationDelay: ".06s", fontSize: 12, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.terracotta, margin: "0 0 14px" }}>
          Welcome, {name}
        </p>
        <h2 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(30px, 8.5vw, 44px)", lineHeight: 1.08, letterSpacing: "-0.01em", margin: "0 0 28px" }}>
          A note before you begin
        </h2>

        <div className="rc-rise" style={{ animationDelay: ".18s", maxWidth: "62ch" }}>
          <p style={{ fontSize: 16, color: C.text, lineHeight: 1.62, margin: "0 0 16px" }}>If you have ever told a dysregulated child to calm down and watched it make things worse — you already know something important is happening in the body that no one has fully explained to you.</p>
          <p style={{ fontSize: 16, color: C.text, lineHeight: 1.62, margin: "0 0 16px" }}>This guide exists because the science that explains your child’s behavior lives in academic journals and clinical training programs — not in the places parents actually are when they need it most.</p>
          <p style={{ fontSize: 16, color: C.text, lineHeight: 1.62, margin: "0 0 16px" }}>What follows are <strong>five things every parent needs to know about their child’s nervous system</strong>. Each one is grounded in peer-reviewed research. Each one is written in plain language. And each one will change the way you see the behavior — because once you understand what’s happening in the body, you stop reacting to the behavior and start responding to the need.</p>
        </div>

        <div className="rc-rise" style={{ animationDelay: ".24s", background: C.surface, borderRadius: 16, padding: "20px 22px", margin: "8px 0 32px", border: `1px solid ${C.line}` }}>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>A note on scope: This guide is parent education — nervous system science translated for everyday use. It is not a clinical assessment, diagnosis, or therapeutic protocol. If you are navigating complex behavior, trauma history, or developmental concerns, please work alongside a licensed professional who knows your child.</p>
        </div>

        <button className="rc-rise" onClick={onStart} style={{
          animationDelay: ".3s", width: "100%", padding: "17px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600,
          fontFamily: UI, background: C.brand, color: "white", cursor: "pointer", letterSpacing: ".01em",
        }}>Begin the guide</button>
      </div>
    </div>
  );
}

function Done() {
  const links = [
    { title: "Behavior Decoder", desc: "A one-page visual mapping common behaviors to the nervous system state driving them. Comment DECODE on @regulatedchild.", label: "Decode" },
    { title: "Co-Regulation Guide", desc: "The five-step co-regulation protocol with scripts for each step. Comment REGULATE on @regulatedchild.", label: "Regulate" },
    { title: "In-the-Moment Scripts Pack", desc: "20 specific phrases and protocols for the most common dysregulation patterns. Comment SCRIPTS on @regulatedchild.", label: "Scripts" },
    { title: "The Regulated Child Course", desc: "The complete six-pillar framework. Visit regulatedchild.com", label: "Course" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />
      <header style={{ background: STATE.ventral.tint, position: "relative", overflow: "hidden", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ position: "absolute", bottom: "-46%", left: "-24%", width: "70vw", maxWidth: 380, height: "70vw", maxHeight: 380, opacity: 0.7, pointerEvents: "none" }}>
          <ArcField color={STATE.ventral.solid} />
        </div>
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto", padding: "20px 24px 44px" }}>
          <div className="rc-rise" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: "clamp(28px, 9vw, 48px)" }}>
            <ArcLogo size={24} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: STATE.ventral.solid }}>Guide complete</span>
          </div>
          <h1 className="rc-rise" style={{ animationDelay: ".1s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(32px, 9vw, 48px)", lineHeight: 1.06, letterSpacing: "-0.01em", margin: "0 0 14px" }}>
            You see your child differently now.
          </h1>
          <p className="rc-rise" style={{ animationDelay: ".16s", fontSize: 16.5, color: C.text, opacity: 0.8, lineHeight: 1.55, margin: 0, maxWidth: "40ch" }}>
            You now have the five neurobiological foundations that explain your child’s behavior. These are not tips or techniques — they are a framework. Once you see behavior through this lens, it becomes difficult to unsee.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "clamp(36px, 10vw, 56px) 24px 64px" }}>
        <p className="rc-rise" style={{ fontSize: 16, color: C.text, lineHeight: 1.62, margin: "0 0 clamp(40px, 11vw, 56px)", maxWidth: "60ch" }}>
          That shift in perception is the beginning of everything else.
        </p>

        <section style={{ marginBottom: "clamp(40px, 11vw, 56px)" }}>
          <p className="rc-rise" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand, margin: "0 0 6px" }}>If you want to go deeper</p>
          <div>
            {links.map((c, i) => (
              <div key={i} className="rc-rise" style={{ animationDelay: `${0.05 + i * 0.05}s`, display: "flex", gap: 16, alignItems: "baseline", padding: "20px 0", borderTop: `1px solid ${C.line}` }}>
                <span style={{ flexShrink: 0, fontFamily: DISPLAY, fontSize: 24, lineHeight: 1, color: C.brand, width: "1.6ch" }}>{i + 1}</span>
                <div>
                  <h3 style={{ fontFamily: UI, fontSize: 16.5, fontWeight: 600, color: C.text, margin: "2px 0 5px", lineHeight: 1.3 }}>{c.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, margin: 0, maxWidth: "58ch" }}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ textAlign: "center", paddingTop: 8 }}>
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
export default function BodyBehindBehavior() {
  const [screen, setScreen] = useState(() => isSubscribed("body") ? "intro" : "gate");
  const [userName, setUserName] = useState(() => getSubscribed("body")?.name || "there");
  const [step, setStep] = useState(0);
  const ref = useRef(null);

  useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  if (screen === "gate") return <Gate onSubmit={n => { setUserName(n); setScreen("intro"); }} />;
  if (screen === "intro") return <Intro name={userName} onStart={() => setScreen("guide")} />;
  if (screen === "complete") return <Done />;

  const sec = sections[step];
  const last = step === sections.length - 1;
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />
      <header style={{ padding: "16px 20px", background: C.surface, borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <ArcLogo size={26} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand }}>The Body Behind The Behavior</span>
          </div>
          <ArcRing value={step + 1} total={sections.length} color={C.brand} />
        </div>
      </header>

      <main ref={ref} key={step} style={{ flex: 1, overflowY: "auto", padding: "clamp(28px, 8vw, 52px) 20px 150px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p className="rc-rise" style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.terracotta, margin: "0 0 14px" }}>{sec.label}</p>
          <h2 className="rc-rise" style={{ animationDelay: ".05s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(28px, 7.5vw, 40px)", lineHeight: 1.12, letterSpacing: "-0.01em", margin: "0 0 12px" }}>{sec.title}</h2>
          <p className="rc-rise" style={{ animationDelay: ".1s", fontFamily: UI, fontSize: 15.5, color: C.muted, lineHeight: 1.55, margin: "0 0 30px", fontStyle: "italic", maxWidth: "44ch" }}>{sec.subtitle}</p>
          {sec.blocks.map((b, i) => <Block key={i} b={b} delay={`${0.16 + i * 0.05}s`} />)}
        </div>
      </main>

      <footer style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px calc(16px + env(safe-area-inset-bottom))", background: C.surface, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", gap: 12 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{
              padding: "17px 22px", borderRadius: 14, border: `1.5px solid ${C.line}`, background: "transparent",
              fontSize: 15, fontWeight: 600, fontFamily: UI, color: C.muted, cursor: "pointer", transition: `all .3s ${EASE}`,
            }}>Back</button>
          )}
          <button onClick={() => last ? setScreen("complete") : setStep(step + 1)} style={{
            flex: 1, padding: "17px", borderRadius: 14, border: "none", background: C.brand, color: "white",
            fontSize: 16, fontWeight: 600, fontFamily: UI, cursor: "pointer", letterSpacing: ".01em", transition: `all .3s ${EASE}`,
          }}>{last ? "Complete the guide" : "Continue"}</button>
        </div>
      </footer>
    </div>
  );
}
