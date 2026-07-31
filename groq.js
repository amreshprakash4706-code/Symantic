/**
 * SYMANTIC — Groq API Proxy (Serverless)
 * Secure, validated, production-ready handler.
 * Deploy as /api/groq on Vercel / Netlify / Cloudflare Workers.
 */

export default async function handler(req, res) {
  // Method guard
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS (tighten in production to your domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Parse & validate body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { messages } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Basic shape validation + size limit to prevent abuse
  if (messages.length > 40) {
    return res.status(400).json({ error: 'Too many messages' });
  }

  for (const m of messages) {
    if (!m || typeof m !== 'object' || !['system', 'user', 'assistant'].includes(m.role) || typeof m.content !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }
    if (m.content.length > 8000) {
      return res.status(400).json({ error: 'Message content too long' });
    }
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Symantic] GROQ_API_KEY is not configured');
    return res.status(500).json({ error: 'Service temporarily unavailable' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 28000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        max_tokens: 700,
        top_p: 0.95,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      console.error('[Symantic] Groq upstream error', response.status, data);
      return res.status(response.status >= 500 ? 502 : response.status).json({
        error: data?.error?.message || 'Upstream AI service error',
      });
    }

    // Minimal response shape for the client
    return res.status(200).json({
      choices: data.choices,
      model: data.model,
      usage: data.usage,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out' });
    }
    console.error('[Symantic] Proxy error', err.message);
    return res.status(500).json({ error: 'Something went wrong with the AI service' });
  }
}
