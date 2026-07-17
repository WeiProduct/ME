// Hardened proxy for OpenAI API calls.
// - Origin allow-list (no wildcard CORS)
// - Model allow-list (prevents anyone routing gpt-4 through Wei's key)
// - Input + message-count caps (prevents abuse)
// - Server-side max_tokens ceiling
// System prompt is intentionally CLIENT-side (in js/chat.js) so Wei's
// existing INTJ persona keeps working unchanged.

const ALLOWED_ORIGINS = new Set([
  'https://weifuandy.com',
  'https://www.weifuandy.com',
  'https://weiproduct.github.io',
  'https://weiproduct.com',
  'https://www.weiproduct.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://localhost:5099',
  'http://127.0.0.1:5099',
]);

const ALLOWED_MODELS = new Set(['gpt-3.5-turbo', 'gpt-4o-mini']);
const MAX_INPUT_CHARS = 8000;
const MAX_MESSAGES = 20;
const MAX_OUTPUT_TOKENS = 800;

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
  const { model, messages, temperature, max_tokens } = body;

  if (!ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: 'model_not_allowed' });
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: 'messages_invalid' });
  }

  const totalChars = messages.reduce(
    (n, m) => n + (typeof m.content === 'string' ? m.content.length : 0),
    0,
  );
  if (totalChars > MAX_INPUT_CHARS) {
    return res.status(413).json({ error: 'input_too_long' });
  }

  const safeBody = {
    model,
    messages,
    temperature:
      typeof temperature === 'number' ? Math.min(Math.max(temperature, 0), 1) : 0.7,
    max_tokens:
      typeof max_tokens === 'number'
        ? Math.min(Math.max(max_tokens, 1), MAX_OUTPUT_TOKENS)
        : 500,
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
