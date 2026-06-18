// AI proxy for the TRC apps (the "analyze.js" equivalent, named ai-proxy.js to
// match the path the apps fetch: /.netlify/functions/ai-proxy).
// TRC-scoped compliance: body mechanism before behavior, no clinical / IEP / 504
// / SPED / diagnostic / treatment guidance, crisis interception, rate limiting.
//
// Env (Netlify, TRC site):
//   ANTHROPIC_API_KEY   required
//   ANTHROPIC_MODEL     optional (default below)

const ALLOW_ORIGIN = "https://apps.regulatedchild.com";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MAX_PER_HOUR = 20;

const cors = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
  // Personal, sensitive AI output — never cache in any proxy/CDN.
  "Cache-Control": "no-store",
};
const json = (statusCode, body) => ({ statusCode, headers: cors, body: JSON.stringify(body) });

// Best-effort in-memory rate limit (per warm instance).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_HOUR;
}

const CRISIS = [
  "suicide", "kill myself", "kill himself", "kill herself", "want to die", "end my life",
  "hurt myself", "harm myself", "self-harm", "self harm", "hurt my child", "hurt the baby",
  "abuse", "abusing", "molest",
];
const CRISIS_REPLY =
  "It sounds like this might be an emergency, and that is bigger than anything this tool can help with. " +
  "Please reach out right now: call or text 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line). " +
  "If anyone is in immediate danger, call 911. You deserve real support from a person, not an app.";

const SYSTEM = `You are an assistant embedded in The Regulated Child apps. You help parents understand child behavior through a nervous system lens (polyvagal theory, developmental neuroscience, attachment).

NON-NEGOTIABLE RULES:
- Frame behavior as nervous system communication, never as choice, manipulation, or defiance.
- Lead with the body mechanism before any behavioral implication.
- Never pathologize the child and never imply parental failure.
- Do NOT give clinical, diagnostic, medical, therapeutic-protocol, IEP, 504, or special-education guidance. If asked, warmly redirect to a licensed professional or the child's school team.
- No diagnoses, no supplements, no treatments.
- Banned words: journey, healing, transformation, toxic, empath, proven. Say "vagal tone", never "vagal nerve".
- Use hedged language ("research suggests", "may support"). Warm, direct, parent-accessible. Never academic.
- Reference nervous system states (ventral vagal, sympathetic, dorsal vagal) when relevant.
- Always recommend consulting a licensed professional for clinical concerns.
- Keep responses under 300 words.`;

function scrub(text) {
  return String(text || "").replace(/vagal nerve/gi, "vagal tone");
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const ip = (event.headers["x-nf-client-connection-ip"] || event.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (rateLimited(ip)) return json(429, { error: "You've reached the limit for now. Please try again later." });

  let prompt;
  try {
    ({ prompt } = JSON.parse(event.body || "{}"));
  } catch {
    return json(400, { error: "Invalid request body." });
  }
  if (!prompt || !prompt.trim()) return json(400, { error: "Empty request." });

  const lower = prompt.toLowerCase();
  if (CRISIS.some((k) => lower.includes(k))) return json(200, { text: CRISIS_REPLY });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(500, { error: "AI is not configured yet (missing ANTHROPIC_API_KEY)." });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 800,
        temperature: 0.5,
        system: SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return json(502, { error: "The AI service is temporarily unavailable.", detail: detail.slice(0, 300) });
    }
    const data = await r.json();
    const text = scrub((data.content || []).map((b) => b.text || "").join("").trim());
    return json(200, { text: text || "No response received. Please try again." });
  } catch {
    return json(502, { error: "The AI service is temporarily unavailable." });
  }
};
