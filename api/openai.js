// Legacy endpoint — retired 2026-07-17.
// The site now uses /api/chat-proxy (hardened: origin/model/size allow-lists).
// This stub exists so old links fail closed instead of exposing the API key
// behind wildcard CORS.
export default async function handler(req, res) {
  res.setHeader('Allow', 'POST, OPTIONS');
  return res.status(410).json({
    error: 'endpoint_retired',
    use: '/api/chat-proxy',
  });
}
