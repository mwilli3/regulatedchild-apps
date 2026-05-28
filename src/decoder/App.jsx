import { useState, useEffect, useRef } from "react";

/* ── Design tokens (OKLCH, brand hues preserved) ───────────────────── */
const C = {
  text: "oklch(0.26 0.03 45)", muted: "oklch(0.50 0.02 55)", cite: "oklch(0.55 0.02 55)",
  bg: "oklch(0.975 0.008 70)", surface: "oklch(0.995 0.004 75)", line: "oklch(0.90 0.01 60)",
  brand: "oklch(0.53 0.12 40)", brandDark: "oklch(0.44 0.11 40)", terracotta: "oklch(0.53 0.12 40)",
  success: "oklch(0.50 0.04 150)", successTint: "oklch(0.94 0.02 150)",
  // terracotta brand tints
  brandTint: "oklch(0.945 0.035 42)",
  // nervous-system state meaning colors, re-expressed in OKLCH
  fight: "oklch(0.53 0.12 40)", fightBg: "oklch(0.945 0.035 42)",
  flight: "oklch(0.62 0.10 50)", flightBg: "oklch(0.95 0.03 55)",
  freeze: "oklch(0.45 0.07 300)", freezeBg: "oklch(0.93 0.025 300)",
  fawn: "oklch(0.50 0.035 250)", fawnBg: "oklch(0.93 0.014 250)",
  // clock zones
  warn: "oklch(0.62 0.10 75)", warnBg: "oklch(0.95 0.04 85)",
};

const DISPLAY = "'Young Serif', serif";
const UI = "'Outfit', sans-serif";
const f = UI;
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
      @keyframes bodyPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }
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

const ArcField = ({ color, style }) => (
  <svg viewBox="0 0 400 400" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, ...style }} aria-hidden="true">
    <path d="M40 360 A320 320 0 0 1 360 40" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M90 360 A270 270 0 0 1 360 90" stroke={color} strokeWidth="2" fill="none" opacity="0.32" />
    <path d="M150 360 A210 210 0 0 1 360 150" stroke={color} strokeWidth="2" fill="none" opacity="0.18" />
  </svg>
);

const RC_SYSTEM = `You are an AI assistant embedded in The Regulated Child Behavior Decoder Workbook. You help parents understand their child's behavior through a nervous system lens grounded in polyvagal theory, developmental neuroscience, and attachment research.

RULES:
- Always frame behavior as nervous system communication, not choice or defiance
- Body mechanism before behavioral implication
- Never pathologize the child or imply parental failure
- Never use clinical diagnostic language
- Never use these words: journey, healing, transformation, toxic, empath
- Use hedged scientific language: "research suggests," "may support"
- Keep responses warm, direct, parent-accessible — never academic
- Always reference the nervous system state (ventral vagal, sympathetic, dorsal vagal)
- Recommend consulting a licensed professional for clinical concerns
- Keep responses concise (under 300 words)

FRAMEWORK — Four nervous system states:
1. VENTRAL VAGAL (safe/connected): regulated, can learn and connect
2. SYMPATHETIC — FIGHT: hitting, throwing, screaming, arguing
3. SYMPATHETIC — FLIGHT: running, hiding, refusing, resisting transitions
4. DORSAL VAGAL (shutdown/freeze): blank stare, flat affect, withdrawal, sudden compliance
5. FAWN: excessive apologizing, performing happiness, abandoning own needs`;

async function askAI(prompt) {
  let r;
  try {
    r = await fetch("/.netlify/functions/ai-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: RC_SYSTEM + "\n\n" + prompt }),
    });
  } catch (err) {
    return "AI features require the Netlify deployment to be active. Once deployed, add your Anthropic API key in Netlify environment variables and this feature will work automatically.";
  }
  try {
    if (!r.ok) {
      if (r.status === 404) return "AI features are not yet connected. Deploy to Netlify and add your ANTHROPIC_API_KEY in environment variables to activate.";
      return "Something went wrong with the AI service. Please try again in a moment.";
    }
    const data = await r.json();
    if (data.error) return data.error;
    return data.text || "No response received. Please try again.";
  } catch (err) {
    return "AI features require the Netlify deployment to be active.";
  }
}

// === DATA (condensed) ===
const functions = [
  { title: "Escape / Avoidance", trad: "The child is trying to avoid a task or situation.", ns: "The child’s window of tolerance has been exceeded by the demand, and the nervous system is attempting to remove the body from the source of overwhelm.", looks: "Running from homework, refusing school, hiding when asked to do chores, shutting down during difficult conversations.", needs: "Reduced demand, a signal that the demand is not a survival threat, and a bridging strategy that lowers activation." },
  { title: "Attention / Connection", trad: "The child is seeking attention.", ns: "‘Attention-seeking’ is almost always ‘connection-seeking’ — the nervous system’s attempt to borrow regulation from a safe person.", looks: "Clinging, interrupting, performing behaviors that guarantee a response, regression, following a parent room to room.", needs: "Reliable access to a regulated adult. Quality of presence matters more than quantity." },
  { title: "Tangible / Sensory", trad: "The child wants a specific item or sensory experience.", ns: "The sensory processing system is either seeking input to reach the window of tolerance or overwhelmed by input and trying to reduce it.", looks: "Meltdowns over specific objects, insistence on textures or foods, seeking intense physical input, covering ears or eyes.", needs: "Access to the sensory input that regulates this specific child’s nervous system." },
  { title: "Automatic / Self-Regulatory", trad: "The behavior seems to serve no external purpose.", ns: "The behavior is the body’s self-regulation attempt — a somatic strategy for managing internal states without external co-regulation.", looks: "Rocking, humming, hair twisting, thumb sucking, repetitive movements, talking to themselves, pacing.", needs: "These behaviors are often functional. The question is not ‘how do I stop this’ but ‘what is this behavior accomplishing?’" },
];

const decoderData = [
  { state: "Fight", color: C.fight, bg: C.fightBg, behaviors: [
    { behavior: "Hitting, kicking, biting", age: "2–8", fn: "Discharge overwhelming energy", todo: "Safe space + reduced words + co-regulated presence.", not: "Aggression, ‘choosing’ to hurt" },
    { behavior: "Throwing objects", age: "2–10", fn: "Release energy through large motor action", todo: "Redirect to safe throwing. Name: ‘Your body needs to throw.’", not: "Destruction, disrespect" },
    { behavior: "Screaming, yelling", age: "All", fn: "Vocal discharge of activation", todo: "Lower your voice. Do not match volume. Wait for peak to pass.", not: "Defiance, manipulation" },
    { behavior: "Arguing every instruction", age: "5–14", fn: "Amygdala driving verbal fight", todo: "Reduce to one instruction. Acknowledge disagreement.", not: "Disrespect, talking back" },
    { behavior: "Sibling aggression", age: "3–12", fn: "Proximity exceeds tolerance", todo: "Separate. Correction later, not now.", not: "Bullying, meanness" },
    { behavior: "Homework explosion", age: "6–14", fn: "Cognitive demand exceeds prefrontal resources", todo: "Pause. 15-minute break, then restart together.", not: "Laziness, defiance" },
    { behavior: "Morning routine battles", age: "3–12", fn: "Low-to-high demand transition overwhelms window", todo: "Visual schedules. 10-minute warning.", not: "Being difficult" },
  ]},
  { state: "Flight", color: C.flight, bg: C.flightBg, behaviors: [
    { behavior: "Running / bolting", age: "2–8", fn: "Escaping perceived threat", todo: "Don’t chase (unless safety risk). Stay visible.", not: "Disobedience" },
    { behavior: "Hiding", age: "3–10", fn: "Seeking low-stimulation recovery space", todo: "Allow it. Check in gently.", not: "Being dramatic" },
    { behavior: "School refusal", age: "5–16", fn: "Anticipated demands exceed window", todo: "Address the body first, not the schedule.", not: "Laziness, manipulation" },
    { behavior: "Restlessness", age: "All", fn: "Sympathetic energy seeking discharge", todo: "Movement before demanding stillness.", not: "ADHD, being disruptive" },
    { behavior: "Bedtime resistance", age: "2–12", fn: "Separation activates threat detection", todo: "Extended wind-down. Presence-based.", not: "Stalling, manipulating" },
  ]},
  { state: "Freeze / Shutdown", color: C.freeze, bg: C.freezeBg, behaviors: [
    { behavior: "Blank stare, zoning out", age: "All", fn: "Conserving energy after sustained overwhelm", todo: "Gentle sensory input. Low-demand presence. Time.", not: "Not paying attention" },
    { behavior: "Sudden compliance", age: "4–14", fn: "Fawn/freeze hybrid — agreeing to avoid activation", todo: "Name it gently: ‘You’re agreeing very quickly.’", not: "Being ‘good’" },
    { behavior: "After-school collapse", age: "5–16", fn: "Held it together all day. Home triggers release.", todo: "No demands for 30–60 min.", not: "Being dramatic" },
    { behavior: "Withdrawal from family", age: "8–16", fn: "Relational demands exceed capacity", todo: "Respect withdrawal. Check in once.", not: "Not caring" },
    { behavior: "Regression", age: "3–10", fn: "Reaching for earlier self-soothing pattern", todo: "Allow without comment. It’s functional.", not: "Wanting attention" },
  ]},
  { state: "Fawn", color: C.fawn, bg: C.fawnBg, behaviors: [
    { behavior: "Excessive apologizing", age: "4–16", fn: "Preemptive appeasement for attachment safety", todo: "‘You don’t need to apologize. You’re safe here.’", not: "Good manners" },
    { behavior: "Hypervigilance to adult mood", age: "5–16", fn: "Monitoring caregiver to predict rupture", todo: "Be transparent: ‘I’m frustrated, but not at you.’", not: "Being perceptive" },
    { behavior: "Abandoning own needs", age: "6–16", fn: "Prioritizing relationship over self for safety", todo: "Give permission to disagree.", not: "Being easy, mature" },
    { behavior: "Performing happiness", age: "5–16", fn: "Displaying emotion adult needs to see", todo: "‘You don’t have to be happy right now.’", not: "Being resilient" },
  ]},
];

const misreads = [
  { title: "Shutdown read as ‘Calm’", actually: "Dorsal vagal shutdown. The stillness is not peace — it is the absence of energy to fight or flee.", tell: "Regulated calm has tone: relaxed muscles, natural eye contact. Shutdown has flatness: blank eyes, hollow compliance.", todo: "Do not add demands. Provide gentle warmth. Wait for genuine reactivation." },
  { title: "Fawning read as ‘Good Behavior’", actually: "Fawn response. This child is not well-behaved. This child is afraid.", tell: "Genuine cooperation feels relaxed. Fawning feels urgent — over-the-top apologies, checking your face constantly.", todo: "Give explicit permission to disagree." },
  { title: "Connection-seeking read as ‘Attention-seeking’", actually: "The nervous system is seeking proximity to a regulated adult for co-regulation.", tell: "Does providing brief, attuned connection resolve it? If yes, it was co-regulation.", todo: "Provide 5 minutes of attuned, undivided connection." },
  { title: "Sensory seeking read as ‘Hyperactivity’", actually: "The sensory system requires more input than the environment is providing.", tell: "Offer deep pressure. Does the child settle? If yes, the body was seeking, not misbehaving.", todo: "Structured sensory input before high-demand tasks." },
  { title: "After-school behavior read as ‘Disrespect’", actually: "Home is the safe space. The nervous system releases everything it has been containing.", tell: "Ask the teacher. If they’re ‘wonderful’ at school, that’s your confirmation.", todo: "Protect the first 30–60 minutes after pickup. No demands." },
  { title: "Delayed reaction read as ‘Being Fine’", actually: "Slow-to-Recover profile. The meltdown at 7pm is the body’s response to the stressor at 8am.", tell: "Track backward: what happened 4–6 hours ago?", todo: "Build recovery time into routines." },
  { title: "Bedtime resistance read as ‘Stalling’", actually: "Separation at bedtime activates the attachment system. Being alone in a dark room is a threat cue.", tell: "Stalling is purposeful. Attachment distress is anxious and escalating.", todo: "Extend the wind-down with presence. Gradually fade over weeks." },
];

const emptyTracker = [];
const emptySignature = { reg_body: "", reg_voice: "", reg_able: "", reg_activities: "", act_first: "", act_body: "", act_triggers: "", act_duration: "", act_helps: "", act_worse: "", shut_looks: "", shut_situations: "", shut_duration: "", shut_supports: "", shut_misread: "" };
const emptyReflections = { q1: "", q2: "", q3: "" };

function useStorage(key, initial) {
  const [val, setVal] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    (async () => {
      try {
        if (window.storage?.get) {
          const r = await window.storage.get(key);
          if (r?.value) { setVal(JSON.parse(r.value)); setLoaded(true); return; }
        }
      } catch {}
      try {
        const s = localStorage.getItem(key);
        if (s) setVal(JSON.parse(s));
      } catch {}
      setLoaded(true);
    })();
  }, [key]);
  useEffect(() => {
    if (!loaded) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const data = JSON.stringify(val);
      (async () => {
        try { if (window.storage?.set) await window.storage.set(key, data); } catch {}
        try { localStorage.setItem(key, data); } catch {}
      })();
    }, 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [val, loaded, key]);
  return [val, setVal, loaded];
}

/* ── Shared editorial bits ────────────────────────────────────────── */
const Kicker = ({ children, color = C.terracotta, style }) => (
  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color, margin: "0 0 14px", fontFamily: UI, ...style }}>{children}</p>
);
const SectionTitle = ({ children, style }) => (
  <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7vw, 36px)", lineHeight: 1.08, letterSpacing: "-0.01em", color: C.text, margin: "0 0 12px", ...style }}>{children}</h2>
);
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14, fontFamily: UI, color: C.text, background: C.surface, outline: "none", boxSizing: "border-box", marginBottom: 6, transition: `border-color .25s ${EASE}` };

// === AI COMPONENTS ===
function AIBadge() {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, background: C.brandTint, fontSize: 10, fontWeight: 700, color: C.brand, letterSpacing: ".08em", fontFamily: UI }}>AI-POWERED</span>;
}

// Full plum-tinted AI result block (no side stripe)
function AIResult({ children }) {
  return (
    <div style={{ marginTop: 14, background: C.brandTint, borderRadius: 14, padding: "16px 18px", border: `1px solid ${C.brand}1f` }}>
      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", fontFamily: UI }}>{children}</p>
    </div>
  );
}

function DecodeThisBehavior() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "20px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.brand, fontFamily: UI }}>Decode this behavior</div>
        <AIBadge />
      </div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 12 }}>Describe what just happened and the AI will map it to the nervous system state and suggest what your child needs.</p>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder="e.g. My 6-year-old threw his backpack and screamed when I asked about homework..." style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14, fontFamily: UI, color: C.text, background: C.bg, outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: 10 }} />
      <button disabled={!input.trim() || loading} onClick={async () => {
        setLoading(true);
        const r = await askAI(`A parent describes this behavior from their child:\n\n"${input}"\n\nBased on the Behavior Decoder framework:\n1. Identify the most likely nervous system state (Fight, Flight, Freeze/Shutdown, or Fawn)\n2. Explain what the body is trying to accomplish (the function)\n3. Give 2-3 specific things the parent should do right now\n4. Note what this behavior is NOT (the common misread)\n\nKeep it warm, direct, and under 250 words.`);
        setResult(r); setLoading(false);
      }} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: C.brand, color: "white", fontSize: 13, fontWeight: 600, fontFamily: UI, cursor: input.trim() && !loading ? "pointer" : "default", opacity: input.trim() && !loading ? 1 : 0.5, transition: `all .25s ${EASE}` }}>{loading ? "Analyzing..." : "Decode this"}</button>
      {result && <AIResult>{result}</AIResult>}
    </div>
  );
}

function PatternAnalyzer({ tracker, reflections }) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const filled = tracker.filter(r => r.behavior || r.before);
  if (filled.length < 3) return (
    <div style={{ background: C.brandTint, borderRadius: 14, padding: "14px 16px", marginTop: 16, border: `1px solid ${C.brand}1f` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 14, fontWeight: 600, color: C.brand, fontFamily: UI }}>Pattern Analyzer</span><AIBadge /></div>
      <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Fill in at least 3 tracker entries to unlock AI pattern analysis.</p>
    </div>
  );
  return (
    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "20px", marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><span style={{ fontSize: 16, fontWeight: 600, color: C.brand, fontFamily: UI }}>Pattern Analyzer</span><AIBadge /></div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>AI will analyze your tracker entries and identify patterns in your child’s nervous system states, peak risk times, and what’s working.</p>
      <button disabled={loading} onClick={async () => {
        setLoading(true);
        const entries = filled.map(r => `${r.date || "undated"}: Time/Setting: ${r.time || "not noted"} | Before: ${r.before || "not noted"} | State: ${r.state || "not noted"} | Behavior: ${r.behavior || "not noted"} | Helped/Didn't: ${r.helped || "not noted"}`).join("\n");
        const refs = reflections.q1 || reflections.q2 || reflections.q3 ? `\n\nParent reflections:\nQ1 (timing patterns): ${reflections.q1 || "not yet answered"}\nQ2 (antecedent patterns): ${reflections.q2 || "not yet answered"}\nQ3 (what helped): ${reflections.q3 || "not yet answered"}` : "";
        const r = await askAI(`Analyze this parent's Antecedent Tracker data (${filled.length} entries) and provide a personalized pattern report:\n\n${entries}${refs}\n\nProvide:\n1. PATTERNS IDENTIFIED: What nervous system states appear most often? What times/situations are highest risk?\n2. WHAT'S WORKING: Based on what helped, what regulatory strategies seem effective for this child?\n3. WHAT TO TRY NEXT: 2-3 specific, actionable suggestions based on the patterns\n4. ONE THING TO WATCH: Something the parent may not have noticed in their data\n\nKeep it warm, specific to their data, and under 300 words.`);
        setResult(r); setLoading(false);
      }} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: C.brand, color: "white", fontSize: 13, fontWeight: 600, fontFamily: UI, cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1, transition: `all .25s ${EASE}` }}>{loading ? "Analyzing your data..." : "Analyze my patterns"}</button>
      {result && <AIResult>{result}</AIResult>}
    </div>
  );
}

function SignatureCoach({ sig }) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const filled = Object.values(sig).filter(v => v.trim()).length;
  if (filled < 4) return (
    <div style={{ background: C.brandTint, borderRadius: 14, padding: "14px 16px", marginTop: 16, border: `1px solid ${C.brand}1f` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 14, fontWeight: 600, color: C.brand, fontFamily: UI }}>Signature Coach</span><AIBadge /></div>
      <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Fill in at least 4 fields to unlock AI coaching on your child’s State Signature.</p>
    </div>
  );
  return (
    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "20px", marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><span style={{ fontSize: 16, fontWeight: 600, color: C.brand, fontFamily: UI }}>Signature Coach</span><AIBadge /></div>
      <button disabled={loading} onClick={async () => {
        setLoading(true);
        const data = Object.entries(sig).filter(([,v]) => v.trim()).map(([k,v]) => `${k}: ${v}`).join("\n");
        const r = await askAI(`Review this parent's State Signature for their child and provide coaching:\n\n${data}\n\nProvide:\n1. STRENGTHS: What this parent is already noticing well\n2. GAPS TO EXPLORE: Fields that are missing or could be more specific, with guiding questions\n3. INSIGHT: One pattern or connection in their observations they may not have noticed\n4. NEXT STEP: One specific thing to observe this week\n\nKeep it warm, encouraging, and under 250 words.`);
        setResult(r); setLoading(false);
      }} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: C.brand, color: "white", fontSize: 13, fontWeight: 600, fontFamily: UI, cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1, transition: `all .25s ${EASE}` }}>{loading ? "Reviewing..." : "Coach my signature"}</button>
      {result && <AIResult>{result}</AIResult>}
    </div>
  );
}

// === VISUAL COMPONENTS ===
function BodyStateVisual() {
  const [active, setActive] = useState("ventral");
  const states = [
    { id: "ventral", label: "Ventral vagal", sub: "Safe & connected", color: C.success, desc: "Relaxed shoulders, steady breathing, eye contact, flexible thinking, able to respond to requests", bodyColor: C.successTint, headColor: C.successTint },
    { id: "fight", label: "Sympathetic — Fight", sub: "Activation", color: C.fight, desc: "Jaw tight, fists clenched, heart racing, muscles tense, flushed face, voice rising", bodyColor: C.fightBg, headColor: C.fightBg },
    { id: "flight", label: "Sympathetic — Flight", sub: "Mobilization", color: C.flight, desc: "Wide eyes, shallow breathing, restless legs, scanning for exits, can't sit still", bodyColor: C.flightBg, headColor: C.flightBg },
    { id: "freeze", label: "Dorsal vagal", sub: "Shutdown", color: C.freeze, desc: "Flat face, glazed eyes, limp posture, slowed movement, minimal response", bodyColor: C.freezeBg, headColor: C.freezeBg },
    { id: "fawn", label: "Fawn", sub: "Appeasement", color: C.fawn, desc: "Scanning your face, over-agreeing, performing the emotion you want, abandoning their own needs", bodyColor: C.fawnBg, headColor: C.fawnBg },
  ];
  const s = states.find(st => st.id === active);
  const pulse = active === "fight" || active === "flight";
  return (
    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "20px", marginBottom: 16, overflow: "hidden" }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.terracotta, marginBottom: 12, fontFamily: UI }}>Interactive body-state map</div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <svg viewBox="0 0 120 240" width="100" height="200" style={{ flexShrink: 0 }}>
          {/* Head */}
          <circle cx="60" cy="36" r="22" fill={s.headColor} stroke={s.color} strokeWidth="1.5" style={pulse ? { animation: "bodyPulse 1.5s ease infinite" } : {}} />
          {/* Body */}
          <ellipse cx="60" cy="100" rx="32" ry="42" fill={s.bodyColor} stroke={s.color} strokeWidth="1.5" style={pulse ? { animation: "bodyPulse 1.5s ease infinite" } : {}} />
          {/* Arms */}
          <path d={active === "fight" ? "M28 80 L8 65" : active === "fawn" ? "M28 80 L15 95" : "M28 85 L12 110"} stroke={s.color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d={active === "fight" ? "M92 80 L112 65" : active === "fawn" ? "M92 80 L105 95" : "M92 85 L108 110"} stroke={s.color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Legs */}
          <path d={active === "flight" ? "M48 138 L30 195" : "M48 138 L42 200"} stroke={s.color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d={active === "flight" ? "M72 138 L90 195" : "M72 138 L78 200"} stroke={s.color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* State indicators */}
          {active === "fight" && <>
            <line x1="48" y1="30" x2="42" y2="18" stroke={s.color} strokeWidth="1.5" opacity="0.6" />
            <line x1="72" y1="30" x2="78" y2="18" stroke={s.color} strokeWidth="1.5" opacity="0.6" />
            <line x1="60" y1="16" x2="60" y2="6" stroke={s.color} strokeWidth="1.5" opacity="0.6" />
          </>}
          {active === "freeze" && <>
            <line x1="50" y1="32" x2="70" y2="32" stroke={s.color} strokeWidth="1" opacity="0.4" />
            <line x1="50" y1="38" x2="70" y2="38" stroke={s.color} strokeWidth="1" opacity="0.4" />
          </>}
          {active === "ventral" && <>
            <path d="M50 40 Q60 48 70 40" stroke={s.color} strokeWidth="1.5" fill="none" opacity="0.6" />
          </>}
          {/* Heart indicator for fight/flight */}
          {(active === "fight" || active === "flight") && <circle cx="55" cy="85" r="5" fill={s.color} opacity="0.5" style={{ animation: "bodyPulse 0.8s ease infinite" }} />}
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: s.color, marginBottom: 2, fontFamily: UI }}>{s.label}</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{s.sub}</div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: "0 0 12px" }}>{s.desc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {states.map(st => (
              <button key={st.id} onClick={() => setActive(st.id)} style={{ padding: "5px 11px", borderRadius: 999, border: `1px solid ${active === st.id ? st.color : C.line}`, background: active === st.id ? st.color : "transparent", color: active === st.id ? "white" : C.muted, fontSize: 10.5, fontWeight: 600, fontFamily: UI, cursor: "pointer", transition: `all .2s ${EASE}` }}>{st.id === "ventral" ? "Safe" : st.id === "fight" ? "Fight" : st.id === "flight" ? "Flight" : st.id === "freeze" ? "Shutdown" : "Fawn"}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackerStats({ tracker }) {
  const filled = tracker.filter(r => r.behavior || r.before);
  const dates = filled.map(r => r.date).filter(Boolean);
  const uniqueDays = [...new Set(dates)].length;
  const stateCount = {};
  filled.forEach(r => { if (r.state) stateCount[r.state] = (stateCount[r.state] || 0) + 1; });
  const topState = Object.entries(stateCount).sort((a, b) => b[1] - a[1])[0];

  const milestones = [
    { count: 3, label: "Pattern Analyzer unlocks", done: filled.length >= 3 },
    { count: 7, label: "Weekly patterns visible", done: filled.length >= 7 },
    { count: 14, label: "Reliable patterns established", done: filled.length >= 14 },
    { count: 21, label: "Provider Report recommended", done: filled.length >= 21 },
  ];
  const nextMilestone = milestones.find(m => !m.done) || milestones[milestones.length - 1];
  const progress = Math.min(1, filled.length / nextMilestone.count);

  const Stat = ({ value, label }) => (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 30, lineHeight: 1, color: C.brand }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "18px", marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <Stat value={filled.length} label="Entries" />
        <Stat value={uniqueDays} label="Days" />
        <Stat value={topState ? topState[0].split("/")[0] : "—"} label="Top state" />
      </div>
      {(() => {
        const coregEntries = filled.filter(r => r.myStateBefore);
        if (coregEntries.length < 3) return null;
        const regCount = coregEntries.filter(r => r.myStateBefore === "Regulated").length;
        const pct = Math.round((regCount / coregEntries.length) * 100);
        return (
          <div style={{ background: pct >= 50 ? C.successTint : C.warnBg, borderRadius: 10, padding: "9px 13px", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: pct >= 50 ? C.success : C.warn, fontWeight: 600 }}>
              Co-regulation: you were regulated before approaching {pct}% of the time ({regCount}/{coregEntries.length} entries)
            </div>
          </div>
        );
      })()}
      <div style={{ background: C.bg, borderRadius: 10, padding: "10px 13px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: C.muted }}>Next: {nextMilestone.label}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.brand }}>{Math.min(filled.length, nextMilestone.count)}/{nextMilestone.count}</span>
        </div>
        <div style={{ height: 4, background: C.line, borderRadius: 2, marginTop: 7, overflow: "hidden" }}>
          <div style={{ height: 4, background: C.brand, borderRadius: 2, width: "100%", transformOrigin: "left", transform: `scaleX(${progress})`, transition: `transform .45s ${EASE}` }} />
        </div>
      </div>
    </div>
  );
}

function MisreadVisualCard({ m, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rc-rise" style={{ animationDelay: `${0.05 + index * 0.04}s`, borderRadius: 16, border: `1px solid ${C.line}`, background: C.surface, marginBottom: 10, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "16px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: open ? 12 : 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.terracotta, fontFamily: UI }}>{m.title}</span>
          <span style={{ fontSize: 16, color: C.muted, transform: open ? "rotate(180deg)" : "rotate(0)", transition: `transform .35s ${EASE}` }}>{"▾"}</span>
        </div>
        {open && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.terracotta}24` }}>
                <div style={{ background: C.fightBg, padding: "8px 12px", textAlign: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke={C.terracotta} strokeWidth="1.5" opacity="0.4" /><line x1="10" y1="11" x2="22" y2="23" stroke={C.terracotta} strokeWidth="2" strokeLinecap="round" /><line x1="22" y1="11" x2="10" y2="23" stroke={C.terracotta} strokeWidth="2" strokeLinecap="round" /></svg>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: C.terracotta, marginTop: 4 }}>What you see</div>
                </div>
                <div style={{ padding: "10px 12px", fontSize: 12, color: C.text, lineHeight: 1.5 }}>{m.actually.split(".")[0]}.</div>
              </div>
              <div style={{ flex: 1, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.success}24` }}>
                <div style={{ background: C.successTint, padding: "8px 12px", textAlign: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke={C.success} strokeWidth="1.5" opacity="0.4" /><path d="M10 16 L14 20 L22 12" fill="none" stroke={C.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: C.success, marginTop: 4 }}>What's happening</div>
                </div>
                <div style={{ padding: "10px 12px", fontSize: 12, color: C.text, lineHeight: 1.5 }}>{m.actually}</div>
              </div>
            </div>
            <div style={{ background: C.bg, borderRadius: 10, padding: "11px 13px", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.brand, marginBottom: 4 }}>How to tell the difference</div>
              <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>{m.tell}</p>
            </div>
            <div style={{ background: C.successTint, borderRadius: 10, padding: "11px 13px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.success, marginBottom: 4 }}>What to do instead</div>
              <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>{m.todo}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// === UI COMPONENTS ===
function FunctionCard({ fn, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rc-rise" style={{ animationDelay: `${0.05 + index * 0.04}s`, borderRadius: 16, border: `1px solid ${C.line}`, overflow: "hidden", background: C.surface, marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: UI }}>{fn.title}</span>
        <span style={{ fontSize: 16, color: C.muted, transform: open ? "rotate(180deg)" : "rotate(0)", transition: `transform .35s ${EASE}` }}>{"▾"}</span>
      </div>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, padding: "11px 13px", borderRadius: 12, background: C.fightBg }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: C.terracotta, marginBottom: 4 }}>Traditional frame</div>
              <p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, margin: 0 }}>{fn.trad}</p>
            </div>
            <div style={{ flex: 1, padding: "11px 13px", borderRadius: 12, background: C.brandTint }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: C.brand, marginBottom: 4 }}>Nervous system frame</div>
              <p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, margin: 0 }}>{fn.ns}</p>
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 8 }}><strong>Looks like:</strong> {fn.looks}</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.55, background: C.successTint, borderRadius: 10, padding: "11px 13px" }}><strong style={{ color: C.success }}>Needs:</strong> {fn.needs}</div>
        </div>
      )}
    </div>
  );
}

function DecoderCard({ item, stateColor, stateBg }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden", background: C.surface, marginBottom: 6, cursor: "pointer" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ flexShrink: 0, width: 11, height: 11, borderRadius: 6, marginTop: 5, background: stateColor, boxShadow: `0 0 0 4px ${stateBg}` }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ fontSize: 14.5, fontWeight: 600, color: C.text, fontFamily: UI }}>{item.behavior}</span><span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{item.age}</span></div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginTop: 2 }}>{item.fn}</div>
        </div>
        <span style={{ fontSize: 14, color: C.muted, transform: open ? "rotate(180deg)" : "rotate(0)", transition: `transform .35s ${EASE}` }}>{"▾"}</span>
      </div>
      {open && (
        <div style={{ padding: "0 16px 14px 39px" }}>
          <div style={{ background: C.successTint, borderRadius: 10, padding: "11px 13px", marginBottom: 6 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: C.success, marginBottom: 4 }}>What to do</div><p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, margin: 0 }}>{item.todo}</p></div>
          <div style={{ background: C.fightBg, borderRadius: 10, padding: "11px 13px" }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".10em", textTransform: "uppercase", color: C.terracotta, marginBottom: 4 }}>This is not</div><p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, margin: 0 }}>{item.not}</p></div>
        </div>
      )}
    </div>
  );
}

function TrackerSection() {
  const [tracker, setTracker, loaded] = useStorage("bdw-tracker", emptyTracker);
  const [reflections, setReflections, rLoaded] = useStorage("bdw-reflections", emptyReflections);
  if (!loaded || !rLoaded) return <p style={{ color: C.muted }}>Loading...</p>;

  const today = new Date().toISOString().slice(0, 10);
  const addEntry = () => {
    setTracker([...tracker, { id: Date.now(), date: today, time: "", before: "", state: "", behavior: "", helped: "", myStateBefore: "", myStateDuring: "" }]);
  };
  const update = (id, field, val) => setTracker(tracker.map(r => r.id === id ? { ...r, [field]: val } : r));
  const removeEntry = (id) => { if (confirm("Remove this entry?")) setTracker(tracker.filter(r => r.id !== id)); };
  const states = ["", "Fight", "Flight", "Freeze/Shutdown", "Fawn"];

  return (
    <div>
      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, marginBottom: 6 }}>Log each dysregulation event as it happens. You are tracking the conditions that preceded the behavior — this is where the pattern lives.</p>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 16 }}>Patterns become visible after 7+ entries across multiple days. For a provider-ready report, aim for 14–21 entries over 2–3 weeks.</p>
      <div style={{ background: C.brandTint, borderRadius: 10, padding: "9px 13px", marginBottom: 16, fontSize: 11, color: C.brand, fontWeight: 600 }}>Your entries save automatically after you stop typing.</div>

      <TrackerStats tracker={tracker} />

      <button onClick={addEntry} style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1.5px dashed ${C.brand}40`, background: C.brandTint, color: C.brand, fontSize: 14, fontWeight: 600, fontFamily: UI, cursor: "pointer", marginBottom: 16 }}>+ Add new entry</button>

      {tracker.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 20px", color: C.muted }}>
          <p style={{ fontSize: 14, marginBottom: 4 }}>No entries yet.</p>
          <p style={{ fontSize: 12 }}>Tap “Add new entry” after the next dysregulation event.</p>
        </div>
      )}

      {[...tracker].reverse().map((row) => (
        <div key={row.id} style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "14px 16px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="date" value={row.date || today} onChange={e => update(row.id, "date", e.target.value)} style={{ padding: "4px 7px", borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 11, fontFamily: UI, color: C.brand, background: C.brandTint, fontWeight: 600 }} />
              <select value={row.state} onChange={e => update(row.id, "state", e.target.value)} style={{ padding: "5px 9px", borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 11, fontFamily: UI, color: C.text, background: C.surface }}>{states.map(s => <option key={s} value={s}>{s || "NS State"}</option>)}</select>
            </div>
            <button onClick={() => removeEntry(row.id)} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
          </div>
          <input placeholder="Time & setting (e.g. 3:45pm, kitchen after school)" value={row.time} onChange={e => update(row.id, "time", e.target.value)} style={inputStyle} />
          <textarea placeholder="What was happening in the body before?" value={row.before} onChange={e => update(row.id, "before", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          <input placeholder="The behavior" value={row.behavior} onChange={e => update(row.id, "behavior", e.target.value)} style={inputStyle} />
          <input placeholder="What helped / what didn’t" value={row.helped} onChange={e => update(row.id, "helped", e.target.value)} style={inputStyle} />
          <div style={{ borderTop: `1px dashed ${C.line}`, marginTop: 4, paddingTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.brand, marginBottom: 6 }}>Co-regulation audit</div>
            <div style={{ display: "flex", gap: 6 }}>
              <select value={row.myStateBefore || ""} onChange={e => update(row.id, "myStateBefore", e.target.value)} style={{ flex: 1, padding: "7px 9px", borderRadius: 8, border: `1px solid ${C.brand}30`, fontSize: 11, fontFamily: UI, color: C.text, background: C.brandTint }}>
                <option value="">My state before</option>
                <option value="Regulated">Regulated</option>
                <option value="Mildly activated">Mildly activated</option>
                <option value="Activated">Activated</option>
                <option value="Dysregulated">Dysregulated</option>
              </select>
              <select value={row.myStateDuring || ""} onChange={e => update(row.id, "myStateDuring", e.target.value)} style={{ flex: 1, padding: "7px 9px", borderRadius: 8, border: `1px solid ${C.brand}30`, fontSize: 11, fontFamily: UI, color: C.text, background: C.brandTint }}>
                <option value="">My state during</option>
                <option value="Regulated">Regulated</option>
                <option value="Mildly activated">Mildly activated</option>
                <option value="Activated">Activated</option>
                <option value="Dysregulated">Dysregulated</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      {tracker.length > 0 && (
        <button onClick={addEntry} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px dashed ${C.line}`, background: "transparent", color: C.muted, fontSize: 13, fontFamily: UI, cursor: "pointer", marginTop: 4, marginBottom: 16 }}>+ Add another entry</button>
      )}

      <div style={{ marginTop: 8, background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.brand, marginBottom: 4, fontFamily: UI }}>Reflect</div>
        <p style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>Update these as you see patterns emerge. They strengthen over time.</p>
        {[{ key: "q1", q: "What time of day do most challenging behaviors occur? What is your child’s body experiencing at that time?" }, { key: "q2", q: "Is there a pattern in the antecedents (what happens before)?" }, { key: "q3", q: "Which interventions helped, and which made things worse? What does that tell you about which nervous system state your child was in?" }].map(r => (
          <div key={r.key} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, marginBottom: 4 }}>{r.q}</p>
            <textarea value={reflections[r.key]} onChange={e => setReflections({ ...reflections, [r.key]: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical", marginBottom: 0, background: C.surface }} />
          </div>
        ))}
      </div>
      <PatternAnalyzer tracker={tracker} reflections={reflections} />
    </div>
  );
}

function SignatureSection() {
  const [sig, setSig, loaded] = useStorage("bdw-signature", emptySignature);
  if (!loaded) return <p style={{ color: C.muted }}>Loading...</p>;
  const up = (k, v) => setSig({ ...sig, [k]: v });
  const Field = ({ label, k, rows = 2 }) => (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 12, color: C.text, lineHeight: 1.5, marginBottom: 4 }}>{label}</p>
      <textarea value={sig[k]} onChange={e => up(k, e.target.value)} rows={rows} style={{ width: "100%", padding: "9px 11px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 13, fontFamily: UI, color: C.text, background: C.surface, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
    </div>
  );
  const Section = ({ title, color, children }) => (
    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "16px", marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}><div style={{ width: 7, height: 7, borderRadius: 4, background: color }} /> {title}</div>
      {children}
    </div>
  );
  return (
    <div>
      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, marginBottom: 16 }}>Fill this out based on what you have observed in your specific child. Return to refine it as you learn more.</p>
      <div style={{ background: C.brandTint, borderRadius: 10, padding: "9px 13px", marginBottom: 16, fontSize: 11, color: C.brand, fontWeight: 600 }}>Your entries save automatically.</div>
      <Section title="When my child is regulated (ventral vagal)" color={C.success}>
        <Field label="Their body looks like (posture, muscle tone, facial expression):" k="reg_body" />
        <Field label="Their voice sounds like:" k="reg_voice" rows={1} />
        <Field label="They are able to:" k="reg_able" />
        <Field label="Activities that keep them in this state longest:" k="reg_activities" />
      </Section>
      <Section title="When my child is activated (sympathetic)" color={C.fight}>
        <Field label="The first sign I notice (before escalation):" k="act_first" />
        <Field label="Their body looks like:" k="act_body" />
        <Field label="Triggers that most often push them into this state:" k="act_triggers" />
        <Field label="How long they typically stay activated:" k="act_duration" rows={1} />
        <Field label="What helps them return to regulation:" k="act_helps" />
        <Field label="What makes it worse:" k="act_worse" />
      </Section>
      <Section title="When my child is in shutdown (dorsal vagal)" color={C.freeze}>
        <Field label="What this looks like in my child:" k="shut_looks" />
        <Field label="Situations that most often produce shutdown:" k="shut_situations" />
        <Field label="How long recovery typically takes:" k="shut_duration" rows={1} />
        <Field label="What supports recovery:" k="shut_supports" />
        <Field label="What I used to misread as ‘calm’ that I now recognize as shutdown:" k="shut_misread" />
      </Section>
      <SignatureCoach sig={sig} />
    </div>
  );
}

function ReportSection() {
  const [tracker, , tLoaded] = useStorage("bdw-tracker", emptyTracker);
  const [sig, , sLoaded] = useStorage("bdw-signature", emptySignature);
  const [reflections, , rLoaded] = useStorage("bdw-reflections", emptyReflections);
  const [clock, , cLoaded] = useStorage("bdw-clock", { slots: [], notes: "" });
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!tLoaded || !sLoaded || !rLoaded || !cLoaded) return <p style={{ color: C.muted }}>Loading your data...</p>;

  const filledTracker = tracker.filter(r => r.behavior || r.before);
  const filledSig = Object.entries(sig).filter(([, v]) => v.trim());
  const ready = filledTracker.length >= 3 && filledSig.length >= 4;

  const sigLabels = {
    reg_body: "Regulated state — body presentation", reg_voice: "Regulated state — vocal quality",
    reg_able: "Regulated state — available capacities", reg_activities: "Activities that sustain regulation",
    act_first: "Activation — earliest observable signal", act_body: "Activation — body presentation",
    act_triggers: "Known activation triggers", act_duration: "Typical activation duration",
    act_helps: "Interventions that support return to regulation", act_worse: "Interventions that escalate activation",
    shut_looks: "Shutdown presentation", shut_situations: "Known shutdown triggers",
    shut_duration: "Typical shutdown recovery time", shut_supports: "Supports for shutdown recovery",
    shut_misread: "Previously misread as calm/fine",
  };

  const buildStructuredReport = () => {
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    let r = `CHILD NERVOUS SYSTEM PROFILE\nPrepared by parent/caregiver\nDate: ${date}\n`;
    r += `Generated via The Regulated Child Behavior Decoder Workbook\n`;
    r += `\n${"=".repeat(50)}\n`;
    r += `NOTE: This profile is a parent-observation tool, not a clinical\nassessment. It is intended to support communication between\ncaregivers and providers by documenting observed patterns in the\nchild's nervous system states and behavioral responses.\n`;
    r += `${"=".repeat(50)}\n`;

    r += `\n\nSECTION 1: STATE SIGNATURE\n${"-".repeat(40)}\n`;
    for (const [key, val] of filledSig) {
      r += `\n${sigLabels[key] || key}:\n${val}\n`;
    }

    const dates = filledTracker.map(e => e.date).filter(Boolean).sort();
    const dateRange = dates.length > 1 ? `${dates[0]} to ${dates[dates.length - 1]}` : dates[0] || "dates not recorded";
    const uniqueDays = [...new Set(dates)].length;

    r += `\n\nSECTION 2: BEHAVIORAL OBSERVATIONS (${filledTracker.length} entries across ${uniqueDays} day${uniqueDays !== 1 ? "s" : ""}, ${dateRange})\n${"-".repeat(40)}\n`;
    for (const entry of filledTracker) {
      r += `\n${entry.date || "Date not recorded"}:`;
      if (entry.time) r += `\n  Time/Setting: ${entry.time}`;
      if (entry.state) r += `\n  Child's nervous system state: ${entry.state}`;
      if (entry.myStateBefore) r += `\n  Caregiver state before approaching: ${entry.myStateBefore}`;
      if (entry.myStateDuring) r += `\n  Caregiver state during intervention: ${entry.myStateDuring}`;
      if (entry.before) r += `\n  Antecedent (what was happening before): ${entry.before}`;
      if (entry.behavior) r += `\n  Observed behavior: ${entry.behavior}`;
      if (entry.helped) r += `\n  Response effectiveness: ${entry.helped}`;
      r += `\n`;
    }

    const coregEntries = filledTracker.filter(e => e.myStateBefore || e.myStateDuring);
    if (coregEntries.length > 0) {
      r += `\n\nSECTION 3: CO-REGULATION PATTERNS\n${"-".repeat(40)}\n`;
      const regBefore = coregEntries.filter(e => e.myStateBefore === "Regulated").length;
      const actBefore = coregEntries.filter(e => e.myStateBefore === "Activated" || e.myStateBefore === "Dysregulated").length;
      r += `\nCaregiver was regulated before approaching: ${regBefore} of ${coregEntries.length} entries`;
      r += `\nCaregiver was activated/dysregulated before approaching: ${actBefore} of ${coregEntries.length} entries`;
      r += `\n\nNote: Research on co-regulation (Schore, 2003) identifies the`;
      r += `\ncaregiver's nervous system state as the primary variable in`;
      r += `\nchild dysregulation recovery time.\n`;
    }

    const clockSlots = (clock.slots || []).filter(s => s.zone);
    if (clockSlots.length > 0) {
      const sectionNum = coregEntries.length > 0 ? "4" : "3";
      r += `\n\nSECTION ${sectionNum}: DAILY REGULATION MAP\n${"-".repeat(40)}\n`;
      const red = clockSlots.filter(s => s.zone === "red");
      const yellow = clockSlots.filter(s => s.zone === "yellow");
      const green = clockSlots.filter(s => s.zone === "green");
      if (red.length) r += `\nVulnerable windows: ${red.map(s => s.time + " (" + s.label + ")").join(", ")}`;
      if (yellow.length) r += `\nNarrowing windows: ${yellow.map(s => s.time + " (" + s.label + ")").join(", ")}`;
      if (green.length) r += `\nRegulated windows: ${green.map(s => s.time + " (" + s.label + ")").join(", ")}`;
      if (clock.notes) r += `\n\nCaregiver notes on daily rhythm:\n${clock.notes}`;
      r += `\n`;
    }

    const obsSection = coregEntries.length > 0 ? (clockSlots.length > 0 ? "5" : "4") : (clockSlots.length > 0 ? "4" : "3");
    if (reflections.q1 || reflections.q2 || reflections.q3) {
      r += `\n\nSECTION ${obsSection}: CAREGIVER OBSERVATIONS\n${"-".repeat(40)}\n`;
      if (reflections.q1) r += `\nTiming patterns:\n${reflections.q1}\n`;
      if (reflections.q2) r += `\nAntecedent patterns:\n${reflections.q2}\n`;
      if (reflections.q3) r += `\nIntervention effectiveness:\n${reflections.q3}\n`;
    }

    r += `\n\n${"=".repeat(50)}`;
    r += `\nThis profile was generated using The Regulated Child`;
    r += `\nBehavior Decoder Workbook. For more information:`;
    r += `\nregulatedchild.com`;
    r += `\n${"=".repeat(50)}`;
    return r;
  };

  const generateAIReport = async () => {
    setLoading(true);
    const structured = buildStructuredReport();
    const result = await askAI(
      `A parent has completed a Antecedent Tracker and State Signature for their child using The Regulated Child Behavior Decoder Workbook. They want to generate a professional summary they can present to their child's doctor, therapist, or school evaluator.

Here is their raw data:

${structured}

Please generate a polished, professional CHILD NERVOUS SYSTEM PROFILE report that:

1. Opens with a brief header (child profile date, generated by parent/caregiver, not a clinical assessment)
2. REGULATION PROFILE SUMMARY: 2-3 sentence overview of this child's nervous system patterns based on the data
3. OBSERVED STATES: Summarize the three states (regulated, activated, shutdown) based on the parent's observations — what each looks like in this specific child
4. BEHAVIORAL PATTERNS: Key patterns from the tracker — peak risk times, common triggers, what the antecedents reveal
5. INTERVENTION EFFECTIVENESS: What has been observed to help and what escalates, based on the parent's data
6. CAREGIVER NOTES: Any additional observations the parent recorded
7. Close with a note that this is a parent-observation tool to support provider communication, not a clinical assessment

Format as clean plain text with clear section headers (no markdown). Use professional but accessible language. Keep the tone of an informed parent presenting organized observations — not clinical language, but structured enough that a provider can scan it quickly.

Stay under 500 words. Do not invent data — only use what the parent provided.`
    );
    setReport(result);
    setLoading(false);
  };

  const handleCopy = async () => {
    const text = report || buildStructuredReport();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div>
      <Kicker>The Regulated Child Workbook</Kicker>
      <SectionTitle>Provider Report</SectionTitle>
      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, marginBottom: 6 }}>Generate a structured nervous system profile you can copy and share with your child's doctor, therapist, or school evaluator.</p>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 16 }}>This report compiles your Behavior Tracker observations and State Signature into a professional summary that helps providers understand your child's patterns quickly.</p>

      <div style={{ background: C.fawnBg, borderRadius: 12, padding: "14px 16px", marginBottom: 16, border: `1px solid ${C.fawn}24` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.fawn, marginBottom: 6 }}>For school assessments</div>
        <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>If your child's school is conducting a Functional Behavioral Assessment (FBA), this report provides the structured observational data that supports that process. Share it with the professional conducting the assessment. This workbook does not replace a professional FBA — it gives the professional better data to work with.</p>
      </div>

      {!ready ? (
        <div style={{ background: C.brandTint, borderRadius: 16, padding: "20px", border: `1px solid ${C.brand}1f` }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.brand, marginBottom: 8, fontFamily: UI }}>Complete your observations first</div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 12 }}>The Provider Report needs enough data to be useful. You currently have:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: filledTracker.length >= 3 ? C.success : C.line, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>{filledTracker.length >= 3 ? "✓" : ""}</div>
              <span style={{ fontSize: 13, color: filledTracker.length >= 3 ? C.success : C.muted }}>{filledTracker.length}/10 tracker entries (minimum 3 needed)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: filledSig.length >= 4 ? C.success : C.line, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>{filledSig.length >= 4 ? "✓" : ""}</div>
              <span style={{ fontSize: 13, color: filledSig.length >= 4 ? C.success : C.muted }}>{filledSig.length}/15 signature fields (minimum 4 needed)</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: C.brand, fontFamily: UI }}>Your data is ready</span>
              <AIBadge />
            </div>
            <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 28, lineHeight: 1, color: C.brand }}>{filledTracker.length}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>tracker entries</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 28, lineHeight: 1, color: C.brand }}>{filledSig.length}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>signature fields</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button disabled={loading} onClick={generateAIReport} style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: C.brand, color: "white", fontSize: 14, fontWeight: 600, fontFamily: UI, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1, transition: `all .25s ${EASE}` }}>{loading ? "Generating report..." : "Generate AI-enhanced report"}</button>
              <button onClick={() => { setReport(buildStructuredReport()); }} style={{ padding: "12px 20px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.surface, color: C.muted, fontSize: 14, fontWeight: 500, fontFamily: UI, cursor: "pointer" }}>Use structured data only</button>
            </div>
          </div>

          {report && (
            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: UI }}>Your child's nervous system profile</span>
                <button onClick={handleCopy} style={{ padding: "7px 16px", borderRadius: 999, border: `1px solid ${copied ? C.success : C.brand}`, background: copied ? C.successTint : C.brandTint, color: copied ? C.success : C.brand, fontSize: 12, fontWeight: 600, fontFamily: UI, cursor: "pointer", transition: `all .25s ${EASE}` }}>{copied ? "Copied!" : "Copy to clipboard"}</button>
              </div>
              <div style={{ padding: "20px", maxHeight: 500, overflowY: "auto" }}>
                <pre style={{ fontFamily: UI, fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{report}</pre>
              </div>
              <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.line}`, background: C.bg }}>
                <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.5 }}>This report can be copied and pasted into an email, printed, or saved as a document. It is designed to be readable by pediatricians, therapists, school counselors, and evaluators.</p>
              </div>
            </div>
          )}

          {report && (
            <div style={{ background: C.brandTint, borderRadius: 12, padding: "14px 16px", marginTop: 12, border: `1px solid ${C.brand}1f` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.brand, marginBottom: 6 }}>How to use this report</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, margin: 0 }}>Email it to your provider before the appointment so they can review in advance.</p>
                <p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, margin: 0 }}>Bring a printed copy to evaluations — providers consistently report that structured parent observations are among the most useful data they receive.</p>
                <p style={{ fontSize: 12, color: C.text, lineHeight: 1.55, margin: 0 }}>Update it as you continue tracking — patterns become clearer over 2–3 weeks of observation. You can regenerate this report anytime with new data.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RegulationClock() {
  const templates = {
    school: [
      { time: "6–7am", label: "Waking", zone: "" },
      { time: "7–8am", label: "Morning routine", zone: "" },
      { time: "8–9am", label: "School arrival", zone: "" },
      { time: "9am–12pm", label: "Morning school", zone: "" },
      { time: "12–1pm", label: "Lunch / recess", zone: "" },
      { time: "1–3pm", label: "Afternoon school", zone: "" },
      { time: "3–4pm", label: "After-school transition", zone: "" },
      { time: "4–5pm", label: "Afternoon at home", zone: "" },
      { time: "5–6pm", label: "Dinner transition", zone: "" },
      { time: "6–7pm", label: "Evening", zone: "" },
      { time: "7–8pm", label: "Bedtime routine", zone: "" },
      { time: "8pm+", label: "Settling / sleep", zone: "" },
    ],
    toddler: [
      { time: "6–7am", label: "Waking", zone: "" },
      { time: "7–8am", label: "Morning routine", zone: "" },
      { time: "8–10am", label: "Morning activity", zone: "" },
      { time: "10–10:30am", label: "Morning snack", zone: "" },
      { time: "10:30am–12pm", label: "Late morning", zone: "" },
      { time: "12–1pm", label: "Lunch", zone: "" },
      { time: "1–3pm", label: "Nap / quiet time", zone: "" },
      { time: "3–4pm", label: "After nap transition", zone: "" },
      { time: "4–5pm", label: "Afternoon play", zone: "" },
      { time: "5–6pm", label: "Dinner transition", zone: "" },
      { time: "6–7pm", label: "Evening wind-down", zone: "" },
      { time: "7pm+", label: "Bedtime routine", zone: "" },
    ],
    teen: [
      { time: "6–7am", label: "Waking", zone: "" },
      { time: "7–8am", label: "Getting ready", zone: "" },
      { time: "8am–12pm", label: "Morning school", zone: "" },
      { time: "12–1pm", label: "Lunch / social", zone: "" },
      { time: "1–3pm", label: "Afternoon school", zone: "" },
      { time: "3–5pm", label: "After school", zone: "" },
      { time: "5–7pm", label: "Evening / homework", zone: "" },
      { time: "7–9pm", label: "Free time", zone: "" },
      { time: "9–10pm", label: "Wind-down", zone: "" },
      { time: "10pm+", label: "Sleep", zone: "" },
    ],
    homeschool: [
      { time: "7–8am", label: "Waking", zone: "" },
      { time: "8–9am", label: "Morning routine", zone: "" },
      { time: "9–11am", label: "Morning learning", zone: "" },
      { time: "11am–12pm", label: "Break / movement", zone: "" },
      { time: "12–1pm", label: "Lunch", zone: "" },
      { time: "1–3pm", label: "Afternoon learning", zone: "" },
      { time: "3–5pm", label: "Free time / activities", zone: "" },
      { time: "5–6pm", label: "Dinner transition", zone: "" },
      { time: "6–7pm", label: "Evening", zone: "" },
      { time: "7–8pm", label: "Bedtime routine", zone: "" },
    ],
  };

  const [clock, setClock, loaded] = useStorage("bdw-clock", { slots: templates.school, notes: "" });
  const [editing, setEditing] = useState(false);
  if (!loaded) return <p style={{ color: C.muted }}>Loading...</p>;

  const zones = [
    { value: "", label: "Not rated" },
    { value: "green", label: "Regulated", color: C.success, bg: C.successTint },
    { value: "yellow", label: "Narrowing", color: C.warn, bg: C.warnBg },
    { value: "red", label: "Vulnerable", color: C.terracotta, bg: C.fightBg },
  ];

  const updateSlot = (i, field, val) => {
    const s = [...clock.slots];
    s[i] = { ...s[i], [field]: val };
    setClock({ ...clock, slots: s });
  };
  const addSlot = () => setClock({ ...clock, slots: [...clock.slots, { time: "", label: "", zone: "" }] });
  const removeSlot = (i) => {
    const s = [...clock.slots];
    s.splice(i, 1);
    setClock({ ...clock, slots: s });
  };
  const loadTemplate = (key) => {
    setClock({ ...clock, slots: templates[key].map(s => ({ ...s })) });
    setEditing(false);
  };

  const filled = clock.slots.filter(s => s.zone).length;
  const redSlots = clock.slots.filter(s => s.zone === "red");
  const yellowSlots = clock.slots.filter(s => s.zone === "yellow");

  return (
    <div>
      <Kicker>The Regulated Child Workbook</Kicker>
      <SectionTitle>Regulation Clock</SectionTitle>
      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, marginBottom: 6 }}>Map your child’s regulation capacity across the day. This makes dysregulation predictable instead of surprising.</p>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 16 }}>Rate each time window based on what you typically observe. Update it weekly as patterns shift. The red zones are where prevention strategies belong.</p>

      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.line}`, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.brand }}>Schedule template</span>
          <button onClick={() => setEditing(!editing)} style={{ padding: "5px 11px", borderRadius: 999, border: `1px solid ${C.brand}30`, background: "transparent", color: C.brand, fontSize: 10, fontWeight: 600, fontFamily: UI, cursor: "pointer" }}>{editing ? "Done editing" : "Edit times"}</button>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {[
            { key: "school", label: "School-age (5–12)" },
            { key: "toddler", label: "Toddler / Pre-K" },
            { key: "teen", label: "Teen (13+)" },
            { key: "homeschool", label: "Homeschool" },
          ].map(t => (
            <button key={t.key} onClick={() => loadTemplate(t.key)} style={{ padding: "6px 11px", borderRadius: 999, border: `1px solid ${C.line}`, background: C.bg, color: C.muted, fontSize: 10, fontWeight: 600, fontFamily: UI, cursor: "pointer" }}>{t.label}</button>
          ))}
        </div>
        <p style={{ fontSize: 10, color: C.cite, marginTop: 6, fontStyle: "italic", marginBottom: 0 }}>Loading a template replaces current slots. You can also edit individual times or add custom slots.</p>
      </div>

      <div style={{ background: C.brandTint, borderRadius: 10, padding: "9px 13px", marginBottom: 12, fontSize: 11, color: C.brand, fontWeight: 600 }}>Based on McEwen (1998) allostatic load research: the window narrows under accumulated demand, not just acute threat.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 13px", borderRadius: 10, background: C.successTint, border: `1px solid ${C.success}24` }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: C.success, flexShrink: 0, marginTop: 1 }} />
          <div><div style={{ fontSize: 12, fontWeight: 600, color: C.success }}>Regulated</div><div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>Your child can learn, connect, and respond to requests during this window. Eye contact, flexible thinking, and cooperation are available.</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 13px", borderRadius: 10, background: C.warnBg, border: `1px solid ${C.warn}24` }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: C.warn, flexShrink: 0, marginTop: 1 }} />
          <div><div style={{ fontSize: 12, fontWeight: 600, color: C.warn }}>Narrowing</div><div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>The window of tolerance is shrinking. You may notice increased rigidity, irritability, or less flexibility. Extra scaffolding here prevents the vulnerable zone.</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 13px", borderRadius: 10, background: C.fightBg, border: `1px solid ${C.terracotta}24` }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: C.terracotta, flexShrink: 0, marginTop: 1 }} />
          <div><div style={{ fontSize: 12, fontWeight: 600, color: C.terracotta }}>Vulnerable</div><div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>The window is at its narrowest. Dysregulation is most likely here. This is where demands should be lowest and decompression buffers should be built in.</div></div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {clock.slots.map((slot, i) => {
          const z = zones.find(zn => zn.value === slot.zone);
          const bg = z?.bg || C.surface;
          const borderColor = z?.color ? z.color + "40" : C.line;
          return (
            <div key={i} style={{ background: bg, borderRadius: 12, border: `1px solid ${borderColor}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, transition: `all .25s ${EASE}` }}>
              {editing ? (
                <div style={{ width: 80, flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                  <input value={slot.time} onChange={e => updateSlot(i, "time", e.target.value)} placeholder="Time" style={{ width: "100%", padding: "4px 7px", borderRadius: 6, border: `1px solid ${C.line}`, fontSize: 11, fontFamily: UI, color: C.text, background: C.surface }} />
                  <input value={slot.label} onChange={e => updateSlot(i, "label", e.target.value)} placeholder="Label" style={{ width: "100%", padding: "4px 7px", borderRadius: 6, border: `1px solid ${C.line}`, fontSize: 10, fontFamily: UI, color: C.muted, background: C.surface }} />
                </div>
              ) : (
                <div style={{ width: 80, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{slot.time || "—"}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{slot.label}</div>
                </div>
              )}
              <div style={{ flex: 1, display: "flex", gap: 4 }}>
                {zones.filter(zn => zn.value).map(zn => (
                  <button key={zn.value} onClick={() => updateSlot(i, "zone", slot.zone === zn.value ? "" : zn.value)} style={{
                    flex: 1, padding: "7px 4px", borderRadius: 8, border: `1px solid ${slot.zone === zn.value ? zn.color : C.line}`,
                    background: slot.zone === zn.value ? zn.color : "transparent",
                    color: slot.zone === zn.value ? C.surface : C.muted,
                    fontSize: 10, fontWeight: 600, fontFamily: UI, cursor: "pointer", transition: `all .2s ${EASE}`,
                  }}>{zn.label}</button>
                ))}
              </div>
              {editing && (
                <button onClick={() => removeSlot(i)} style={{ background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>×</button>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <button onClick={addSlot} style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1.5px dashed ${C.brand}40`, background: C.brandTint, color: C.brand, fontSize: 12, fontWeight: 600, fontFamily: UI, cursor: "pointer", marginTop: 6 }}>+ Add time slot</button>
      )}

      {filled >= 6 && (
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "16px", marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.brand, marginBottom: 8, fontFamily: UI }}>What your clock shows</div>
          {redSlots.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.terracotta }}>Vulnerable windows ({redSlots.length}):</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{redSlots.map(s => s.time + " (" + s.label + ")").join(", ")}</div>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 4, fontStyle: "italic" }}>These are where prevention strategies have the highest leverage. Reduce demands, build in decompression buffers, and avoid stacking transitions during these windows.</p>
            </div>
          )}
          {yellowSlots.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.warn }}>Narrowing windows ({yellowSlots.length}):</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{yellowSlots.map(s => s.time + " (" + s.label + ")").join(", ")}</div>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 4, fontStyle: "italic" }}>The window is narrowing but not yet exceeded. Extra scaffolding here prevents the red zone from arriving.</p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 16, background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.brand, marginBottom: 6, fontFamily: UI }}>Notes on your child’s daily rhythm</div>
        <textarea value={clock.notes} onChange={e => setClock({ ...clock, notes: e.target.value })} rows={3} placeholder="What patterns do you notice across the day? Are weekends different from school days? What about holidays or breaks?" style={{ width: "100%", padding: "9px 11px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 13, fontFamily: UI, color: C.text, background: C.surface, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
      </div>

      <div style={{ background: C.fawnBg, borderRadius: 12, padding: "14px 16px", marginTop: 16, border: `1px solid ${C.fawn}24` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.fawn, marginBottom: 6 }}>Research note</div>
        <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>The cortisol awakening response (CAR) peaks 20–30 minutes after waking. Allostatic load accumulates across the school day. By 3:30pm, many children have depleted their regulatory resources even if no single event was acutely stressful. The after-school window and the bedtime transition are the two most predictable vulnerability periods in a child’s day.</p>
      </div>
    </div>
  );
}

// === MAIN ===
const PRODUCT_URLS = {
  workbook: "https://regulatedchild.com/products/behavior-decoder-workbook",
  decoder: "https://regulatedchild.com/products/behavior-decoder-workbook",
};

function PurchaseGate({ productId, productName, onVerified }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const productUrl = PRODUCT_URLS[productId] || "https://regulatedchild.com";

  const handleVerify = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/.netlify/functions/verify-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), product: productId }),
      });
      const data = await r.json();
      if (data.verified) {
        const rec = JSON.stringify({ verified: true, product: productId, ts: Date.now() });
        try { localStorage.setItem("rc-access-" + productId, rec); } catch {}
        try { if (window.storage?.set) window.storage.set("rc-access-" + productId, rec); } catch {}
        onVerified();
        return;
      }
      // Fail closed: no matching purchase -> send to the product page.
      window.location.href = productUrl;
    } catch {
      // Fail closed on any error (incl. no backend) -> never serve paid content ungated.
      window.location.href = productUrl;
    }
  };

  const fieldStyle = {
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
          The Premium Workbook
        </p>
        <h1 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(34px, 10vw, 54px)", lineHeight: 1.05, letterSpacing: "-0.01em", margin: "0 0 18px" }}>
          {productName}
        </h1>
        <p className="rc-rise" style={{ animationDelay: ".18s", fontSize: 17, color: C.muted, lineHeight: 1.6, margin: "0 0 clamp(32px, 9vw, 48px)", maxWidth: "34ch" }}>
          Enter the email you used to purchase.
        </p>

        <div className="rc-rise" style={{ animationDelay: ".24s" }}>
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", color: C.muted, display: "block", marginBottom: 4 }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            onKeyDown={e => e.key === "Enter" && email.trim() && handleVerify()}
            onFocus={e => e.target.style.borderColor = C.brand} onBlur={e => e.target.style.borderColor = C.line}
            style={{ ...fieldStyle, marginBottom: 30 }} />
          <button onClick={handleVerify} disabled={!email.trim() || loading} style={{
            width: "100%", padding: "17px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600, fontFamily: UI,
            cursor: email.trim() && !loading ? "pointer" : "default", background: email.trim() && !loading ? C.brand : C.line, color: email.trim() && !loading ? "white" : C.muted,
            letterSpacing: ".01em", transition: `all .3s ${EASE}`,
          }}>{loading ? "Verifying your purchase..." : "Access my purchase"}</button>
        </div>


        <div className="rc-rise" style={{ animationDelay: ".3s", marginTop: 34, paddingTop: 26, borderTop: `1px solid ${C.line}` }}>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, margin: "0 0 8px" }}>Haven’t purchased yet?</p>
          <a href="https://regulatedchild.com" target="_blank" rel="noopener" style={{ fontSize: 14, fontWeight: 600, color: C.brand, textDecoration: "none" }}>Visit regulatedchild.com to get started</a>
        </div>
      </div>
    </div>
  );
}

export default function BehaviorDecoderWorkbook() {
  const [section, setSection] = useState("bridge");
  const [screen, setScreen] = useState("gate");
  const [decoderFilter, setDecoderFilter] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const fresh = (d) => d && d.verified && d.ts && Date.now() - d.ts < SEVEN_DAYS;
    (async () => {
      try {
        if (window.storage?.get) {
          const r = await window.storage.get("rc-access-workbook");
          if (r?.value) { if (fresh(JSON.parse(r.value))) { setScreen("app"); return; } }
        }
      } catch {}
      try {
        const s = localStorage.getItem("rc-access-workbook");
        if (s) { if (fresh(JSON.parse(s))) setScreen("app"); }
      } catch {}
    })();
  }, []);

  useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [section]);

  if (screen === "gate") return <PurchaseGate productId="workbook" productName="Behavior Decoder Workbook" onVerified={() => setScreen("app")} />;

  const tabs = [
    { id: "bridge", label: "Body-Behavior Bridge", n: "1" },
    { id: "decoder", label: "Extended Decoder", n: "2" },
    { id: "tracker", label: "Behavior Tracker", n: "3" },
    { id: "clock", label: "Regulation Clock", n: "4" },
    { id: "signature", label: "State Signature", n: "5" },
    { id: "misreads", label: "Common Misreads", n: "6" },
    { id: "report", label: "Provider Report", n: "7" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <ArcLogo size={22} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand }}>Behavior Decoder Workbook</span>
            <AIBadge />
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
            {tabs.map(t => {
              const on = section === t.id;
              return (
                <button key={t.id} onClick={() => setSection(t.id)} style={{ padding: "7px 13px", borderRadius: 999, border: `1.5px solid ${on ? C.brand : C.line}`, background: on ? C.brand : C.surface, color: on ? "white" : C.muted, fontSize: 11.5, fontWeight: 600, fontFamily: UI, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: `all .2s ${EASE}` }}>{t.n}. {t.label}</button>
              );
            })}
          </div>
        </div>
      </div>
      <div ref={ref} key={section} style={{ maxWidth: 560, margin: "0 auto", padding: "28px 16px 60px" }}>
        {section === "bridge" && (
          <div className="rc-rise">
            <Kicker>The Regulated Child Workbook</Kicker>
            <SectionTitle>The Body-Behavior Bridge</SectionTitle>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, fontStyle: "italic" }}>The four functions of behavior through a nervous system lens.</p>
            <div style={{ background: C.fawnBg, borderRadius: 12, padding: "14px 16px", marginBottom: 16, border: `1px solid ${C.fawn}24` }}>
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>Before the behavior you see, your child’s body went through a sequence. The behavior is always the last thing that happened. This workbook builds the skill of catching the signals before the cascade completes.</p>
            </div>
            <BodyStateVisual />
            {functions.map((fn, i) => <FunctionCard key={fn.title} fn={fn} index={i} />)}
            <DecodeThisBehavior />
          </div>
        )}
        {section === "decoder" && (
          <div className="rc-rise">
            <Kicker>The Regulated Child Workbook</Kicker>
            <SectionTitle>Extended Behavior Decoder</SectionTitle>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 14, fontStyle: "italic" }}>Organized by state with age ranges, functions, responses, and common misreads.</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              <button onClick={() => setDecoderFilter(null)} style={{ padding: "7px 13px", borderRadius: 999, border: `1.5px solid ${!decoderFilter ? C.brand : C.line}`, background: !decoderFilter ? C.brand : C.surface, color: !decoderFilter ? "white" : C.muted, fontSize: 11.5, fontWeight: 600, fontFamily: UI, cursor: "pointer", transition: `all .2s ${EASE}` }}>All</button>
              {decoderData.map(d => {
                const on = decoderFilter === d.state;
                return (
                  <button key={d.state} onClick={() => setDecoderFilter(d.state)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, border: `1.5px solid ${on ? d.color : C.line}`, background: on ? d.color : C.surface, color: on ? "white" : C.muted, fontSize: 11.5, fontWeight: 600, fontFamily: UI, cursor: "pointer", transition: `all .2s ${EASE}` }}><span style={{ width: 7, height: 7, borderRadius: 4, background: on ? "white" : d.color, flexShrink: 0 }} />{d.state}</button>
                );
              })}
            </div>
            {(decoderFilter ? decoderData.filter(d => d.state === decoderFilter) : decoderData).map(d => (
              <div key={d.state} style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: d.color, boxShadow: `0 0 0 4px ${d.bg}` }} /><span style={{ fontSize: 17, fontWeight: 600, color: d.color, fontFamily: UI }}>{d.state}</span></div>
                {d.behaviors.map(b => <DecoderCard key={b.behavior} item={b} stateColor={d.color} stateBg={d.bg} />)}
              </div>
            ))}
          </div>
        )}
        {section === "tracker" && <div className="rc-rise"><Kicker>The Regulated Child Workbook</Kicker><SectionTitle>Behavior Tracker</SectionTitle><TrackerSection /></div>}
        {section === "clock" && <div className="rc-rise"><RegulationClock /></div>}
        {section === "signature" && <div className="rc-rise"><Kicker>The Regulated Child Workbook</Kicker><SectionTitle>My Child’s State Signature</SectionTitle><SignatureSection /></div>}
        {section === "misreads" && (
          <div className="rc-rise">
            <Kicker>The Regulated Child Workbook</Kicker>
            <SectionTitle>The Common Misreads</SectionTitle>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, fontStyle: "italic" }}>Seven interpretation errors that lead to interventions that escalate rather than de-escalate.</p>
            {misreads.map((m, i) => <MisreadVisualCard key={m.title} m={m} index={i} />)}
          </div>
        )}
        {section === "report" && <div className="rc-rise"><ReportSection /></div>}
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <ArcLogo size={20} />
          <a href="https://www.tiktok.com/@regulatedchild" target="_blank" rel="noopener" style={{ fontSize: 12, color: C.brand, textDecoration: "none", fontWeight: 600, fontFamily: UI, display: "block", marginTop: 8 }}>@regulatedchild</a>
          <p style={{ fontSize: 10, color: C.cite, fontStyle: "italic", marginTop: 6 }}>Educational content, not clinical advice. © The Regulated Child · regulatedchild.com</p>
        </div>
      </div>
    </div>
  );
}
