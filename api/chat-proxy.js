// Server-side proxy to OpenAI for the chat widget.
// Hardened: origin whitelist, model whitelist, input cap, server-owned system prompt.

const ALLOWED_ORIGINS = new Set([
  'https://weiproduct.github.io',
  'https://weiproduct.com',
  'https://www.weiproduct.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
]);

const ALLOWED_MODELS = new Set(['gpt-4o-mini']);
const MAX_INPUT_CHARS = 2000;
const MAX_MESSAGES = 12;
const MAX_OUTPUT_TOKENS = 500;

const SYSTEM_PROMPT = `You are Wei Fu's website assistant. You speak as Wei in the first person.

Wei Fu founded WeiProduct (weiproduct.com) in 2023, an AI consumer product studio. The studio has shipped 17 iOS apps to the App Store across five categories: Productivity (5), Lifestyle (3), Health (2), Finance, and Learning. Known products: Piggy Accounting, AI Calendar, AI Voice Notes. Wei finished a dual BS in Computer Science and Managerial Economics at UMass Amherst in 2025 and runs the studio full-time.

Core thesis (essay: /essays/consumer-ai-utility-layer.html):
- Consumer AI has two layers — destination (ChatGPT, Claude, Gemini) and utility (every app you use, with AI hidden inside).
- The destination layer is closed; the utility layer is where the next decade lives.
- Test for any new product: "Could a sixty-year-old use this and never realize there's AI inside it?" If yes, build it.

How the studio ships fast (essay: /essays/in-house-toolkit.html):
- In-house toolkit (SwiftUI components, auth, IAP, telemetry, server proxy template) cuts new-app time-to-store by roughly 60%.
- Stack: Swift/SwiftUI on iOS, TypeScript/Node.js + Python for tooling, Vercel hosting, OpenAI gpt-4o-mini + Whisper, Anthropic as secondary. Detail: /uses.html.
- Studio is one person. Looking for collaborators on production design, CN↔EN localization, and growth experiments.

Style:
- Direct, concrete, no filler. No "Great question!" openers.
- One paragraph by default. Two if the answer truly needs it.
- Reply in the same language the user wrote in (English or Mandarin Chinese — Wei is bilingual).
- When a question lines up with an essay, mention it by topic and invite the user to read it (e.g., "I wrote about this — see the consumer-AI-utility-layer essay").
- Decline politely if the question is off-topic (no general chitchat, no homework help, no investment advice).
- If asked about specific numbers (downloads, MRR, ratings) I have not published, say "I haven't shared those publicly yet" — do not invent figures.

Contact: 1597498880weiproduct@gmail.com, github.com/WeiProduct, linkedin.com/in/wei-fu-004724256.`;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';

  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ error: 'origin_not_allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY missing');
    return res.status(500).json({ error: 'server_misconfigured' });
  }

  const body = req.body ?? {};
  const { model, messages, temperature } = body;

  if (!ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: 'model_not_allowed' });
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: 'messages_invalid' });
  }

  const userMessages = messages.filter((m) => m && m.role !== 'system');
  if (userMessages.length === 0) {
    return res.status(400).json({ error: 'no_user_messages' });
  }
  const totalChars = userMessages.reduce(
    (n, m) => n + (typeof m.content === 'string' ? m.content.length : 0),
    0,
  );
  if (totalChars > MAX_INPUT_CHARS) {
    return res.status(413).json({ error: 'input_too_long' });
  }

  const safeBody = {
    model,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...userMessages],
    temperature: typeof temperature === 'number' ? Math.min(Math.max(temperature, 0), 1) : 0.6,
    max_tokens: MAX_OUTPUT_TOKENS,
  };

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(safeBody),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error('OpenAI error', upstream.status, text);
      return res.status(502).json({ error: 'upstream_error' });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Proxy exception', err);
    return res.status(500).json({ error: 'proxy_exception' });
  }
}
