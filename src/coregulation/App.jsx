import { useState, useEffect, useRef } from "react";
import { subscribeFree, isSubscribed, getSubscribed } from "../lib/subscribeFree.js";

/* ── Design tokens (OKLCH, brand hues preserved) ───────────────────── */
const C = {
  text: "oklch(0.26 0.03 45)", muted: "oklch(0.50 0.02 55)", cite: "oklch(0.55 0.02 55)",
  bg: "oklch(0.975 0.008 70)", surface: "oklch(0.995 0.004 75)", line: "oklch(0.90 0.01 60)",
  brand: "oklch(0.53 0.12 40)", brandDark: "oklch(0.44 0.11 40)", terracotta: "oklch(0.53 0.12 40)",
};
const DISPLAY = "'Young Serif', serif";
const UI = "'Outfit', sans-serif";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const success = "oklch(0.50 0.04 150)";
const successTint = "oklch(0.94 0.02 150)";

// Body-state colors for the reference cards.
const STATE = {
  ventral: { solid: success, tint: successTint },
  sympathetic: { solid: "oklch(0.53 0.12 40)", tint: "oklch(0.945 0.035 42)" },
  dorsal: { solid: "oklch(0.45 0.07 300)", tint: "oklch(0.93 0.025 300)" },
};

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

/* ── Arc motif: logo, ring progress, faint field ──────────────────── */
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

/* ── Content (unchanged) ──────────────────────────────────────────── */
const sections = [
  {
    id: "science", label: "The science", title: "Why your nervous system is the intervention",
    subtitle: "Before the protocol, the foundation.",
    blocks: [
      { type: "body", text: "Understanding why co-regulation works is what makes it accessible under stress — when the instinct to lecture, warn, or withdraw is strong and the science is the only thing that can override it." },
      { type: "body", text: "Stephen Porges’ Polyvagal Theory describes a neural circuit called the social engagement system — the ventral vagal complex — that specifically governs our capacity to connect with and regulate other nervous systems. When this system is active in a caregiver, it broadcasts safety signals through voice tone, facial expression, eye contact, and physical proximity. The child’s nervous system is designed to read these signals continuously, using them to determine whether the environment is safe enough to return to baseline." },
      { type: "body", text: "Allan Schore’s research on affect regulation identifies this as the core mechanism of early development: the caregiver’s right hemisphere communicates directly with the infant’s right hemisphere through non-verbal signals, shaping the neural architecture of emotional regulation itself. This is not something that stops mattering in toddlerhood. Research across developmental stages consistently shows that the regulated adult remains the primary regulatory scaffold for children throughout childhood and into adolescence." },
      { type: "highlight", text: "The practical implication: the most efficient use of thirty seconds before you approach a dysregulated child is not to choose your words. It is to check and shift your own nervous system state. Everything you say will land differently depending on the state you are in when you say it." },
      { type: "callout", title: "The stress contagion effect", text: "Research on physiological synchrony documents that nervous systems in proximity entrain to one another — particularly in parent-child dyads with established attachment relationships. A dysregulated parent does not simply fail to help a dysregulated child. A dysregulated parent’s nervous system actively sends co-dysregulation signals that can escalate the child’s activation further. This is not a character flaw. It is a documented biological process that operates below conscious awareness." },
      { type: "cite", text: "Porges, S.W. (2011). The Polyvagal Theory. W.W. Norton. | Schore, A.N. (2003). Affect Regulation and the Repair of the Self. W.W. Norton. | Feldman, R. (2007). Parent-infant synchrony. Current Directions in Psychological Science, 16(6), 340–345." },
    ],
  },
  {
    id: "step1", label: "Step 1", title: "Check your own state",
    subtitle: "Before you approach your child, pause. Ten seconds.",
    blocks: [
      { type: "body", text: "Ask yourself: which state am I in right now? If you are in sympathetic activation — heart rate up, breathing shallow, jaw or shoulders tight, voice ready to rise — you are not yet in a position to co-regulate. A dysregulated adult approaching a dysregulated child does not reduce activation. It frequently increases it." },
      { type: "script", label: "Step 1 · The 10-second state check", text: "“I’m noticing my body before I go in. [Drop shoulders. Slow exhale. Soften face.] Okay.”" },
      { type: "why", text: "This is not for your child — it is for your nervous system. The physical acts of dropping shoulders, slowing the exhale, and softening facial tension activate the vagal brake and begin shifting autonomic balance toward parasympathetic. Ten seconds is enough to alter your physiological baseline measurably." },
      { type: "cite", text: "Porges, S.W. (2011). The Polyvagal Theory. W.W. Norton." },
    ],
  },
  {
    id: "step2", label: "Step 2", title: "Regulate yourself first",
    subtitle: "The intervention before the intervention.",
    blocks: [
      { type: "body", text: "If step 1 reveals you are outside your window of tolerance, step 2 is the intervention before the intervention. This does not require leaving the room or an extended practice. It requires one physiological shift — the kind that takes fifteen to thirty seconds." },
      { type: "highlight", text: "The most reliable single-breath tool is the physiological sigh: two inhales through the nose (the second inhale re-inflates partially collapsed alveoli), followed by one long exhale through the mouth. Research identifies this as the fastest available method for activating the parasympathetic nervous system and reducing subjective stress. It works in one breath." },
      { type: "script", label: "Step 2 · The regulating breath", text: "“[Double inhale through nose. Long exhale through mouth.] I’m regulated enough to go in.”" },
      { type: "why", text: "The extended exhale activates the vagal brake — the mechanism by which the parasympathetic nervous system slows heart rate. A longer exhale than inhale shifts autonomic balance measurably. The physiological sigh is particularly effective because it also clears CO₂ from the alveoli, reducing the physical urgency signal that accompanies stress activation." },
      { type: "cite", text: "Yuen, A.W.C. & Bhatt, D.L. (2022). Physiological sigh and respiratory function. Stanford Neuroscience Laboratory. | Huberman, A. (2021). Neural control of breathing and stress. Huberman Lab Podcast, Episode 9." },
    ],
  },
  {
    id: "step3", label: "Step 3", title: "Enter with your body, not your words",
    subtitle: "The amygdala processes tone before it processes content.",
    blocks: [
      { type: "body", text: "Your child’s amygdala is in threat mode. It is not processing language normally. It is processing tone, volume, proximity, and facial expression. The words you choose matter far less at this stage than the body you bring into the room." },
      { type: "body", text: "Research on the therapeutic use of voice in trauma-informed care consistently identifies vocal prosody — the rhythm, tone, and pace of speech — as the primary regulatory signal when language processing is impaired by activation. Slow, low, soft, and unhurried. Not a whisper. Not performatively calm. Genuinely unhurried." },
      { type: "script", label: "Step 3 · The safety signal", text: "“I’m here. I’m not going anywhere.” [Slow. Low. Soft. No urgency.]" },
      { type: "why", text: "These five words do three things simultaneously: they signal the presence of a safe adult (ventral vagal system activation in the child), they name the adult’s regulated state (providing a co-regulatory model), and they make no demands (removing additional cognitive load from an overwhelmed system). The amygdala processes the tone before it processes the content — the pacing of delivery is the mechanism, not the words." },
      { type: "cite", text: "Perry, B.D. & Szalavitz, M. (2006). The Boy Who Was Raised as a Dog. Basic Books. | van der Kolk, B. (2014). The Body Keeps the Score. Viking." },
    ],
  },
  {
    id: "step4", label: "Step 4", title: "Match before you lead",
    subtitle: "Attunement first. Then gradual return to baseline.",
    blocks: [
      { type: "body", text: "Co-regulation is not the suppression of your child’s activated state. It is a gradual return to baseline through the process of attunement followed by leading. Attunement first: meet the emotional reality of your child’s state before you attempt to shift it. This is the ‘match’ — a brief acknowledgment that the body’s experience is real and visible to you. Then lead: from your regulated state, gradually slow your own breathing, lower your voice further, reduce your movement. The child’s nervous system will begin to entrain." },
      { type: "highlight", text: "Daniel Siegel and Mary Hartzell describe attunement as the process of ‘feeling felt’ — the child’s nervous system recognising that its internal state has been perceived by a safe other. This recognition itself begins to downregulate the threat response, because connection signals safety. Without attunement, intervention feels like interruption, and the nervous system resists rather than follows." },
      { type: "script", label: "Step 4 · The attunement phrase", text: "“Your body is really activated right now. I can see it. I’m right here.”" },
      { type: "why", text: "This phrase names the physiological state (not the behavior, not the emotion label) without judgment. It communicates that the adult perceives the child’s internal experience — the core of attunement. It does not attempt to fix, stop, or redirect. It is a pure safety signal: I see you, I am not alarmed by you, I am staying." },
      { type: "cite", text: "Siegel, D.J. & Hartzell, M. (2003). Parenting from the Inside Out. Guilford Press. | Schore, A.N. (2003). Affect Regulation and the Repair of the Self. W.W. Norton." },
    ],
  },
  {
    id: "step5", label: "Step 5", title: "Wait for the window — then reconnect",
    subtitle: "The meltdown does not end when the screaming stops.",
    blocks: [
      { type: "body", text: "The physiological arc of a stress response — the metabolisation of cortisol and adrenaline — takes approximately 20 to 30 minutes after the peak. A child who has gone quiet may still be in recovery, not yet back in the window of tolerance. Teaching, consequence delivery, and repair conversations attempted before full recovery are processed as additional threat, not as learning." },
      { type: "body", text: "The signal that a child is back in the window of tolerance: they make eye contact, their breathing slows, their body posture softens, they initiate or respond to small social contact. This is the reconnection window. It is the right moment for a repair conversation — and the only moment when one is productive." },
      { type: "script", label: "Step 5 · The reconnection opener", text: "“I’m glad you’re back. I love you. We’re okay.” [After the window has opened — not before.]" },
      { type: "why", text: "Reconnection after rupture — the ‘repair’ in rupture-and-repair — is the single strongest predictor of secure attachment development, above the absence of ruptures. A child whose parent consistently repairs after dysregulation learns that relationships are resilient, that nervous system activation is survivable, and that the adult is reliable. These are the conditions under which self-regulation develops over time." },
      { type: "cite", text: "Tronick, E. (1989). Emotions and emotional communication in infants. American Psychologist, 44(2), 112–119. | Siegel, D.J. & Hartzell, M. (2003). Parenting from the Inside Out. Guilford Press." },
    ],
  },
  {
    id: "bodystates", label: "Body-states reference", title: "Your body-states reference",
    subtitle: "A quick check-in guide for your own nervous system before you approach your child.",
    blocks: [
      { type: "body", text: "You cannot reliably identify your child’s nervous system state if you have no practice identifying your own. This reference is a starting point. Use it before step 1 of the protocol until the state check becomes automatic." },
      { type: "state-ref", items: [
        { state: "Ventral vagal", sub: "Safe & connected", color: STATE.ventral.solid, bg: STATE.ventral.tint, feel: "Shoulders relaxed. Breathing easy. Voice at normal pace. Able to think clearly. Curious rather than reactive.", protocol: "You are ready to co-regulate. Proceed to Step 3. Your nervous system is in a state to broadcast safety signals." },
        { state: "Sympathetic", sub: "Fight or flight", color: STATE.sympathetic.solid, bg: STATE.sympathetic.tint, feel: "Jaw or shoulders tight. Heart rate elevated. Breathing shallow. Voice wants to rise. Impulse to lecture, warn, or take over.", protocol: "Do Step 2 before approaching. Physiological sigh, drop shoulders. Do not skip this. Your activated state will broadcast co-dysregulation." },
        { state: "Dorsal vagal", sub: "Shutdown", color: STATE.dorsal.solid, bg: STATE.dorsal.tint, feel: "Flat, numb, disconnected. Hard to care. Moving slowly. Want to leave the room or disappear. Nothing feels urgent.", protocol: "Movement helps more than breath here. A short walk, cold water on the face, or rhythmic movement before approaching. Then Step 2." },
      ]},
      { type: "cite", text: "Porges, S.W. (2011). The Polyvagal Theory. W.W. Norton. | Siegel, D.J. (1999). The Developing Mind. Guilford Press." },
    ],
  },
  {
    id: "repair", label: "The repair conversation", title: "What to do after you lose your own regulated state",
    subtitle: "It is not the absence of ruptures that predicts secure attachment. It is the quality of repairs.",
    blocks: [
      { type: "body", text: "Research by Edward Tronick on the still-face paradigm, extended by Siegel and Hartzell’s work on parenting and the brain, established something that takes enormous pressure off the pursuit of perfect parenting: it is not the absence of ruptures that predicts a child’s secure attachment. It is the quality of repairs." },
      { type: "body", text: "A parent who loses their window of tolerance, yells, says something they regret, or withdraws — and then repairs the relationship intentionally and honestly — is modeling something the child’s nervous system needs to learn: that dysregulation is survivable, that relationships can be restored, and that the adult is reliable even when imperfect." },
      { type: "subhead", text: "The three-part repair" },
      { type: "repair-steps" },
      { type: "callout", title: "When to have the repair conversation", text: "Not immediately after the dysregulation peak — neither nervous system is ready. Wait until both of you are clearly back in the window of tolerance: making eye contact, breathing normally, able to engage. The repair conversation takes approximately four minutes. Do not add a behavior correction to it. The repair is only about the relationship. Behavior correction is a separate conversation at a separate time. Combining them undermines both." },
      { type: "cite", text: "Tronick, E. (1989). Emotions and emotional communication in infants. American Psychologist, 44(2), 112–119. | Siegel, D.J. & Hartzell, M. (2003). Parenting from the Inside Out. Guilford Press." },
    ],
  },
];

/* ── Block renderer ───────────────────────────────────────────────── */
function Block({ b, i }) {
  const delay = `${0.05 + i * 0.05}s`;

  if (b.type === "body") return (
    <p className="rc-rise" style={{ animationDelay: delay, fontFamily: UI, fontSize: 16, color: C.text, lineHeight: 1.62, margin: "0 0 18px", maxWidth: "64ch" }}>{b.text}</p>
  );

  if (b.type === "subhead") return (
    <h3 className="rc-rise" style={{ animationDelay: delay, fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(20px, 5vw, 24px)", color: C.text, margin: "30px 0 14px", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{b.text}</h3>
  );

  // highlight → tinted block with oversized Young Serif quote glyph. No side stripe.
  if (b.type === "highlight") return (
    <div className="rc-rise" style={{ animationDelay: delay, position: "relative", background: STATE.sympathetic.tint, borderRadius: 18, padding: "28px 24px 26px", margin: "24px 0", overflow: "hidden" }}>
      <span aria-hidden="true" style={{ position: "absolute", top: -14, left: 14, fontFamily: DISPLAY, fontSize: 110, lineHeight: 1, color: C.terracotta, opacity: 0.16 }}>“</span>
      <p style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(17px, 4.6vw, 20px)", color: C.text, lineHeight: 1.45, margin: 0 }}>{b.text}</p>
    </div>
  );

  // callout → full hairline-bordered tinted block.
  if (b.type === "callout") return (
    <div className="rc-rise" style={{ animationDelay: delay, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: "22px 22px", margin: "24px 0" }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand, marginBottom: 10 }}>{b.title || "Research foundation"}</div>
      <p style={{ fontFamily: UI, fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0, maxWidth: "62ch" }}>{b.text}</p>
    </div>
  );

  // script → prominent Young Serif pull-quote, the heart of the app.
  if (b.type === "script") return (
    <div className="rc-rise" style={{ animationDelay: delay, position: "relative", background: STATE.dorsal.tint, borderRadius: 18, padding: "26px 24px 26px", margin: "26px 0", overflow: "hidden" }}>
      <span aria-hidden="true" style={{ position: "absolute", top: -18, left: 12, fontFamily: DISPLAY, fontSize: 128, lineHeight: 1, color: C.brand, opacity: 0.15 }}>“</span>
      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand, marginBottom: 14 }}>{b.label}</div>
        <p style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(21px, 5.6vw, 26px)", color: C.text, lineHeight: 1.34, margin: 0, letterSpacing: "-0.01em" }}>{b.text}</p>
      </div>
    </div>
  );

  // why → quiet subtly-tinted block.
  if (b.type === "why") return (
    <div className="rc-rise" style={{ animationDelay: delay, background: C.bg, borderRadius: 14, padding: "18px 18px", margin: "14px 0 22px", border: `1px solid ${C.line}` }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Why it works</div>
      <p style={{ fontFamily: UI, fontSize: 14.5, color: C.muted, lineHeight: 1.62, margin: 0, maxWidth: "62ch" }}>{b.text}</p>
    </div>
  );

  if (b.type === "cite") return (
    <p className="rc-rise" style={{ animationDelay: delay, fontFamily: UI, fontSize: 12, fontStyle: "italic", color: C.cite, margin: "20px 0 0", paddingTop: 16, borderTop: `1px solid ${C.line}`, lineHeight: 1.6 }}>{b.text}</p>
  );

  if (b.type === "state-ref") return (
    <div className="rc-rise" style={{ animationDelay: delay, display: "flex", flexDirection: "column", gap: 12, margin: "24px 0" }}>
      {b.items.map(s => <StateRefCard key={s.state} s={s} />)}
    </div>
  );

  if (b.type === "repair-steps") return <RepairSteps delay={delay} />;
  return null;
}

function StateRefCard({ s }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderRadius: 16, border: `1px solid ${open ? s.color : C.line}`, overflow: "hidden", cursor: "pointer", transition: `border-color .25s ${EASE}` }}>
      <div style={{ background: s.bg, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ flexShrink: 0, width: 11, height: 11, borderRadius: 6, background: s.color }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 19, color: C.text, lineHeight: 1.2 }}>{s.state}</div>
          <div style={{ fontFamily: UI, fontSize: 13, color: C.muted, fontWeight: 500 }}>{s.sub}</div>
        </div>
        <div style={{ fontFamily: UI, fontSize: 16, color: C.muted, transform: open ? "rotate(180deg)" : "rotate(0)", transition: `transform .25s ${EASE}` }}>{"▾"}</div>
      </div>
      {open && (
        <div className="rc-rise" style={{ animationDelay: "0s", padding: "18px 20px", background: C.surface }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.muted, marginBottom: 7 }}>What you feel in your body</div>
          <p style={{ fontFamily: UI, fontSize: 14.5, color: C.text, lineHeight: 1.6, margin: "0 0 16px" }}>{s.feel}</p>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: s.color, marginBottom: 7 }}>What this means for the protocol</div>
          <p style={{ fontFamily: UI, fontSize: 14.5, color: C.text, lineHeight: 1.6, margin: 0 }}>{s.protocol}</p>
        </div>
      )}
    </div>
  );
}

function RepairSteps({ delay }) {
  const steps = [
    { num: "1", title: "Acknowledge", text: "Name what happened from the nervous system’s perspective, not the behavior’s: “I got loud, and I shouldn’t have. My nervous system got overwhelmed.” This removes blame from either party and names the biological reality accurately." },
    { num: "2", title: "Explain without excusing", text: "“I was already stressed when that happened, and my body activated before I could catch it. That’s mine to work on — it’s not your fault.” This models self-awareness without using the explanation as a justification." },
    { num: "3", title: "Reconnect", text: "“I love you. We’re okay.” Physical contact if the child is receptive. Presence without agenda. The nervous system needs the confirmation that the relationship is intact before it can return to baseline." },
  ];
  return (
    <div className="rc-rise" style={{ animationDelay: delay, margin: "16px 0 22px" }}>
      {steps.map((s, i) => (
        <div key={s.num} style={{ display: "flex", gap: 18, padding: "20px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
          <span style={{ flexShrink: 0, fontFamily: DISPLAY, fontSize: 28, lineHeight: 1, color: C.brand, opacity: 0.85, width: "1.4ch" }}>{s.num}</span>
          <div>
            <h4 style={{ fontFamily: UI, fontSize: 16.5, fontWeight: 600, color: C.text, margin: "2px 0 6px", lineHeight: 1.3 }}>{s.title}</h4>
            <p style={{ fontFamily: UI, fontSize: 14.5, color: C.muted, lineHeight: 1.6, margin: 0, maxWidth: "60ch" }}>{s.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
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
    const res = await subscribeFree({ app: "regulate", name: name.trim(), email: email.trim() });
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
          The Co-Regulation Guide
        </p>
        <h1 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(38px, 11vw, 60px)", lineHeight: 1.04, letterSpacing: "-0.01em", margin: "0 0 20px", maxWidth: "13ch" }}>
          The Co-Regulation Guide
        </h1>
        <p className="rc-rise" style={{ animationDelay: ".18s", fontSize: 17, color: C.muted, lineHeight: 1.6, margin: "0 0 clamp(32px, 9vw, 48px)", maxWidth: "36ch" }}>
          The five-step protocol for supporting your child's dysregulated nervous system — with scripts for each step and the science behind why they work.
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

        <div className="rc-rise" style={{ animationDelay: ".3s", marginTop: 34, paddingTop: 26, borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.muted, fontWeight: 500 }}>
          Research-cited · Scripts included · Read in under 15 minutes
        </div>
      </div>
    </div>
  );
}

function Intro({ name, onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text, position: "relative", overflow: "hidden" }}>
      <FontLink />
      <div style={{ position: "absolute", top: "-20%", left: "-30%", width: "88vw", maxWidth: 520, height: "88vw", maxHeight: 520, pointerEvents: "none" }}>
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
        <h2 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(32px, 9vw, 46px)", lineHeight: 1.06, letterSpacing: "-0.01em", margin: "0 0 24px" }}>
          Before you use this guide
        </h2>

        <div className="rc-rise" style={{ animationDelay: ".18s", maxWidth: "62ch" }}>
          <p style={{ fontFamily: UI, fontSize: 16, color: C.text, lineHeight: 1.62, margin: "0 0 16px" }}>Co-regulation is not a parenting technique. It is a biological mechanism. The immature nervous system of a child is designed to borrow regulation from the mature nervous system of a safe adult.</p>
          <p style={{ fontFamily: UI, fontSize: 16, color: C.text, lineHeight: 1.62, margin: "0 0 16px" }}>What this means practically: <strong>your nervous system is the intervention</strong>. Not the words you say. Not the consequence you deliver. Not the strategy you implement. The state your own nervous system is in when you approach a dysregulated child determines, more than any other variable, whether that child's nervous system has a signal to follow back toward regulation.</p>
          <p style={{ fontFamily: UI, fontSize: 16, color: C.text, lineHeight: 1.62, margin: "0 0 16px" }}>This guide contains five steps. The sequence matters. Steps 1 and 2 are entirely about you. Steps 3 through 5 address your child. This is not accidental. <strong>You cannot co-regulate from a dysregulated state.</strong></p>
        </div>

        <div className="rc-rise" style={{ animationDelay: ".24s", background: C.surface, borderRadius: 16, padding: "20px 22px", margin: "20px 0 32px", border: `1px solid ${C.line}` }}>
          <p style={{ fontFamily: UI, fontSize: 14, color: C.muted, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>A note on scope: this guide is parent education, not clinical intervention. If you are managing complex trauma, significant mental health concerns, or a medically complex nervous system, please work alongside a licensed professional.</p>
        </div>

        <button className="rc-rise" onClick={onStart} style={{
          animationDelay: ".3s", width: "100%", padding: "17px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600,
          fontFamily: UI, background: C.brand, color: "white", cursor: "pointer", letterSpacing: ".01em", transition: `all .3s ${EASE}`,
        }}>Begin the guide</button>
      </div>
    </div>
  );
}

function Done() {
  const protocol = [
    { step: "Step 1", title: "Check your state", text: "Before you approach: am I regulated? Shoulders, breath, jaw." },
    { step: "Step 2", title: "Regulate yourself", text: "If not: physiological sigh. Double inhale, long exhale. Drop shoulders." },
    { step: "Step 3", title: "Enter with your body", text: "“I’m here. I’m not going anywhere.” Slow. Low. Soft." },
    { step: "Step 4", title: "Match then lead", text: "“Your body is really activated. I can see it. I’m right here.”" },
    { step: "Step 5", title: "Wait for the window", text: "Eye contact, slower breathing, softer posture = window is open. Then reconnect." },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />
      <header style={{ background: STATE.ventral.tint, position: "relative", overflow: "hidden", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ position: "absolute", bottom: "-46%", left: "-24%", width: "70vw", maxWidth: 380, height: "70vw", maxHeight: 380, opacity: 0.7, pointerEvents: "none" }}>
          <ArcField color={success} />
        </div>
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto", padding: "20px 20px 44px" }}>
          <div className="rc-rise" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: "clamp(28px, 9vw, 48px)" }}>
            <ArcLogo size={24} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: success }}>Quick reference</span>
          </div>
          <p className="rc-rise" style={{ animationDelay: ".06s", fontSize: 12, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: success, margin: "0 0 14px" }}>
            You’re ready
          </p>
          <h1 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(34px, 9.5vw, 50px)", lineHeight: 1.05, letterSpacing: "-0.01em", margin: "0 0 12px" }}>
            Quick reference card
          </h1>
          <p className="rc-rise" style={{ animationDelay: ".2s", fontSize: 16, color: C.text, opacity: 0.78, lineHeight: 1.5, margin: 0, maxWidth: "40ch" }}>
            Keep this somewhere visible. The protocol is most available in high-stress moments when it is already practiced and familiar.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "clamp(36px, 10vw, 56px) 20px 64px" }}>
        {/* Five-step protocol — numbered editorial list */}
        <section className="rc-rise" style={{ marginBottom: "clamp(32px, 9vw, 48px)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand, margin: "0 0 14px" }}>The five-step co-regulation protocol</p>
          <div>
            {protocol.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 18, padding: "18px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                <span style={{ flexShrink: 0, fontFamily: DISPLAY, fontSize: 28, lineHeight: 1, color: C.brand, opacity: 0.85, width: "1.4ch" }}>{i + 1}</span>
                <div>
                  <h3 style={{ fontFamily: UI, fontSize: 16.5, fontWeight: 600, color: C.text, margin: "2px 0 5px", lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ fontFamily: UI, fontSize: 14.5, color: C.muted, lineHeight: 1.55, margin: 0 }}>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Remember — emphasis pull-quote, tinted block, quote glyph */}
        <section className="rc-rise" style={{ animationDelay: ".06s", position: "relative", background: STATE.sympathetic.tint, borderRadius: 18, padding: "28px 24px 26px", marginBottom: "clamp(36px, 10vw, 52px)", overflow: "hidden" }}>
          <span aria-hidden="true" style={{ position: "absolute", top: -14, left: 14, fontFamily: DISPLAY, fontSize: 110, lineHeight: 1, color: C.terracotta, opacity: 0.16 }}>“</span>
          <p style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(19px, 5vw, 23px)", color: C.text, lineHeight: 1.4, margin: 0 }}>Remember: Steps 1 and 2 are not optional. They are the intervention.</p>
        </section>

        {/* Go deeper — hairline-bordered list, no stripes */}
        <section className="rc-rise" style={{ animationDelay: ".1s", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand, margin: "0 0 14px" }}>Go deeper</p>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden", background: C.surface }}>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ fontFamily: UI, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>In-the-Moment Scripts Pack</div>
              <div style={{ fontFamily: UI, fontSize: 14, color: C.muted, lineHeight: 1.55 }}>20 specific phrases for the most common dysregulation moments. Comment <strong>SCRIPTS</strong> on @regulatedchild.</div>
            </div>
            <div style={{ padding: "18px 20px", borderTop: `1px solid ${C.line}` }}>
              <div style={{ fontFamily: UI, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>The Regulated Child Course</div>
              <div style={{ fontFamily: UI, fontSize: 14, color: C.muted, lineHeight: 1.55 }}>The complete six-pillar framework. Visit <strong>regulatedchild.com</strong></div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: "center", paddingTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <ArcLogo size={20} />
            <a href="https://www.tiktok.com/@regulatedchild" target="_blank" rel="noopener" style={{ fontSize: 13, color: C.brand, textDecoration: "none", fontWeight: 600 }}>@regulatedchild</a>
          </div>
          <p style={{ fontSize: 12, color: C.cite, fontStyle: "italic", lineHeight: 1.55, maxWidth: "44ch", margin: "0 auto 8px" }}>
            This is educational information about nervous system science. For clinical concerns about your child's development or behavior, please consult a licensed professional.
          </p>
          <p style={{ fontSize: 11, color: C.cite }}>{"©"} The Regulated Child {"·"} Larice {"·"} regulatedchild.com</p>
        </footer>
      </main>
    </div>
  );
}

/* ── App ──────────────────────────────────────────────────────────── */
export default function CoRegulationGuide() {
  const [screen, setScreen] = useState(() => isSubscribed("regulate") ? "intro" : "gate");
  const [userName, setUserName] = useState(() => getSubscribed("regulate")?.name || "there");
  const [step, setStep] = useState(0);
  const ref = useRef(null);

  useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  if (screen === "gate") return <Gate onSubmit={n => { setUserName(n); setScreen("intro"); }} />;
  if (screen === "intro") return <Intro name={userName} onStart={() => setScreen("guide")} />;
  if (screen === "complete") return <Done />;

  const sec = sections[step];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />
      <header style={{ padding: "16px 20px", background: C.surface, borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <ArcLogo size={26} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand }}>The Regulated Child</span>
          </div>
          <ArcRing value={step + 1} total={sections.length} color={C.brand} />
        </div>
      </header>

      <main ref={ref} style={{ flex: 1, overflowY: "auto" }}>
        <div key={step} style={{ maxWidth: 560, width: "100%", margin: "0 auto", padding: "clamp(28px, 8vw, 56px) 20px 150px", boxSizing: "border-box" }}>
          <p className="rc-rise" style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.terracotta, margin: "0 0 14px" }}>{sec.label}</p>
          <h2 className="rc-rise" style={{ animationDelay: ".05s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(28px, 7.5vw, 38px)", lineHeight: 1.1, letterSpacing: "-0.01em", margin: "0 0 10px" }}>{sec.title}</h2>
          <p className="rc-rise" style={{ animationDelay: ".1s", fontFamily: UI, fontSize: 16, color: C.muted, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 30px", maxWidth: "44ch" }}>{sec.subtitle}</p>
          {sec.blocks.map((b, i) => <Block key={i} b={b} i={i} />)}
        </div>
      </main>

      <footer style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px calc(16px + env(safe-area-inset-bottom))", background: C.surface, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", gap: 12 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{
              padding: "17px 22px", borderRadius: 14, border: `1.5px solid ${C.line}`, background: C.surface,
              fontSize: 16, fontWeight: 600, fontFamily: UI, color: C.muted, cursor: "pointer", transition: `all .3s ${EASE}`,
            }}>Back</button>
          )}
          <button onClick={() => step < sections.length - 1 ? setStep(step + 1) : setScreen("complete")} style={{
            flex: 1, padding: "17px", borderRadius: 14, border: "none", background: C.brand, color: "white",
            fontSize: 16, fontWeight: 600, fontFamily: UI, cursor: "pointer", letterSpacing: ".01em", transition: `all .3s ${EASE}`,
          }}>{step < sections.length - 1 ? "Continue" : "View quick reference"}</button>
        </div>
      </footer>
    </div>
  );
}
