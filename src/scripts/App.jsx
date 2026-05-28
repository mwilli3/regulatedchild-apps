import { useState, useRef, useEffect } from "react";

/* ── Design tokens (OKLCH, brand hues preserved) ───────────────────── */
const C = {
  text: "oklch(0.26 0.03 45)", muted: "oklch(0.50 0.02 55)", cite: "oklch(0.55 0.02 55)",
  bg: "oklch(0.975 0.008 70)", surface: "oklch(0.995 0.004 75)", line: "oklch(0.90 0.01 60)",
  brand: "oklch(0.53 0.12 40)", brandDark: "oklch(0.44 0.11 40)", terracotta: "oklch(0.53 0.12 40)",
  success: "oklch(0.50 0.04 150)", successTint: "oklch(0.94 0.02 150)",
};

// Terracotta-hue tints used for AI / delivery / brand blocks.
const BRAND_TINT = "oklch(0.945 0.035 42)";

const DISPLAY = "'Young Serif', serif";
const UI = "'Outfit', sans-serif";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const f = UI; // legacy alias used throughout (preserves SVG/text fontFamily references)

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

const RC_SYSTEM = `You are an AI assistant embedded in The Regulated Child In-the-Moment Scripts Pack (Research Edition). You help parents find the right words for dysregulation moments, grounded in polyvagal theory, developmental neuroscience, and attachment research.

RULES:
- Always frame behavior as nervous system communication, not choice
- Body mechanism before behavioral implication
- Never pathologize the child or imply parental failure
- Never use clinical diagnostic language
- Never use: journey, healing, transformation, toxic, empath
- Keep responses warm, direct, parent-accessible
- Reference the nervous system state when relevant
- Keep responses concise (under 300 words)
- Always remind: your regulated nervous system delivers the script

THE 20 SCRIPTS (by category):
MELTDOWN: #1 "I'm here. I'm not going anywhere." #2 "I can see your body is really activated. I'm staying right here." #3 "I know you're having a big body moment. I love you. That doesn't change." #4 "You're starting to come back. Take your time."
SHUTDOWN: #5 "I notice you've gone quiet. You don't have to say anything." #6 "I'm going to sit near you. No agenda. Just here." #7 "Your body might not have the words yet. I'm not going anywhere."
DE-ESCALATION: #8 "I notice your body might be getting activated. Let's slow down." #9 "Something's feeling hard. I'm not going to make it harder. What do you need?" #10 "This next part might feel hard. I'm right here." #11 "Your body needs to move before your brain can think."
TRANSITION: #12 "Five more minutes. I'll let you know when it's time." #13 "Stopping is hard. Let's give your body a moment to catch up." #14 "We're about to go in. [preview] I'll be right there."
MORNING: #15 "Good morning. No rush. Let's just be here for a minute." #16 "Your body is still waking up. One thing at a time."
HOMEWORK: #17 "Your brain has been working hard all day. We'll wait thirty minutes." #18 "Your brain is tired, not broken. Let's just read the first problem."
REPAIR: #19 "I got loud and I shouldn't have. That was my nervous system — not your fault." #20 "I love you. We're okay. You didn't do anything wrong — and neither did I."`;

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

const scienceMechanisms = [
  { num: 1, title: "Vocal prosody and the ventral vagal circuit", text: "Stephen Porges’ Polyvagal Theory identifies a neural circuit that is exquisitely sensitive to the prosodic features of the human voice: pitch, rhythm, pacing, and intonation. A slow, low, soft voice activates the ventral vagal system and signals safety. The words are secondary to the prosodic features.", cite: "Porges, S.W. (2011). The Polyvagal Theory. W.W. Norton." },
  { num: 2, title: "Naming the state reduces amygdala activation", text: "Research by Lieberman et al. using fMRI demonstrated that labeling a physiological state — affect labeling — reduces amygdala activation and increases prefrontal activity. Scripts that name the state (‘your body is really activated’) are neurologically functional, not just empathic.", cite: "Lieberman, M.D. et al. (2007). Putting feelings into words. Psychological Science, 18(5), 421–428." },
  { num: 3, title: "Presence without demand activates the attachment system", text: "Schore’s research establishes that right-hemisphere-to-right-hemisphere communication is the primary regulatory mechanism in attachment. This mechanism is inhibited when the caregiver introduces demands. Scripts signaling presence without demand activate the co-regulation pathway.", cite: "Schore, A.N. (2003). Affect Regulation and the Repair of the Self. W.W. Norton." },
];

const categories = [
  { id: "meltdown", label: "Meltdown", num: "02", color: "oklch(0.53 0.12 40)", bg: "oklch(0.945 0.035 42)",
    intro: "For full sympathetic activation at or near peak. No logic, no instructions, no consequences.",
    footer: "No questions, no reasoning, no consequences during a meltdown. The prefrontal cortex is offline.",
    scripts: [
      { num: 1, sit: "At the peak", script: "“I’m here. I’m not going anywhere.”", why: "Activates the ventral vagal safety circuit: the presence signal addresses attachment threat, the commitment signal provides predictability.", delivery: "Say it once. Slow, low, soft, falling intonation. Hold still at child’s level.", adapt: "Toddlers: ‘I’m right here.’ Adolescents: add a physical anchor. Shutdown: reduce volume further." },
      { num: 2, sit: "When they’re moving toward you", script: "“I can see your body is really activated right now. I’m going to stay right here.”", why: "First clause activates affect-labeling (reducing amygdala). Second clause provides presence-without-demand.", delivery: "Don’t step back. Drop shoulders visibly. Mirror neurons read your body before words.", adapt: "Younger: ‘Your body is really big right now. I’m staying.’ Physical aggression: step sideways, not backward." },
      { num: 3, sit: "When they say ‘I hate you’", script: "“I know you’re having a really big body moment. I love you. That doesn’t change.”", why: "Bypasses content, addresses the nervous system state directly, provides the relational anchor the activated system is afraid of losing.", delivery: "No urgency. Don’t correct. The attachment statement is the whole response. Let silence hold.", adapt: "After recovery: ‘I know you didn’t mean what you said, and I meant what I said.’" },
      { num: 4, sit: "When the peak is passing", script: "“You’re starting to come back. I’m right here. Take your time.”", why: "Names the recovery trajectory, removes implicit urgency. ‘Take your time’ prevents the child from rushing resolution for the parent’s comfort.", delivery: "Only when body is softening: breathing slowing, muscles releasing. Before that, it re-escalates.", adapt: "Adolescents: ‘Take your time’ alone. Younger: add physical contact if receptive." },
    ],
  },
  { id: "shutdown", label: "Shutdown", num: "03", color: "oklch(0.45 0.07 300)", bg: "oklch(0.93 0.025 300)",
    intro: "For dorsal vagal collapse. Quieter, slower, less directive than meltdown approach.",
    footer: "Shutdown is not indifference. Warm, quiet presence is the only tool that opens the pathway back.",
    scripts: [
      { num: 5, sit: "When they go flat and quiet", script: "“I notice you’ve gone quiet. I’m right here. You don’t have to say anything.”", why: "Any demand deepens shutdown. This names the state, provides presence, and explicitly removes the demand for response.", delivery: "Voice below normal register. Reduce movement. No required eye contact.", adapt: "Young: ‘I see you. I’m right here.’ Adolescents: ‘I’m not going to push. I’ll be here when you’re ready.’" },
      { num: 6, sit: "When they won’t make eye contact", script: "“I’m going to sit near you for a few minutes. No agenda. Just here.”", why: "‘No agenda’ is a neuroceptive safety signal — the absence of social evaluation is a key precondition for dorsal vagal recovery.", delivery: "Sit alongside, not opposite. Engage in something parallel — reading, a quiet task.", adapt: "If proximity activates: more space but stay visible. If they want contact: offer without requiring." },
      { num: 7, sit: "When they say ‘I don’t know’", script: "“That’s okay. Your body might not have the words yet. I’m not going anywhere.”", why: "Validates genuine neurological reality — interoception is developmental. Removes shame, preserves connection.", delivery: "Don’t follow with another question. Silence after is correct.", adapt: "Build body-first vocabulary in calm moments: ‘Where do you feel it?’ ‘Heavy or light?’" },
    ],
  },
  { id: "deescalation", label: "De-escalation", num: "01", color: "oklch(0.50 0.04 150)", bg: "oklch(0.93 0.018 150)",
    intro: "For catching activation before it peaks. This is where prevention lives.",
    footer: "Prevention at Stage 1 or 2 avoids the peak entirely. These scripts become most effective when practiced and familiar.",
    scripts: [
      { num: 8, sit: "When you see the early signs", script: "“I notice your body might be getting activated. Let’s slow down before we keep going.”", why: "Affect labeling at maximum effectiveness — the prefrontal cortex is still online and can integrate the naming.", delivery: "Neutral observation tone, not alarm. Sound like you’re noting the weather.", adapt: "Resistant to naming: ‘Let’s take a breath.’ Older children: ‘Let’s pause.’" },
      { num: 9, sit: "When they’re getting rigid", script: "“Something’s feeling hard right now. I’m not going to make it harder. What do you need?”", why: "Affect labeling without specifying emotion + alliance signal + agency (controllability reduces threat response).", delivery: "The question is genuine. Honor the answer.", adapt: "Young: ‘Do you want a squeeze or some space?’" },
      { num: 10, sit: "Before a known difficult moment", script: "“This next part might feel hard for your body. I’m right here and we’ll do it together.”", why: "Converts unknown threat to known (predictability is a primary neuroceptive safety signal) + adds co-regulation anchor.", delivery: "1–2 minutes before, not at the moment. Matter-of-fact, not warning.", adapt: "Calibrate: ‘might feel a little hard’ vs. ‘is probably going to be hard for your body.’" },
      { num: 11, sit: "When they need to move first", script: "“Your body needs to move before your brain can think. Let’s do that first.”", why: "Rhythmic movement completes the stress cycle by metabolizing cortisol and adrenaline. The phrase names the biological prerequisite.", delivery: "Offer specific movement. Rhythm matters more than intensity. Present as a plan.", adapt: "Sensory Seekers: high-intensity. Sensitive Regulators: gentle, rhythmic movement." },
    ],
  },
  { id: "transition", label: "Transition", num: "04", color: "oklch(0.50 0.035 250)", bg: "oklch(0.93 0.014 250)",
    intro: "Transitions require disengagement, tolerating ambiguity, and orienting to something new — all threat-relevant.",
    footer: "The nervous system is resisting the neurological cost of disengagement and re-engagement, not the destination.",
    scripts: [
      { num: 12, sit: "The five-minute warning", script: "“Five more minutes and then we’re going to wrap up. I’ll let you know when it’s time.”", why: "A predictability intervention that converts unpredictable interruption into a known upcoming event.", delivery: "Matter-of-fact. Always keep the commitment.", adapt: "More processing time: 10–15 min warning. Escalates at warning: visual timer instead." },
      { num: 13, sit: "When they resist ending something", script: "“I know stopping is hard. Your brain is still in that activity. Let’s give your body a moment to catch up.”", why: "Names the neurological reality of task disengagement as a prefrontal demand, not defiance.", delivery: "Build in a transition ritual: a count, a breath, a closing action.", adapt: "High task persistence: more warning time. Flexible transitioners: less scaffolding." },
      { num: 14, sit: "Arriving somewhere new", script: "“We’re about to go in. You know what’s going to happen: [brief preview]. I’ll be right there.”", why: "Previewing converts novelty to familiarity, reducing the orienting response and preserving regulatory capacity.", delivery: "Concrete, honest preview. Vague ‘it’ll be fine’ provides no neuroceptive information.", adapt: "Familiar place: remind of specific positive details. New: identify one familiar element." },
    ],
  },
  { id: "morning", label: "Morning", num: "05", color: "oklch(0.62 0.10 50)", bg: "oklch(0.945 0.03 50)",
    intro: "The cortisol awakening response (CAR) peaks 20–30 minutes after waking.",
    footer: "A structurally accommodated morning routine built around CAR biology reduces dysregulation before it requires a script.",
    scripts: [
      { num: 15, sit: "When they wake up already activated", script: "“Good morning. I’m here. No rush. Let’s just be here for a minute.”", why: "Creates a demand-free interval allowing the CAR arc to complete before the nervous system is asked to perform.", delivery: "No eye contact required. No expectation of response. The absence of stimulation is the intervention.", adapt: "Build a structural 10–15 minute CAR buffer into the routine." },
      { num: 16, sit: "When the morning is falling apart", script: "“Your body is still waking up. We’re going to slow down and do one thing at a time.”", why: "Matches demand to available cognitive resource — working memory is reduced by CAR cortisol elevation.", delivery: "One instruction per completed step. Identify the minimum needed to leave the house.", adapt: "Visual learners: picture-based morning sequence externalizes the working memory load." },
    ],
  },
  { id: "homework", label: "Homework", num: "06", color: "oklch(0.52 0.045 245)", bg: "oklch(0.93 0.018 245)",
    intro: "The after-school window is the highest-risk period for homework dysregulation.",
    footer: "The intervention is structural: move the decompression buffer before the demand, and the demand becomes manageable.",
    scripts: [
      { num: 17, sit: "When they won’t start", script: "“Your brain has been working hard all day. We’re going to wait thirty minutes and then try. You’re not in trouble.”", why: "The 30-minute buffer allows cortisol to reduce and the prefrontal cortex to recover. ‘You’re not in trouble’ is neurologically functional — removing perceived threat expands cognitive resources.", delivery: "Mean the last clause. Removing the threat is the mechanism.", adapt: "Movement-based decompression: include physical activity. Track how long your child needs." },
      { num: 18, sit: "When they say ‘I can’t do it’", script: "“Your brain is tired, not broken. Let’s just read the first problem together. That’s all we’re doing right now.”", why: "Task initiation is the executive function most sensitive to depletion. The smallest possible first step is more effective than motivation. The child must believe stopping is genuinely available.", delivery: "Be literal. Read the first problem. Stop. Ask if they want to continue.", adapt: "Learning differences: adapt first step. Shame-prone: separate support from performance discussion." },
    ],
  },
  { id: "repair", label: "Repair", num: "07", color: "oklch(0.53 0.12 40)", bg: "oklch(0.945 0.035 42)",
    intro: "Used after you’ve lost your own regulated state. Both nervous systems must be genuinely back in the window.",
    footer: "The repair conversation is a biological intervention that builds attachment security. A parent who repairs consistently is giving the most research-supported gift in developmental science.",
    scripts: [
      { num: 19, sit: "The repair opener", script: "“I want to talk about what happened earlier. I got loud and I shouldn’t have. That was my nervous system getting overwhelmed — not your fault.”", why: "Rupture-repair is the core mechanism of secure attachment development. The acknowledgment names the mechanism, removes blame, and models self-awareness.", delivery: "Timing is everything. Wait for genuine regulation signs in both of you.", adapt: "Three components only: acknowledge, explain without excusing, reconnect. No behavior correction." },
      { num: 20, sit: "The reconnection close", script: "“I love you. We’re okay. You didn’t do anything wrong by having a hard moment — and neither did I.”", why: "The last clause (‘neither did I’) is the most important. It normalizes nervous system activation as universal biology, not moral failure — reducing shame, which is the strongest predictor of future dysregulation.", delivery: "Physical contact if receptive. Verbal + physical reconnection for full effectiveness.", adapt: "Adolescents: a note, a text, or a small gesture can carry the repair signal when words feel too exposing." },
    ],
  },
];

/* ── Shared bits ───────────────────────────────────────────────────── */
const Kicker = ({ children, color = C.terracotta, style }) => (
  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color, margin: "0 0 14px", fontFamily: UI, ...style }}>{children}</p>
);

const TintBlock = ({ label, color, tint, children, style }) => (
  <div style={{ background: tint, borderRadius: 14, padding: "14px 16px", ...style }}>
    <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color, marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);

/* ── AI components (logic unchanged) ──────────────────────────────── */
function AIBadge() {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 8, background: BRAND_TINT, fontSize: 10, fontWeight: 600, color: C.brand, letterSpacing: ".06em", fontFamily: UI }}>AI-POWERED</span>;
}

function WhatDoISay() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ background: C.surface, borderRadius: 18, border: `1px solid ${C.line}`, padding: "22px 20px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 20, color: C.text }}>What do I say right now?</span>
        <AIBadge />
      </div>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, marginBottom: 14, fontFamily: UI }}>Describe the moment and the AI will recommend the right script with delivery guidance specific to your situation.</p>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder="e.g. My 4-year-old just went completely silent after I raised my voice. She won't look at me..." style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 14, fontFamily: UI, color: C.text, background: C.bg, outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: 12 }} />
      <button disabled={!input.trim() || loading} onClick={async () => {
        setLoading(true);
        const r = await askAI(`A parent describes this moment:\n\n"${input}"\n\nBased on the 20 scripts in the In-the-Moment Scripts Pack:\n1. Identify the nervous system state\n2. Recommend the specific script number and exact words\n3. Give specific delivery instructions for THIS moment (voice, body position, timing)\n4. Suggest one adaptation based on the details they shared\n5. Remind them of the one rule: regulate yourself first\n\nKeep it warm, direct, and under 250 words. Start with the script they need.`);
        setResult(r); setLoading(false);
      }} style={{ padding: "12px 22px", borderRadius: 12, border: "none", background: C.brand, color: "white", fontSize: 14, fontWeight: 600, fontFamily: UI, cursor: input.trim() && !loading ? "pointer" : "default", opacity: input.trim() && !loading ? 1 : 0.5, transition: `all .3s ${EASE}` }}>{loading ? "Finding the right script..." : "Find my script"}</button>
      {result && <TintBlock label="Your script" color={C.brand} tint={BRAND_TINT} style={{ marginTop: 16 }}><p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", fontFamily: UI }}>{result}</p></TintBlock>}
    </div>
  );
}

function ScriptPersonalizer({ script, catColor }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  if (!show) return <button onClick={() => setShow(true)} style={{ padding: "7px 14px", borderRadius: 10, border: `1px solid ${C.line}`, background: "transparent", fontSize: 11.5, fontWeight: 600, fontFamily: UI, color: C.brand, cursor: "pointer", marginTop: 10, letterSpacing: ".02em" }}>Personalize this script with AI</button>;
  return (
    <div style={{ marginTop: 12, background: C.bg, borderRadius: 12, padding: "14px", border: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ fontSize: 12.5, fontWeight: 600, color: C.brand, fontFamily: UI }}>Personalize this script</span><AIBadge /></div>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Child's age, what just happened, their typical pattern..." style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 13, fontFamily: UI, color: C.text, background: C.surface, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
      <button disabled={!input.trim() || loading} onClick={async () => {
        setLoading(true);
        const r = await askAI(`Personalize this script for a parent's specific situation:\n\nScript: ${script.script}\nOriginal adaptation guidance: ${script.adapt}\n\nParent's context: "${input}"\n\nProvide:\n1. The adapted version of the script for their child\n2. One specific delivery adjustment for their situation\n3. What to do immediately after saying it\n\nKeep it under 150 words.`);
        setResult(r); setLoading(false);
      }} style={{ padding: "7px 16px", borderRadius: 10, border: "none", background: C.brand, color: "white", fontSize: 12, fontWeight: 600, fontFamily: UI, cursor: input.trim() && !loading ? "pointer" : "default", opacity: input.trim() && !loading ? 1 : 0.5 }}>{loading ? "..." : "Personalize"}</button>
      {result && <TintBlock label="Personalized" color={C.brand} tint={BRAND_TINT} style={{ marginTop: 10, borderRadius: 12 }}><p style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", fontFamily: UI }}>{result}</p></TintBlock>}
    </div>
  );
}

/* ── Visual components (recolored to OKLCH, interactivity preserved) ── */
function ScienceDiagram({ num }) {
  if (num === 1) return (
    <svg viewBox="0 0 280 100" width="100%" height="80" style={{ marginBottom: 8 }}>
      <rect x="0" y="0" width="280" height="100" rx="10" fill={BRAND_TINT} />
      <path d="M30 50 Q50 30 70 50 Q90 70 110 50 Q130 30 150 50" fill="none" stroke={C.brand} strokeWidth="2" opacity="0.6" />
      <path d="M30 50 Q50 35 70 50 Q90 65 110 50 Q130 35 150 50" fill="none" stroke={C.brand} strokeWidth="1" opacity="0.3" />
      <line x1="160" y1="50" x2="190" y2="50" stroke={C.brand} strokeWidth="1.5" />
      <polygon points="190,45 200,50 190,55" fill={C.brand} />
      <circle cx="230" cy="45" r="18" fill="oklch(0.45 0.07 300 / 0.13)" stroke={C.brand} strokeWidth="1" />
      <path d="M222 48 Q230 54 238 48" fill="none" stroke={C.brand} strokeWidth="1.5" opacity="0.6" />
      <text x="230" y="75" textAnchor="middle" style={{ fontSize: 8, fill: C.muted, fontFamily: f }}>Safety signal received</text>
      <text x="90" y="85" textAnchor="middle" style={{ fontSize: 8, fill: C.muted, fontFamily: f }}>Slow, low, soft voice</text>
    </svg>
  );
  if (num === 2) return (
    <svg viewBox="0 0 320 140" width="100%" height="120" style={{ marginBottom: 8 }}>
      <rect x="0" y="0" width="320" height="140" rx="10" fill={BRAND_TINT} />
      <rect x="12" y="14" width="80" height="50" rx="8" fill={C.surface} stroke={C.brand} strokeWidth="0.8" />
      <text x="52" y="32" textAnchor="middle" style={{ fontSize: 8, fill: C.brand, fontFamily: f, fontWeight: 600 }}>"Your body is</text>
      <text x="52" y="43" textAnchor="middle" style={{ fontSize: 8, fill: C.brand, fontFamily: f, fontWeight: 600 }}>really activated"</text>
      <text x="52" y="56" textAnchor="middle" style={{ fontSize: 7, fill: C.muted, fontFamily: f }}>Affect label</text>
      <line x1="96" y1="38" x2="112" y2="38" stroke={C.brand} strokeWidth="1" opacity="0.5" />
      <polygon points="112,34 120,38 112,42" fill={C.brand} opacity="0.5" />
      <g>
        <text x="155" y="12" textAnchor="middle" style={{ fontSize: 7, fill: C.muted, fontFamily: f, fontWeight: 500 }}>Before</text>
        <ellipse cx="155" cy="40" rx="28" ry="22" fill="none" stroke={C.muted} strokeWidth="1" opacity="0.4" />
        <circle cx="145" cy="44" r="11" fill="oklch(0.53 0.12 40 / 0.32)" stroke={C.terracotta} strokeWidth="1.2" />
        <text x="145" y="41" textAnchor="middle" style={{ fontSize: 6, fill: C.terracotta, fontFamily: f, fontWeight: 600 }}>Amyg</text>
        <text x="145" y="49" textAnchor="middle" style={{ fontSize: 5, fill: C.terracotta, fontFamily: f }}>active</text>
        <circle cx="165" cy="33" r="8" fill="oklch(0.45 0.07 300 / 0.10)" stroke={C.brand} strokeWidth="0.8" opacity="0.5" />
        <text x="165" y="35" textAnchor="middle" style={{ fontSize: 5, fill: C.brand, fontFamily: f, opacity: 0.5 }}>PFC</text>
      </g>
      <line x1="186" y1="38" x2="202" y2="38" stroke={C.brand} strokeWidth="1" opacity="0.5" />
      <polygon points="202,34 210,38 202,42" fill={C.brand} opacity="0.5" />
      <g>
        <text x="245" y="12" textAnchor="middle" style={{ fontSize: 7, fill: C.brand, fontFamily: f, fontWeight: 500 }}>After naming</text>
        <ellipse cx="245" cy="40" rx="28" ry="22" fill="none" stroke={C.brand} strokeWidth="1" opacity="0.4" />
        <circle cx="235" cy="44" r="7" fill="oklch(0.53 0.12 40 / 0.13)" stroke={C.terracotta} strokeWidth="0.8" opacity="0.5" />
        <text x="235" y="46" textAnchor="middle" style={{ fontSize: 5, fill: C.terracotta, fontFamily: f, opacity: 0.5 }}>Amyg</text>
        <circle cx="253" cy="33" r="12" fill="oklch(0.45 0.07 300 / 0.22)" stroke={C.brand} strokeWidth="1.2" />
        <text x="253" y="31" textAnchor="middle" style={{ fontSize: 6, fill: C.brand, fontFamily: f, fontWeight: 600 }}>PFC</text>
        <text x="253" y="39" textAnchor="middle" style={{ fontSize: 5, fill: C.brand, fontFamily: f }}>active</text>
      </g>
      <rect x="30" y="76" width="260" height="48" rx="8" fill={C.surface} stroke={C.line} strokeWidth="0.5" />
      <circle cx="50" cy="88" r="4" fill="oklch(0.53 0.12 40 / 0.26)" stroke={C.terracotta} strokeWidth="0.8" />
      <text x="60" y="90" style={{ fontSize: 7, fill: C.terracotta, fontFamily: f, fontWeight: 500 }}>Amygdala: threat detector</text>
      <text x="156" y="90" style={{ fontSize: 7, fill: C.muted, fontFamily: f }}>— naming the state quiets it</text>
      <circle cx="50" cy="102" r="4" fill="oklch(0.45 0.07 300 / 0.22)" stroke={C.brand} strokeWidth="0.8" />
      <text x="60" y="104" style={{ fontSize: 7, fill: C.brand, fontFamily: f, fontWeight: 500 }}>PFC: regulation center</text>
      <text x="148" y="104" style={{ fontSize: 7, fill: C.muted, fontFamily: f }}>— naming gives it something to work with</text>
      <text x="160" y="133" textAnchor="middle" style={{ fontSize: 7, fill: C.cite, fontFamily: f, fontStyle: "italic" }}>Lieberman et al. (2007) — fMRI evidence for affect labeling</text>
    </svg>
  );
  if (num === 3) return (
    <svg viewBox="0 0 280 100" width="100%" height="80" style={{ marginBottom: 8 }}>
      <rect x="0" y="0" width="280" height="100" rx="10" fill={BRAND_TINT} />
      <circle cx="60" cy="30" r="12" fill="oklch(0.45 0.07 300 / 0.18)" stroke={C.brand} strokeWidth="1" />
      <rect x="50" y="44" width="20" height="30" rx="5" fill="oklch(0.45 0.07 300 / 0.10)" stroke={C.brand} strokeWidth="1" />
      <text x="60" y="88" textAnchor="middle" style={{ fontSize: 8, fill: C.muted, fontFamily: f }}>Parent</text>
      <path d="M82 40 Q115 25 148 40" fill="none" stroke={C.brand} strokeWidth="1.5" opacity="0.5" strokeDasharray="4 3" />
      <path d="M82 50 Q115 35 148 50" fill="none" stroke={C.brand} strokeWidth="1" opacity="0.3" strokeDasharray="4 3" />
      <text x="115" y="65" textAnchor="middle" style={{ fontSize: 7, fill: C.brand, fontFamily: f }}>No demands</text>
      <text x="115" y="75" textAnchor="middle" style={{ fontSize: 7, fill: C.brand, fontFamily: f }}>Just presence</text>
      <circle cx="170" cy="30" r="12" fill="oklch(0.53 0.12 40 / 0.18)" stroke={C.terracotta} strokeWidth="1" />
      <rect x="160" y="44" width="20" height="30" rx="5" fill="oklch(0.53 0.12 40 / 0.10)" stroke={C.terracotta} strokeWidth="1" />
      <text x="170" y="88" textAnchor="middle" style={{ fontSize: 8, fill: C.muted, fontFamily: f }}>Child</text>
      <text x="230" y="35" style={{ fontSize: 8, fill: C.brand, fontFamily: f, fontWeight: 500 }}>Attachment</text>
      <text x="230" y="47" style={{ fontSize: 8, fill: C.brand, fontFamily: f, fontWeight: 500 }}>system</text>
      <text x="230" y="59" style={{ fontSize: 8, fill: C.brand, fontFamily: f, fontWeight: 500 }}>activates</text>
    </svg>
  );
  return null;
}

const categoryDelivery = {
  meltdown: { icon: "volume-down", cues: ["Slow, low, soft voice", "Hold still — no movement", "Crouch to their level", "Say it once, then silence"] },
  shutdown: { icon: "quiet", cues: ["Below normal register", "Sit alongside, not opposite", "Reduce all movement", "No eye contact required"] },
  deescalation: { icon: "neutral", cues: ["Neutral observation tone", "Sound like noting the weather", "No alarm or urgency", "Genuine curiosity"] },
  transition: { icon: "matter-of-fact", cues: ["Matter-of-fact delivery", "Not apologetic", "Not urgent", "1–2 min before, not at the moment"] },
  morning: { icon: "warmth", cues: ["No expectations", "Warm, quiet presence", "No screens for either of you", "Absence of stimulation"] },
  homework: { icon: "patience", cues: ["Mean the last clause", "Literal about scope reduction", "One instruction only", "Remove the threat"] },
  repair: { icon: "connection", cues: ["Wait for genuine window", "Both systems regulated", "Physical contact if receptive", "Keep it short"] },
};

function DeliveryVisualBar({ catId, catColor, catBg }) {
  const d = categoryDelivery[catId];
  if (!d) return null;
  return (
    <div style={{ background: catBg, borderRadius: 14, padding: "16px", marginBottom: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <svg viewBox="0 0 40 40" width="36" height="36" style={{ flexShrink: 0, marginTop: 2 }}>
        <circle cx="20" cy="20" r="18" fill="oklch(0 0 0 / 0)" stroke={catColor} strokeWidth="1" opacity="0.5" />
        <path d="M14 17 L14 23 L18 23 L23 27 L23 13 L18 17 Z" fill={catColor} opacity="0.6" />
        <path d="M26 15 Q30 20 26 25" fill="none" stroke={catColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: catColor, marginBottom: 7, fontFamily: UI }}>Delivery cues for this category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {d.cues.map((cue, i) => (
            <span key={i} style={{ padding: "4px 10px", borderRadius: 8, background: C.surface, fontSize: 11, color: catColor, fontFamily: UI, fontWeight: 500 }}>{cue}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScriptCard({ s, catColor, catBg, isWorked, onToggleWorked }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.line}`, overflow: "hidden", background: C.surface, marginBottom: 10 }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "16px 18px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: C.muted, fontFamily: UI }}>#{s.num} · {s.sit}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={e => { e.stopPropagation(); onToggleWorked && onToggleWorked(s.num); }} style={{ background: isWorked ? C.successTint : "none", border: isWorked ? `1px solid ${C.success}` : `1px solid ${C.line}`, borderRadius: 8, cursor: "pointer", fontSize: 11, padding: "3px 7px", color: isWorked ? C.success : C.line, fontFamily: UI, lineHeight: 1 }}>✓</button>
            <span style={{ fontSize: 15, color: C.muted, transform: open ? "rotate(180deg)" : "rotate(0)", transition: `transform .3s ${EASE}` }}>{"▾"}</span>
          </div>
        </div>
        <p style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 400, color: C.text, lineHeight: 1.4, margin: 0 }}>{s.script}</p>
      </div>
      {open && (
        <div className="rc-rise" style={{ animationDuration: ".4s", padding: "0 18px 18px" }}>
          <TintBlock label="Why it works" color={catColor} tint={catBg} style={{ marginBottom: 8, borderRadius: 12 }}>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0, fontFamily: UI }}>{s.why}</p>
          </TintBlock>
          <TintBlock label="Delivery" color={C.brand} tint={BRAND_TINT} style={{ marginBottom: 8, borderRadius: 12 }}>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0, fontFamily: UI }}>{s.delivery}</p>
          </TintBlock>
          <TintBlock label="Adaptation" color={C.terracotta} tint="oklch(0.945 0.035 42)" style={{ borderRadius: 12 }}>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0, fontFamily: UI }}>{s.adapt}</p>
          </TintBlock>
          <ScriptPersonalizer script={s} catColor={catColor} />
        </div>
      )}
    </div>
  );
}

const arcStages = [
  { num: 1, title: "Baseline drift", color: "oklch(0.65 0.10 75)", scripts: "None yet", time: "Minutes to hours before", signs: "Less flexible, more irritable, harder to reach, sensory tolerance decreasing", action: "This is the prevention window. If you can see it, you can intervene before escalation. Reduce demands, offer sensory input, lower stimulation.", scriptNums: [] },
  { num: 2, title: "Trigger", color: "oklch(0.62 0.10 50)", scripts: "Scripts 8–11", time: "The moment", signs: "A demand, transition, sensory input, or social moment pushes the system past threshold. Amygdala fires. Cortisol and adrenaline released.", action: "De-escalation scripts. Name the state. Remove pressure. Offer movement. This is your highest-leverage moment.", scriptNums: [8, 9, 10, 11] },
  { num: 3, title: "Escalation", color: "oklch(0.53 0.12 40)", scripts: "Scripts 1–4 or 5–7", time: "Seconds to minutes", signs: "Sympathetic: heart rate up, muscles tight, breathing shallow, meltdown visible. OR Dorsal vagal: shutdown, flat affect, withdrawal.", action: "Meltdown scripts (1–4) or Shutdown scripts (5–7) depending on the state. No logic. No consequences. Body and voice only.", scriptNums: [1, 2, 3, 4, 5, 6, 7] },
  { num: 4, title: "Peak", color: "oklch(0.43 0.14 35)", scripts: "Script 1 only", time: "1–5 minutes", signs: "Maximum activation. Cannot be reasoned with, cannot self-regulate, cannot access language meaningfully.", action: "‘I’m here. I’m not going anywhere.’ That’s it. Hold still. Hold space. Wait.", scriptNums: [1] },
  { num: 5, title: "Recovery", color: "oklch(0.45 0.07 300)", scripts: "No scripts", time: "20–30 minutes after peak", signs: "The screaming may have stopped but cortisol and adrenaline are still being metabolized. May look calm but is not yet regulated.", action: "Wait. Do not teach. Do not debrief. Do not deliver consequences. The nervous system is still processing. Attempting repair here will be rejected or escalate.", scriptNums: [] },
  { num: 6, title: "Reconnection window", color: "oklch(0.50 0.04 150)", scripts: "Scripts 19–20", time: "When you see the signs", signs: "Eye contact returns. Breathing slows. Body posture softens. Child initiates or responds to small social contact.", action: "The window is open. This is when — and only when — repair happens. Script 19 (acknowledge), then Script 20 (reconnect). Keep it short.", scriptNums: [19, 20] },
];

const escalationPhrases = [
  { phrase: "“Calm down”", why: "The amygdala processes volume and urgency before it processes word meaning. The instruction to calm down is received as an additional threat signal — the tone communicates alarm, which intensifies sympathetic activation. The child’s nervous system hears ‘danger’ before it hears ‘calm.’", mechanism: "Amygdala threat detection", instead: "Lower your voice. Drop your shoulders. Say nothing, or: ‘I’m here.’" },
  { phrase: "“Use your words”", why: "Language processing requires prefrontal cortex access. During sympathetic or dorsal vagal activation, the prefrontal cortex is offline. Asking a child to use words during dysregulation is asking them to access a neural system that is temporarily unavailable. The request registers as an impossible demand, which increases frustration and extends the episode.", mechanism: "Prefrontal cortex offline", instead: "Wait for the window to reopen. Words become available when the prefrontal cortex comes back online — not before." },
  { phrase: "“You’re fine” / “It’s not a big deal”", why: "Invalidation of the child’s internal state deepens dorsal vagal shutdown. The child’s nervous system is reporting a genuine threat experience. Being told that experience is not real teaches the child that their interoceptive signals are unreliable — which undermines the very capacity (interoception) that self-regulation depends on.", mechanism: "Interoceptive invalidation", instead: "‘I can see this is really hard for your body right now.’ Name what you observe, not what you want them to feel." },
  { phrase: "“If you don’t stop, then...”", why: "Consequence threats require the child to process cause-and-effect, anticipate future outcomes, and modify behavior accordingly. These are executive functions that require prefrontal access. During dysregulation, the prefrontal cortex is offline. The threat is processed only as additional danger, which narrows the window of tolerance further.", mechanism: "Executive function unavailable", instead: "Consequences belong in Stage 6 (reconnection window), never during Stages 3–5. Deliver them when the prefrontal cortex can actually process them." },
  { phrase: "“Stop crying” / “Big kids don’t cry”", why: "Crying is a parasympathetic discharge mechanism — it is the nervous system’s attempt to complete the stress cycle and return to baseline. Suppressing it interrupts the recovery process and teaches the child that their body’s natural regulation mechanism is shameful, increasing the likelihood of shutdown responses in future episodes.", mechanism: "Suppressing parasympathetic discharge", instead: "Let the crying run. It is functional. ‘I’m right here. Take your time.’" },
  { phrase: "“Why did you do that?”", why: "The question ‘why’ requires self-reflection, causal reasoning, and verbal articulation — all prefrontal cortex functions. During dysregulation, this question has no available answer. The child either fabricates one (increasing shame), says ‘I don’t know’ (which is neurologically accurate), or escalates because the demand is unresolvable.", mechanism: "Causal reasoning offline", instead: "‘We’ll talk about what happened when your body is calm.’ The why conversation belongs in Stage 6." },
  { phrase: "“Go to your room” / forced isolation", why: "Isolation during dysregulation removes the co-regulatory resource the child’s nervous system is seeking. Research on attachment identifies proximity to a safe adult as the primary mechanism for childhood regulation. Forced separation is perceived as abandonment by an activated nervous system, which intensifies the threat response.", mechanism: "Attachment system threat", instead: "‘I’m not going anywhere.’ Create space without removing yourself. Step sideways, not away." },
  { phrase: "“You always do this” / “Every single time”", why: "Global attributions (‘always,’ ‘every time’) convert a momentary nervous system event into a character assessment. The child’s shame response activates, which research identifies as the emotion most likely to predict future dysregulation and relational withdrawal. You are describing a pattern — but in the moment, it registers as an identity.", mechanism: "Shame activation", instead: "Address this episode only. ‘Right now, your body is really activated.’ Pattern discussions belong outside of episodes entirely." },
];

function DysregulationArc() {
  const [activeStage, setActiveStage] = useState(null);
  return (
    <div>
      <Kicker>The Dysregulation Arc</Kicker>
      <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7vw, 34px)", lineHeight: 1.1, color: C.text, margin: "0 0 14px" }}>Six stages, one arc</h2>
      <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, marginBottom: 6, fontFamily: UI }}>Every dysregulation episode follows the same six-stage physiological arc. The stage your child is in determines which script is available — and which ones will make things worse.</p>
      <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, marginBottom: 18, fontFamily: UI }}>The most common parenting mistake is using Stage 6 language during Stage 4. Matching the script to the stage is the whole system.</p>

      <svg viewBox="0 0 320 120" width="100%" height="100" style={{ marginBottom: 16 }}>
        <rect x="0" y="0" width="320" height="120" rx="12" fill={C.surface} stroke={C.line} strokeWidth="1" />
        {arcStages.map((s, i) => {
          const x = 12 + i * 51;
          const heights = [30, 50, 75, 90, 55, 25];
          const y = 100 - heights[i];
          return (
            <g key={i} onClick={() => setActiveStage(activeStage === i ? null : i)} style={{ cursor: "pointer" }}>
              <rect x={x} y={y} width="42" height={heights[i]} rx="6" fill={s.color} opacity={activeStage === i ? 1 : 0.55} style={{ transition: `opacity .3s ${EASE}` }} />
              <text x={x + 21} y={y - 4} textAnchor="middle" style={{ fontSize: 9, fill: s.color, fontFamily: DISPLAY, fontWeight: 400 }}>{s.num}</text>
              <text x={x + 21} y={115} textAnchor="middle" style={{ fontSize: 5.5, fill: C.muted, fontFamily: f }}>{s.title.split(" ")[0]}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {arcStages.map((s, i) => (
          <div key={i} onClick={() => setActiveStage(activeStage === i ? null : i)} style={{ borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden", cursor: "pointer", background: C.surface }}>
            <div style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: s.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 400, fontFamily: DISPLAY, flexShrink: 0 }}>{s.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 400, color: C.text }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: C.muted, fontFamily: UI }}>{s.scripts} · {s.time}</div>
              </div>
              <div style={{ fontSize: 15, color: C.muted, transform: activeStage === i ? "rotate(180deg)" : "rotate(0)", transition: `transform .3s ${EASE}` }}>{"▾"}</div>
            </div>
            {activeStage === i && (
              <div className="rc-rise" style={{ animationDuration: ".4s", padding: "0 16px 16px" }}>
                <TintBlock label="What you see" color={s.color} tint={C.bg} style={{ marginBottom: 8, borderRadius: 12 }}>
                  <p style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6, margin: 0, fontFamily: UI }}>{s.signs}</p>
                </TintBlock>
                <TintBlock label="What to do" color={C.brand} tint={BRAND_TINT} style={{ borderRadius: 12 }}>
                  <p style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6, margin: 0, fontFamily: UI }}>{s.action}</p>
                </TintBlock>
                {s.scriptNums.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {s.scriptNums.map(n => <span key={n} style={{ padding: "3px 9px", borderRadius: 8, background: C.bg, fontSize: 11, fontWeight: 600, color: s.color, fontFamily: UI }}>#{n}</span>)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", background: BRAND_TINT, borderRadius: 16, padding: "26px 22px 22px", marginTop: 18, overflow: "hidden" }}>
        <span aria-hidden="true" style={{ position: "absolute", top: -14, left: 14, fontFamily: DISPLAY, fontSize: 100, lineHeight: 1, color: C.brand, opacity: 0.15 }}>“</span>
        <div style={{ position: "relative" }}>
          <Kicker color={C.brand} style={{ marginBottom: 10 }}>Research note</Kicker>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0, fontFamily: UI }}>The physiological arc of a stress response — the metabolization of cortisol and adrenaline — takes approximately 20–30 minutes after the peak (McEwen, 1998). A child who has gone quiet may still be in Stage 5. Teaching, consequences, and repair attempted before Stage 6 are processed as additional threat, not as learning.</p>
        </div>
      </div>
    </div>
  );
}

function EscalationLibrary() {
  const [active, setActive] = useState(null);
  return (
    <div>
      <Kicker>What Not to Say — and Why</Kicker>
      <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7vw, 34px)", lineHeight: 1.1, color: C.text, margin: "0 0 14px" }}>The escalation library</h2>
      <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, marginBottom: 6, fontFamily: UI }}>Eight common responses that escalate dysregulation — with the neurological mechanism behind each one.</p>
      <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, marginBottom: 18, fontFamily: UI }}>These are not bad parenting. They are instinctive responses that feel logical but work against the nervous system’s biology. Understanding the mechanism is what makes them interruptible.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {escalationPhrases.map((ep, i) => (
          <div key={i} onClick={() => setActive(active === i ? null : i)} style={{ borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden", cursor: "pointer", background: C.surface }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: "oklch(0.945 0.035 42)", color: C.terracotta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, fontFamily: UI, flexShrink: 0 }}>×</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 400, color: C.terracotta, lineHeight: 1.25 }}>{ep.phrase}</div>
                <div style={{ fontSize: 11.5, color: C.muted, fontFamily: UI }}>{ep.mechanism}</div>
              </div>
              <div style={{ fontSize: 15, color: C.muted, transform: active === i ? "rotate(180deg)" : "rotate(0)", transition: `transform .3s ${EASE}` }}>{"▾"}</div>
            </div>
            {active === i && (
              <div className="rc-rise" style={{ animationDuration: ".4s", padding: "0 16px 16px" }}>
                <TintBlock label="Why it escalates" color={C.terracotta} tint="oklch(0.945 0.035 42)" style={{ marginBottom: 8, borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0, fontFamily: UI }}>{ep.why}</p>
                </TintBlock>
                <TintBlock label="Say this instead" color={C.brand} tint={BRAND_TINT} style={{ borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0, fontFamily: UI }}>{ep.instead}</p>
                </TintBlock>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", background: BRAND_TINT, borderRadius: 16, padding: "26px 22px 22px", marginTop: 18, overflow: "hidden" }}>
        <span aria-hidden="true" style={{ position: "absolute", top: -14, left: 14, fontFamily: DISPLAY, fontSize: 100, lineHeight: 1, color: C.brand, opacity: 0.15 }}>“</span>
        <div style={{ position: "relative" }}>
          <Kicker color={C.brand} style={{ marginBottom: 10 }}>The pattern beneath all eight</Kicker>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0, fontFamily: UI }}>Every phrase on this list has the same underlying structure: it requires the child to use a neural system (prefrontal cortex, language processing, causal reasoning, interoception) that is temporarily offline during dysregulation. The escalation is not caused by the content of the words. It is caused by the mismatch between the demand and the available neural resource. When you match your response to the stage — not to the behavior — the escalation pattern breaks.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Purchase gate (verification logic unchanged; editorial restyle) ── */
const PRODUCT_URLS = {
  research: "https://regulatedchild.com/products/in-the-moment-scripts-pack",
  scripts: "https://regulatedchild.com/products/in-the-moment-scripts-pack",
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
      <div style={{ position: "relative", maxWidth: 480, margin: "0 auto", padding: "clamp(28px, 9vw, 64px) 24px 48px" }}>
        <div className="rc-rise" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(40px, 12vw, 72px)" }}>
          <ArcLogo size={34} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.brand }}>The Regulated Child</span>
        </div>

        <p className="rc-rise" style={{ animationDelay: ".06s", fontSize: 12, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: C.terracotta, margin: "0 0 14px" }}>
          Research Edition
        </p>
        <h1 className="rc-rise" style={{ animationDelay: ".12s", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(34px, 10vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.01em", margin: "0 0 18px" }}>
          {productName}
        </h1>
        <p className="rc-rise" style={{ animationDelay: ".18s", fontSize: 16, color: C.muted, lineHeight: 1.6, margin: "0 0 clamp(28px, 8vw, 40px)", maxWidth: "34ch" }}>
          Enter the email you used to purchase.
        </p>

        <div className="rc-rise" style={{ animationDelay: ".24s" }}>
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em", color: C.muted, display: "block", marginBottom: 4 }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && email.trim() && handleVerify()} placeholder="your@email.com"
            onFocus={e => e.target.style.borderColor = C.brand} onBlur={e => e.target.style.borderColor = C.line}
            style={{ ...inputStyle, marginBottom: 30 }} />
          <button onClick={handleVerify} disabled={!email.trim() || loading} style={{
            width: "100%", padding: "17px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600, fontFamily: UI,
            cursor: email.trim() && !loading ? "pointer" : "default", background: email.trim() && !loading ? C.brand : C.line,
            color: email.trim() && !loading ? "white" : C.muted, letterSpacing: ".01em", transition: `all .3s ${EASE}`,
          }}>{loading ? "Verifying your purchase..." : "Access my purchase"}</button>
        </div>


        <div className="rc-rise" style={{ animationDelay: ".3s", marginTop: 34, paddingTop: 26, borderTop: `1px solid ${C.line}` }}>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, margin: "0 0 6px", fontFamily: UI }}>Haven’t purchased yet?</p>
          <a href="https://regulatedchild.com" target="_blank" rel="noopener" style={{ fontSize: 14, fontWeight: 600, color: C.brand, textDecoration: "none", fontFamily: UI }}>Visit regulatedchild.com to get started</a>
        </div>
      </div>
    </div>
  );
}

export default function ScriptsPackResearch() {
  const [section, setSection] = useState("ai");
  const [screen, setScreen] = useState("gate");
  const [worked, setWorked] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const fresh = (d) => d && d.verified && d.ts && Date.now() - d.ts < SEVEN_DAYS;
    (async () => {
      try {
        if (window.storage?.get) {
          const r = await window.storage.get("rc-access-research");
          if (r?.value) { if (fresh(JSON.parse(r.value))) { setScreen("app"); return; } }
        }
      } catch {}
      try {
        const s = localStorage.getItem("rc-access-research");
        if (s) { if (fresh(JSON.parse(s))) setScreen("app"); }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (window.storage?.get) { const r = await window.storage.get("rr-script-worked"); if (r?.value) { setWorked(JSON.parse(r.value)); return; } }
      } catch {}
      try { const s = localStorage.getItem("rr-script-worked"); if (s) setWorked(JSON.parse(s)); } catch {}
    })();
  }, []);

  useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [section]);

  if (screen === "gate") return <PurchaseGate productId="research" productName="Scripts Pack — Research Edition" onVerified={() => setScreen("app")} />;

  const toggleWorked = (num) => {
    setWorked(prev => {
      const next = prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num];
      const data = JSON.stringify(next);
      setTimeout(() => {
        (async () => {
          try { if (window.storage?.set) await window.storage.set("rr-script-worked", data); } catch {}
          try { localStorage.setItem("rr-script-worked", data); } catch {}
        })();
      }, 300);
      return next;
    });
  };
  const arcOrder = ["deescalation", "meltdown", "shutdown", "transition", "morning", "homework", "repair"];
  const orderedCats = arcOrder.map(id => categories.find(c => c.id === id)).filter(Boolean);
  const tabs = [
    { id: "ai", label: "AI Assistant" },
    ...orderedCats.map(c => ({ id: c.id, label: `${c.num} ${c.label}` })),
    { id: "working", label: "✓ Working (" + worked.length + ")" },
    { id: "arc", label: "The Arc" },
    { id: "escalation", label: "What Not to Say" },
    { id: "science", label: "The Science" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: UI, color: C.text }}>
      <FontLink />
      <div style={{ padding: "14px 16px", background: C.surface, borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12, flexWrap: "wrap" }}>
            <ArcLogo size={24} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.brand }}>Scripts Pack · Research Edition</span>
            <AIBadge />
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
            {tabs.map(t => {
              const on = section === t.id;
              return (
                <button key={t.id} onClick={() => setSection(t.id)} style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${on ? C.brand : C.line}`, background: on ? BRAND_TINT : C.surface, color: on ? C.brand : C.muted, fontSize: 11.5, fontWeight: 600, fontFamily: UI, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: `all .25s ${EASE}` }}>{t.label}</button>
              );
            })}
          </div>
        </div>
      </div>
      <div ref={ref} style={{ maxWidth: 560, margin: "0 auto", padding: "28px 16px 64px" }}>
        {section === "ai" && (
          <div key="ai" className="rc-rise">
            <Kicker color={C.brand}>AI Script Assistant</Kicker>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7vw, 34px)", lineHeight: 1.1, color: C.text, margin: "0 0 8px" }}>Find the right words</h2>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 18, fontFamily: UI, lineHeight: 1.55 }}>Describe what’s happening and get the right script instantly — with delivery guidance tailored to your moment.</p>
            <WhatDoISay />
            <TintBlock label="Tip" color={C.brand} tint={BRAND_TINT} style={{ borderRadius: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: 0, fontFamily: UI, lineHeight: 1.6 }}>You can also personalize any individual script — open any script in the category tabs and tap “Personalize this script with AI.”</p>
            </TintBlock>
          </div>
        )}
        {section === "science" && (
          <div key="science" className="rc-rise">
            <Kicker color={C.brand}>The Science</Kicker>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7vw, 34px)", lineHeight: 1.1, color: C.text, margin: "0 0 8px" }}>The mechanisms beneath</h2>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 18, fontFamily: UI, lineHeight: 1.55 }}>Three mechanisms that make every script in this pack work.</p>
            {scienceMechanisms.map(m => (
              <div key={m.num} style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "18px", marginBottom: 12 }}>
                <ScienceDiagram num={m.num} />
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 15, background: BRAND_TINT, color: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 400, fontFamily: DISPLAY, flexShrink: 0 }}>{m.num}</div>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 400, color: C.text, marginBottom: 6, lineHeight: 1.25 }}>{m.title}</div>
                    <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.65, margin: "0 0 8px", fontFamily: UI }}>{m.text}</p>
                    <p style={{ fontSize: 11.5, color: C.cite, fontStyle: "italic", margin: 0, fontFamily: UI }}>{m.cite}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {section === "working" && (() => {
          const allS = categories.flatMap(ct => ct.scripts.map(s => ({ ...s, catId: ct.id, catLabel: ct.label, catColor: ct.color, catBg: ct.bg })));
          const workedScripts = allS.filter(s => worked.includes(s.num));
          const catCounts = {};
          workedScripts.forEach(s => { catCounts[s.catId] = (catCounts[s.catId] || 0) + 1; });
          const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
          const topCatData = topCat ? categories.find(ct => ct.id === topCat[0]) : null;
          const triedCats = Object.keys(catCounts);
          const untriedCats = categories.filter(ct => !triedCats.includes(ct.id));
          return (
            <div key="working" className="rc-rise">
              <Kicker color={C.success}>What’s Working</Kicker>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7vw, 34px)", lineHeight: 1.1, color: C.text, margin: "0 0 8px" }}>Your effective scripts</h2>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 18, fontFamily: UI, lineHeight: 1.55 }}>Scripts you’ve marked as effective for your child. Tap the ✓ on any script card to add or remove it.</p>
              {worked.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ fontSize: 14, color: C.muted, marginBottom: 4, fontFamily: UI }}>No scripts marked yet.</p>
                  <p style={{ fontSize: 12.5, color: C.muted, fontFamily: UI }}>Use a script, then tap the ✓ checkmark on the card to track what works for your family.</p>
                </div>
              ) : (
                <>
                  {worked.length >= 2 && (
                    <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, padding: "20px", marginBottom: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.success, marginBottom: 12, fontFamily: UI }}>Your pattern</div>
                      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div style={{ fontSize: 30, fontWeight: 400, color: C.success, fontFamily: DISPLAY }}>{worked.length}</div>
                          <div style={{ fontSize: 10.5, color: C.muted, fontFamily: UI }}>effective scripts</div>
                        </div>
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div style={{ fontSize: 30, fontWeight: 400, color: C.success, fontFamily: DISPLAY }}>{triedCats.length}</div>
                          <div style={{ fontSize: 10.5, color: C.muted, fontFamily: UI }}>categories</div>
                        </div>
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div style={{ fontSize: 19, fontWeight: 400, color: topCatData?.color || C.brand, fontFamily: DISPLAY, lineHeight: 1.5 }}>{topCatData?.label || "—"}</div>
                          <div style={{ fontSize: 10.5, color: C.muted, fontFamily: UI }}>strongest</div>
                        </div>
                      </div>
                      <TintBlock label="Insight" color={C.success} tint={C.successTint} style={{ marginBottom: 10, borderRadius: 12 }}>
                        <p style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6, margin: 0, fontFamily: UI }}>
                          {topCat && topCat[1] >= 2
                            ? (topCat[0] === "deescalation" ? `${topCat[1]} of your ${worked.length} effective scripts are in De-escalation. You’re catching activation before it peaks — the highest-leverage intervention point on the dysregulation arc.`
                              : topCat[0] === "meltdown" ? `${topCat[1]} of your ${worked.length} effective scripts are in Meltdown. You’re strongest at Stage 4 (peak) — the hardest moment to stay regulated. That takes practice.`
                              : topCat[0] === "shutdown" ? `${topCat[1]} of your ${worked.length} effective scripts are in Shutdown. You’re reading dorsal vagal collapse accurately — many parents miss this state entirely because it looks like calm.`
                              : topCat[0] === "repair" ? `${topCat[1]} of your ${worked.length} effective scripts are in Repair. Your repair instinct is strong — Tronick’s research shows this predicts secure attachment more reliably than rupture absence.`
                              : topCat[0] === "transition" ? `${topCat[1]} of your ${worked.length} effective scripts are in Transition. You’re managing the neurological cost of disengagement and re-engagement — the hidden demand most parents don’t see.`
                              : `${topCat[1]} of your ${worked.length} effective scripts are in ${topCatData?.label}. You’re building strong pattern recognition in this area.`)
                            : `You have effective scripts across ${triedCats.length} categories — you’re building a broad, flexible toolkit.`}
                        </p>
                      </TintBlock>
                      {untriedCats.length > 0 && (
                        <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px" }}>
                          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, marginBottom: 6, fontFamily: UI }}>Categories to explore</div>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {untriedCats.map(ct => (
                              <button key={ct.id} onClick={() => setSection(ct.id)} style={{ padding: "5px 11px", borderRadius: 8, background: ct.bg, border: "none", fontSize: 11, color: ct.color, fontWeight: 600, fontFamily: UI, cursor: "pointer" }}>{ct.label}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {workedScripts.map(s => (
                    <ScriptCard key={s.num} s={s} catColor={s.catColor} catBg={s.catBg} isWorked={true} onToggleWorked={toggleWorked} />
                  ))}
                </>
              )}
            </div>
          );
        })()}
        {section === "arc" && <div key="arc" className="rc-rise"><DysregulationArc /></div>}
        {section === "escalation" && <div key="escalation" className="rc-rise"><EscalationLibrary /></div>}
        {categories.filter(c => c.id === section).map(cat => (
          <div key={cat.id} className="rc-rise">
            <Kicker color={cat.color}>{cat.num} · {cat.label}</Kicker>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7vw, 34px)", lineHeight: 1.1, color: C.text, margin: "0 0 10px" }}>{cat.label}</h2>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, fontFamily: UI, lineHeight: 1.6 }}>{cat.intro}</p>
            <DeliveryVisualBar catId={cat.id} catColor={cat.color} catBg={cat.bg} />
            {cat.scripts.map(s => <ScriptCard key={s.num} s={s} catColor={cat.color} catBg={cat.bg} isWorked={worked.includes(s.num)} onToggleWorked={toggleWorked} />)}
            <div style={{ background: cat.bg, borderRadius: 14, padding: "16px 18px", marginTop: 10 }}>
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0, fontFamily: UI }}>{cat.footer}</p>
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <ArcLogo size={20} />
          <a href="https://www.tiktok.com/@regulatedchild" target="_blank" rel="noopener" style={{ fontSize: 13, color: C.brand, textDecoration: "none", fontWeight: 600, fontFamily: UI, display: "block", marginTop: 8 }}>@regulatedchild</a>
          <p style={{ fontSize: 11, color: C.cite, fontStyle: "italic", marginTop: 8, fontFamily: UI }}>Educational content, not clinical advice. © The Regulated Child · regulatedchild.com</p>
        </div>
      </div>
    </div>
  );
}
