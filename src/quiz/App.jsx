import { useState } from "react";
import { subscribeFree, isSubscribed } from "../lib/subscribeFree.js";

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

const PROFILE_COLOR = {
  ss: { solid: "oklch(0.53 0.12 40)", tint: "oklch(0.945 0.035 42)" },
  sr: { solid: "oklch(0.45 0.07 300)", tint: "oklch(0.93 0.025 300)" },
  sto: { solid: "oklch(0.50 0.035 250)", tint: "oklch(0.93 0.014 250)" },
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

/* ── Arc motif: logo, ring progress, result seal ──────────────────── */
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

// Concentric-arc emblem for the result — the brand mark, scaled up and colored.
const ArcSeal = ({ color, size = 92 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
    <path d="M100 16 A84 84 0 0 1 184 100" stroke={color} strokeWidth="13" fill="none" strokeLinecap="round" />
    <path d="M184 100 A84 84 0 0 1 100 184" stroke={color} strokeWidth="13" fill="none" strokeLinecap="round" opacity="0.55" />
    <path d="M100 184 A84 84 0 0 1 16 100" stroke={color} strokeWidth="13" fill="none" strokeLinecap="round" opacity="0.28" />
    <path d="M100 50 A50 50 0 0 1 150 100" stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.85" />
    <circle cx="100" cy="100" r="15" fill={color} />
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

/* ── Content (unchanged) ──────────────────────────────────────────── */
const questions = [
  {
    q: "When your child is upset or overwhelmed, they are most likely to:",
    options: [
      { text: "Escalate physically — running, crashing into things, hitting, making loud noise", profile: "ss" },
      { text: "Shut down, go quiet, withdraw, or become difficult to reach", profile: "sr" },
      { text: "Escalate slowly — getting irritable and rigid, then peaking much later than you expected", profile: "sto" },
    ],
  },
  {
    q: "In a busy, noisy environment — a birthday party, a crowded store, a loud family gathering — your child:",
    options: [
      { text: "Gets more activated, excited, or physical — seems to feed off the energy", profile: "ss" },
      { text: "Becomes overwhelmed, anxious, clingy, or wants to leave", profile: "sr" },
      { text: "Manages for longer than you’d expect, then crashes hard later — often at home", profile: "sto" },
    ],
  },
  {
    q: "After a dysregulation episode, your child typically:",
    options: [
      { text: "Bounces back relatively quickly and seems almost fine — sometimes too fast", profile: "ss" },
      { text: "Takes a while to settle, is sensitive and tender, needs extra closeness", profile: "sr" },
      { text: "Takes a long time to fully recover — the window stays narrow for hours afterward", profile: "sto" },
    ],
  },
  {
    q: "Your child’s behavior during transitions (ending one activity, starting another) is:",
    options: [
      { text: "Explosive or physical when told to stop — hard stops are especially difficult", profile: "ss" },
      { text: "Anxious or distressed before the transition even starts — anticipatory dysregulation", profile: "sr" },
      { text: "Slow to shift — needs more time and warnings than other children, then escalates if rushed", profile: "sto" },
    ],
  },
  {
    q: "When it comes to sensory input — textures, sounds, lights, physical touch — your child:",
    options: [
      { text: "Seeks it out — wants tight hugs, heavy blankets, rough play, loud music, intense sensations", profile: "ss" },
      { text: "Is easily bothered — labels, seams, sounds, or light touch can trigger significant distress", profile: "sr" },
      { text: "Has variable responses — fine one day, overwhelmed by the same input another day", profile: "sto" },
    ],
  },
  {
    q: "On a school day, when does your child tend to have the hardest time?",
    options: [
      { text: "During structured, quiet work — sitting still and concentrating is the hardest challenge", profile: "ss" },
      { text: "During unstructured time — transitions, recess, or changes in routine", profile: "sr" },
      { text: "After school — fine during the day, falls apart once home", profile: "sto" },
    ],
  },
  {
    q: "When your child is calm and regulated, what does that most often look like?",
    options: [
      { text: "Active, engaged, moving — calm for this child means dynamic, not still", profile: "ss" },
      { text: "Quiet, close, content with familiar activities and familiar people", profile: "sr" },
      { text: "Fine in structured, predictable environments — struggles when the structure breaks down", profile: "sto" },
    ],
  },
  {
    q: "When you try to co-regulate your child — staying close, speaking calmly, offering presence — they:",
    options: [
      { text: "Often need something physical first — movement, pressure, rhythm — before words can land", profile: "ss" },
      { text: "Respond to your calm presence but need longer — may resist initially then soften", profile: "sr" },
      { text: "Take a very long time to come back — the recovery arc is extended even with your support", profile: "sto" },
    ],
  },
];

const profiles = {
  ss: {
    name: "The Sensory Seeker",
    subtitle: "A nervous system that needs high input to find its window of tolerance.",
    looks: [
      "Difficulty sitting still in quiet settings",
      "Physical intensity during excitement — rough play, crashing into furniture or people",
      "Seeks tight hugs, heavy pressure, loud music",
      "Gets more activated in stimulating environments rather than overwhelmed",
      "Explosive when asked to stop a preferred activity",
      "Bounces back quickly after dysregulation",
      "May seek out danger or intensity — not for thrill but for input",
    ],
    meaning: "The Sensory Seeker’s nervous system is under-responsive to sensory input — it requires more stimulation than average to reach the regulated state. This is not defiance or a discipline problem. It is a neurological threshold difference. The child’s body is constantly searching for the input it needs to feel organized and present. When that input isn’t available through sanctioned channels, it finds it through behavior: crashing, touching everything, making noise, seeking rough physical play.",
    note: "The Sensory Seeker’s behavior is often misread as intentional defiance, hyperactivity, or poor impulse control. It is none of these. It is a nervous system doing exactly what it is designed to do — seeking the input it needs to function. Your job is not to suppress the seeking. It is to channel it.",
    strategies: [
      { title: "Meet the sensory need before making a request", text: "A child who has had adequate sensory input is far more available for learning, transitions, and cooperation. Build sensory opportunities into the day deliberately — heavy work, rough play, movement breaks — rather than waiting for the behavior to communicate the need." },
      { title: "Use movement as the co-regulation entry point", text: "For this child, your calm presence alone is often not enough. Rhythm and movement are the primary regulatory tools — a walk, jumping together, carrying something heavy. Movement first, then connection." },
      { title: "Create a sanctioned sensory outlet at home", text: "A crash pad, a weighted blanket, outdoor rough play, a space where intensity is permitted. Giving the nervous system a designated channel reduces the behavior that finds it elsewhere." },
      { title: "Keep instructions brief during activation", text: "This nervous system is not ignoring you — it is processing too much competing input. Short, concrete, one-at-a-time instructions land better than multi-step verbal sequences." },
      { title: "Build in decompression before structured demands", text: "Transitions into quiet, focused tasks (homework, sitting at dinner, bedtime) work better when preceded by 10–15 minutes of high-output physical activity. The body needs to discharge before it can downshift." },
    ],
    ctas: [
      { label: "REGULATE", text: "Comment on any @regulatedchild video for the Co-Regulation Guide, including a section on sensory-seeking profiles." },
      { label: "SCRIPTS", text: "Comment for the In-the-Moment Scripts Pack, including de-escalation language for high-activation moments." },
    ],
  },
  sr: {
    name: "The Sensitive Regulator",
    subtitle: "A nervous system with a narrow window of tolerance that is easily overwhelmed.",
    looks: [
      "Easily overwhelmed by noise, crowds, or unexpected changes",
      "Anxious or distressed before transitions even begin",
      "Physically sensitive — bothered by labels, seams, certain textures or sounds",
      "Clingy or distressed when the caregiver is unavailable",
      "Struggles in unstructured settings like recess",
      "Responds to your calm presence but needs more time to soften",
      "Often described as ‘intense’ or ‘too sensitive’",
      "May have significant difficulty with new situations",
    ],
    meaning: "The Sensitive Regulator’s nervous system is highly responsive to sensory and emotional input — it detects and processes information at a lower threshold than average. This is not fragility. It is a nervous system that is doing its job with exceptional sensitivity. The challenge is that the window of tolerance is narrow: it doesn’t take much to push this child out of their regulated zone, and once outside it, the recovery requires significant support. These children often hold it together in structured environments and fall apart in unstructured or unpredictable ones.",
    note: "The Sensitive Regulator is frequently misread as manipulative, dramatic, or ‘too emotional.’ These children are not performing. They are reporting, as accurately as their nervous system allows, what is genuinely overwhelming for them. The parent’s task is to take the report seriously without confirming that the world is as dangerous as the nervous system believes.",
    strategies: [
      { title: "Predictability is the primary regulation tool", text: "Surprise and unpredictability are threat signals to this nervous system. Detailed previews before new situations, consistent daily routines, and advance warnings for any change reduce the anticipatory activation that drives so much of this child’s distress." },
      { title: "Co-regulation through quiet presence — not reassurance words", text: "The Sensitive Regulator often needs a calm, physically present adult more than verbal explanation or comfort. Words can become additional input. Calm proximity and reduced environmental stimulation is the more effective first move." },
      { title: "Reduce input before requesting behavior change", text: "When this child is activated, the most effective intervention is lowering the sensory load: quieter space, dimmer lights, fewer people, less noise. Address behavior only once the environment has been simplified." },
      { title: "Name the pattern for your child over time", text: "As your child develops, helping them understand their own nervous system — ‘you have a sensitive nervous system, which means you notice more’ — builds the interoceptive awareness that allows them to self-advocate and self-regulate earlier." },
      { title: "Distinguish sensitivity from avoidance", text: "Not all situations this child finds difficult should be avoided. Gradual, supported exposure to manageable challenge builds window capacity over time. The goal is not to eliminate difficulty but to ensure the child is never navigating it alone." },
    ],
    ctas: [
      { label: "BODY", text: "Comment on any @regulatedchild video for the Body Behind the Behavior PDF, which covers the window of tolerance in detail." },
      { label: "REGULATE", text: "Comment for the Co-Regulation Guide, including the body-states reference and five-step protocol." },
    ],
  },
  sto: {
    name: "The Slow-to-Recover",
    subtitle: "A nervous system that builds gradually and takes the longest to return to baseline.",
    looks: [
      "Manages well for extended periods, then escalates at unexpected moments",
      "After-school dysregulation is a consistent pattern — holds it together all day, falls apart at home",
      "Recovery takes significantly longer than expected even after the behavior resolves",
      "Variable sensory responses — fine with input one day, overwhelmed the same input another",
      "Appears regulated but remains physiologically activated for hours",
      "Gets more rigid and inflexible as accumulated load builds across the day",
    ],
    meaning: "The Slow-to-Recover child’s nervous system activates along a slower, more extended arc than the other two profiles — but that arc is also longer on the way back. The escalation builds quietly over hours, often appearing manageable until it isn’t. The recovery, once dysregulation has peaked, extends well beyond what the visible behavior suggests. This child may look fine to the outside observer while still being physiologically activated. Interventions attempted during that extended recovery window are frequently unsuccessful, which can lead parents to believe ‘nothing works.’ The timing is the variable.",
    note: "The Slow-to-Recover profile is often the most confusing for parents because the dysregulation seems to come from nowhere and the recovery seems never to fully arrive. It does arrive. It just takes longer than other nervous systems require. This is not a character trait. It is a physiological timeline.",
    strategies: [
      { title: "Extend the recovery window deliberately", text: "After dysregulation peaks, this child needs more time before reconnection, repair, or any new demand. What looks like the end of the episode is often still mid-recovery. Wait for the behavioral and physiological signs — eye contact, softened posture, initiated social contact — before re-engaging." },
      { title: "Track accumulated load, not just acute triggers", text: "This nervous system dysregulates from buildup, not single events. What appears to be an overreaction to a small thing is usually the final straw on a day of accumulated stress. Keep a loose log of the day’s demands when trying to understand evening or weekend meltdowns." },
      { title: "Build a decompression buffer into the after-school transition", text: "The after-school window is the highest-risk period for this profile. A 20–30 minute unstructured, low-demand decompression period before any requests — including homework, chores, or conversation about the school day — significantly reduces evening dysregulation." },
      { title: "Separate the repair conversation from the recovery period", text: "This child’s extended physiological recovery means the reconnection window arrives later than it appears. Attempting repair during recovery — even gently — will often be rejected or escalate. Wait. When the window opens, it is genuine and productive." },
      { title: "Keep routines highly consistent", text: "Predictability reduces the accumulated load this nervous system carries across the day. Unexpected schedule changes, even positive ones, add to the cumulative burden. Consistent morning and evening routines function as regulatory anchors." },
    ],
    ctas: [
      { label: "DECODE", text: "Comment on any @regulatedchild video for the Behavior Decoder, which maps the meltdown arc and stage timing." },
      { label: "SCRIPTS", text: "Comment for the In-the-Moment Scripts Pack, including scripts for the extended recovery window." },
    ],
  },
};

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
    const res = await subscribeFree({ app: "quiztrc", name: name.trim(), email: email.trim() });
    if (res.ok) { onSubmit({ name: name || "there", email }); return; }
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
          The Regulation Profile Quiz
        </p>
        <h1 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(38px, 11vw, 60px)", lineHeight: 1.04, letterSpacing: "-0.01em", margin: "0 0 20px", maxWidth: 12 + "ch" }}>
          What’s your child’s regulation profile?
        </h1>
        <p className="rc-rise" style={{ animationDelay: ".18s", fontSize: 17, color: C.muted, lineHeight: 1.6, margin: "0 0 clamp(32px, 9vw, 48px)", maxWidth: "34ch" }}>
          Find out how your child’s nervous system responds to stress, and what it needs most. Eight questions, under three minutes.
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
          }}>{submitting ? "Sending…" : "Start the quiz"}</button>
          {error && <p style={{ marginTop: 14, fontSize: 13, color: C.brand, lineHeight: 1.5 }}>{error}</p>}
        </div>

        <div className="rc-rise" style={{ animationDelay: ".3s", display: "flex", flexWrap: "wrap", gap: "10px 22px", marginTop: 34, paddingTop: 26, borderTop: `1px solid ${C.line}` }}>
          {[["Sensory Seeker", "ss"], ["Sensitive Regulator", "sr"], ["Slow-to-Recover", "sto"]].map(([label, key]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: PROFILE_COLOR[key].solid }} />
              <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuizScreen({ qIndex, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const q = questions[qIndex];
  const total = questions.length;
  const last = qIndex === total - 1;
  const letters = ["A", "B", "C", "D"];

  const handleNext = () => {
    if (selected !== null) { onAnswer(q.options[selected].profile); setSelected(null); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text, display: "flex", flexDirection: "column" }}>
      <FontLink />
      <header style={{ padding: "16px 20px", background: C.surface, borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <ArcLogo size={26} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand }}>Regulation Profile Quiz</span>
          </div>
          <ArcRing value={qIndex + 1} total={total} color={C.brand} />
        </div>
      </header>

      <main key={qIndex} style={{ flex: 1, maxWidth: 560, width: "100%", margin: "0 auto", padding: "clamp(28px, 8vw, 56px) 20px 150px", boxSizing: "border-box" }}>
        <p className="rc-rise" style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.terracotta, margin: "0 0 14px" }}>
          Question {qIndex + 1}
        </p>
        <h2 className="rc-rise" style={{ animationDelay: ".05s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(24px, 6.5vw, 32px)", lineHeight: 1.22, letterSpacing: "-0.01em", margin: "0 0 30px" }}>
          {q.q}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {q.options.map((opt, i) => {
            const on = selected === i;
            return (
              <button key={i} onClick={() => setSelected(i)} className="rc-rise"
                style={{
                  animationDelay: `${0.12 + i * 0.06}s`,
                  display: "flex", gap: 16, alignItems: "flex-start", width: "100%", padding: "18px 18px",
                  borderRadius: 16, textAlign: "left", cursor: "pointer", fontFamily: UI, fontSize: 15.5, lineHeight: 1.5,
                  color: C.text, background: on ? PROFILE_COLOR[q.options[i].profile].tint : C.surface,
                  border: `1.5px solid ${on ? PROFILE_COLOR[q.options[i].profile].solid : C.line}`,
                  transition: `background .25s ${EASE}, border-color .25s ${EASE}, transform .25s ${EASE}`,
                  transform: on ? "translateY(-1px)" : "none",
                }}>
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: DISPLAY, fontSize: 15, lineHeight: 1, marginTop: 1,
                  background: on ? PROFILE_COLOR[q.options[i].profile].solid : "transparent",
                  color: on ? "white" : C.muted, border: on ? "none" : `1.5px solid ${C.line}`,
                  transition: `all .25s ${EASE}`,
                }}>{letters[i]}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
      </main>

      <footer style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px calc(16px + env(safe-area-inset-bottom))", background: C.surface, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <button onClick={handleNext} disabled={selected === null} style={{
            width: "100%", padding: "17px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600, fontFamily: UI,
            cursor: selected !== null ? "pointer" : "default", background: selected !== null ? C.brand : C.line,
            color: selected !== null ? "white" : C.muted, transition: `all .3s ${EASE}`,
          }}>{last ? "See my child’s profile" : "Next question"}</button>
        </div>
      </footer>
    </div>
  );
}

function ResultScreen({ profileKey }) {
  const p = profiles[profileKey];
  const pc = PROFILE_COLOR[profileKey].solid;
  const tint = PROFILE_COLOR[profileKey].tint;

  const Kicker = ({ children, style }) => (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: pc, margin: "0 0 14px", ...style }}>{children}</p>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />

      {/* Drenched header in the profile color */}
      <header style={{ background: tint, position: "relative", overflow: "hidden", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ position: "absolute", bottom: "-46%", left: "-24%", width: "70vw", maxWidth: 380, height: "70vw", maxHeight: 380, opacity: 0.7, pointerEvents: "none" }}>
          <ArcField color={pc} />
        </div>
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto", padding: "20px 20px 44px" }}>
          <div className="rc-rise" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: "clamp(28px, 9vw, 48px)" }}>
            <ArcLogo size={24} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: pc }}>Your child’s profile</span>
          </div>
          <div className="rc-rise" style={{ animationDelay: ".08s", marginBottom: 18 }}><ArcSeal color={pc} size={88} /></div>
          <h1 className="rc-rise" style={{ animationDelay: ".14s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(34px, 9.5vw, 50px)", lineHeight: 1.05, letterSpacing: "-0.01em", margin: "0 0 12px" }}>
            {p.name}
          </h1>
          <p className="rc-rise" style={{ animationDelay: ".2s", fontSize: 17, color: C.text, opacity: 0.78, lineHeight: 1.5, margin: 0, maxWidth: "32ch" }}>
            {p.subtitle}
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "clamp(36px, 10vw, 56px) 20px 64px" }}>
        {/* What it looks like — clean list, no cards */}
        <section style={{ marginBottom: "clamp(40px, 11vw, 60px)" }}>
          <Kicker>What it looks like</Kicker>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {p.looks.map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "13px 0", borderTop: i ? `1px solid ${C.line}` : "none", fontSize: 15.5, lineHeight: 1.55 }}>
                <span style={{ flexShrink: 0, fontFamily: DISPLAY, fontSize: 13, color: pc, width: "2ch", textAlign: "right" }}>{String(i + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What this means — editorial, large measure */}
        <section style={{ marginBottom: "clamp(36px, 9vw, 52px)" }}>
          <Kicker>What this profile means</Kicker>
          <p style={{ fontSize: 17, lineHeight: 1.62, margin: 0, color: C.text, maxWidth: "62ch" }}>{p.meaning}</p>
        </section>

        {/* The note — tinted block with an oversized quote glyph (no side stripe) */}
        <section style={{ position: "relative", background: tint, borderRadius: 18, padding: "30px 26px 28px", marginBottom: "clamp(40px, 11vw, 60px)", overflow: "hidden" }}>
          <span aria-hidden="true" style={{ position: "absolute", top: -14, left: 14, fontFamily: DISPLAY, fontSize: 110, lineHeight: 1, color: pc, opacity: 0.18 }}>“</span>
          <div style={{ position: "relative" }}>
            <Kicker style={{ marginBottom: 12 }}>A note on this profile</Kicker>
            <p style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(18px, 4.8vw, 21px)", lineHeight: 1.45, margin: 0, color: C.text }}>{p.note}</p>
          </div>
        </section>

        {/* Strategies — numbered editorial list */}
        <section style={{ marginBottom: "clamp(40px, 11vw, 60px)" }}>
          <Kicker>Five strategies for this profile</Kicker>
          <div>
            {p.strategies.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 18, padding: "20px 0", borderTop: `1px solid ${C.line}` }}>
                <span style={{ flexShrink: 0, fontFamily: DISPLAY, fontSize: 28, lineHeight: 1, color: pc, opacity: 0.85, width: "1.4ch" }}>{i + 1}</span>
                <div>
                  <h3 style={{ fontFamily: UI, fontSize: 16.5, fontWeight: 600, color: C.text, margin: "2px 0 6px", lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.6, margin: 0, maxWidth: "60ch" }}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What comes next */}
        <section style={{ marginBottom: 48 }}>
          <Kicker>What comes next</Kicker>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden", background: C.surface }}>
            {p.ctas.map((cta, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "18px 20px", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: pc, minWidth: "5.5ch" }}>{cta.label}</span>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, margin: 0 }}>{cta.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: "center", paddingTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <ArcLogo size={20} />
            <a href="https://www.tiktok.com/@regulatedchild" target="_blank" rel="noopener" style={{ fontSize: 13, color: C.brand, textDecoration: "none", fontWeight: 600 }}>@regulatedchild</a>
          </div>
          <p style={{ fontSize: 12, color: C.cite, fontStyle: "italic", lineHeight: 1.55, maxWidth: "44ch", margin: "0 auto 8px" }}>
            These profiles are parent education tools, not clinical assessments. For your child’s specific situation, please consult a licensed professional.
          </p>
          <p style={{ fontSize: 11, color: C.cite, lineHeight: 1.6, margin: "0 0 8px" }}>Ayres (1972) · Kranowitz (1998) · Porges (2011) · Schore (2003) · Siegel (1999) · van der Kolk (2014)</p>
          <p style={{ fontSize: 11, color: C.cite }}>© The Regulated Child · Larice · regulatedchild.com</p>
        </footer>
      </main>
    </div>
  );
}

/* ── App ──────────────────────────────────────────────────────────── */
export default function RegulationProfileQuiz() {
  const [screen, setScreen] = useState(() => isSubscribed("quiztrc") ? "quiz" : "gate");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (profile) => {
    const next = [...answers, profile];
    setAnswers(next);
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      const counts = { ss: 0, sr: 0, sto: 0 };
      next.forEach(p => counts[p]++);
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setScreen("result-" + winner);
    }
  };

  if (screen === "gate") return <Gate onSubmit={() => setScreen("quiz")} />;
  if (screen === "quiz") return <QuizScreen qIndex={qIndex} onAnswer={handleAnswer} />;
  if (screen.startsWith("result-")) return <ResultScreen profileKey={screen.replace("result-", "")} />;
  return null;
}
