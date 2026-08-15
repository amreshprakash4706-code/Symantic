# SYMANTIC — Gaming Intelligence

**Production frontend + serverless AI proxy powered by the most advanced Groq model.**

Real-time predictions, live intelligence, and honest analysis for gamers and esports. Zero hype. Built to win.

## Tech

- Static frontend (HTML / CSS / JS)
- Serverless API route using the official **groq-sdk**
- Model: **`qwen/qwen3.6-27b`** (currently the highest-intelligence model on Groq)
- Max tokens: 2048

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Run the static site locally
npm start
# → http://localhost:3000
```

The AI chat works offline for common gaming topics via the built-in knowledge base.  
Full model responses require the API route + a Groq key.

## Deploy to Vercel (recommended)

1. Push this folder to a GitHub repo (or import the folder directly).
2. Create a new Vercel project.
3. Add Environment Variable:
   ```
   GROQ_API_KEY = your_groq_api_key_here
   ```
4. Deploy.

Vercel will automatically:
- Install dependencies from `package.json`
- Serve the static files
- Route `/api/groq` → `api/groq.js`

## Project structure

```
symantic-pro/
├── index.html          # Main app
├── main.js             # Frontend logic + local AI knowledge
├── styles.css
├── api/
│   └── groq.js         # Serverless handler (groq-sdk + Qwen3.6-27B)
├── package.json
├── vercel.json
└── README.md
```

## Scripts

| Command       | Description                    |
|---------------|--------------------------------|
| `npm install` | Install groq-sdk + serve       |
| `npm start`   | Serve the site on port 3000    |
| `npm run dev` | Same as start                  |

## Features

- Zero "demo" language
- Persistent login / Pro trial (localStorage)
- Live feed with rich detail modals
- Multi-turn AI chat + strong local knowledge
- Command palette (`⌘K`)
- Dark / light theme
- Fully accessible

Built for performance, accessibility, and zero-hype gaming intelligence.
