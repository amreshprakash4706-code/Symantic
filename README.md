# SYMANTIC — Gaming Intelligence

**Production frontend + serverless AI proxy.**

Real-time predictions, live intelligence, and honest analysis for gamers and esports. Zero hype. Built to win.

## What's included

- Fully interactive dashboard (Intelligence metrics, Live Feed, Predictions, News, AI Co-pilot)
- Command palette (`⌘K` / `Ctrl+K`)
- Theme toggle, saved articles, watchlist, persistent login/pro state (localStorage)
- AI chat with multi-turn history + strong local knowledge base (works offline for common topics)
- Serverless Groq proxy (`groq.js`) ready for Vercel / Netlify / Cloudflare Workers
- Polished, accessible, dark-first UI

## Quick start (static)

Just open `index.html` in a browser. The AI will use its local knowledge for GTA VI, Valorant, Black Myth: Wukong, Elden Ring Nightreign, Apex, esports, etc. Live model requires the API route.

## Deploy with AI (Vercel)

1. Create a new Vercel project and import this folder.
2. Add environment variable: `GROQ_API_KEY` = your Groq API key.
3. Place `groq.js` as `/api/groq.js` (or rename/handler according to your framework).
4. Deploy. The frontend already calls `/api/groq`.

### Recommended file layout on Vercel

```
/
  index.html
  main.js
  styles.css
  api/
    groq.js          ← the provided handler
```

## Features removed from "demo" state

- No "demo" labels or pre-filled demo credentials
- Login & Pro trial now persist via localStorage and update the UI
- Live items open rich detail modals (Ask AI integration)
- AI responses are unlimited in quality via local knowledge + full Qwen3.6-27B model when the key is present
- Expanded live feed, predictions, and dynamic updates

## Keyboard

- `⌘K` / `Ctrl+K` — Command palette
- `?` — Jump to AI chat
- `S` — Force a live update (when focus is on body)
- `Esc` — Close modals / palette

Built for performance, accessibility, and zero-hype gaming intelligence.
