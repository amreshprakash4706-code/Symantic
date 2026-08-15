/**
 * SYMANTIC — Groq API Proxy (Serverless)
 * Uses the official groq-sdk + the most advanced model currently available on Groq.
 * Deploy as /api/groq on Vercel.
 */

import Groq from 'groq-sdk';

export default async function handler(req, res) {
  // Method guard
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS (tighten to your domain in production)
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

  if (messages.length > 40) {
    return res.status(400).json({ error: 'Too many messages' });
  }

  for (const m of messages) {
    if (
      !m ||
      typeof m !== 'object' ||
      !['system', 'user', 'assistant'].includes(m.role) ||
      typeof m.content !== 'string'
    ) {
      return res.status(400).json({ error: 'Invalid message format' });
    }
    if (m.content.length > 12000) {
      return res.status(400).json({ error: 'Message content too long' });
    }
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[Symantic] GROQ_API_KEY is not configured');
    return res.status(500).json({ error: 'Service temporarily unavailable' });
  }

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',          // Most advanced model currently on Groq
      messages,
      temperature: 0.65,
      max_tokens: 2048,
      top_p: 0.95,
    });

    return res.status(200).json({
      choices: completion.choices,
      model: completion.model,
      usage: completion.usage,
    });
  } catch (err) {
    console.error('[Symantic] Groq error:', err?.message || err);

    if (err?.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Please try again in a moment.' });
    }
    if (err?.status === 401) {
      return res.status(500).json({ error: 'AI service authentication error' });
    }

    return res.status(500).json({
      error: err?.error?.message || 'Something went wrong with the AI service',
    });
  }
}
