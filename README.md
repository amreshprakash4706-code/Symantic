# SYMANTIC • Gaming Intelligence

> The AI co-pilot for gamers and esports. Real-time predictions with 94.7% model accuracy, live intelligence from millions of matches, honest analysis, and zero hype.

A beautiful, high-performance single-page landing site with interactive AI chat, live data simulations, predictions, news, and a polished glassmorphic UI.

![SYMANTIC Preview](https://via.placeholder.com/1200x630/050507/00f5ff?text=SYMANTIC+-+Gaming+Intelligence)

## ✨ Features

- **Real-time AI Chat** — Powered by Groq (Llama 3.1 8B) with streaming-style responses, quick prompts, voice simulation, and replay analysis
- **Live Intelligence Feed** — Simulated real-time updates from Twitch, Steam, Reddit, ESL, BLAST, etc.
- **Smart Predictions** — High-confidence predictions (e.g. GTA VI Trailer 2) with detailed modals
- **Gaming News & Analysis** — Filterable articles with bookmarking and modals
- **Interactive Dashboard** — Live metrics, accuracy chart (Chart.js), and refreshable data
- **Command Palette** — Press `⌘K` (or `Ctrl+K`) for quick navigation and actions
- **Theme Toggle** — Dark/light mode with persistence
- **Pricing Tiers** — Monthly/Yearly toggle with smooth transitions
- **Fully Responsive** — Mobile bottom nav + hamburger menu
- **Premium Interactions** — Glassmorphism, smooth animations, hover effects, ripples, tilt cards, toast notifications

## 🛠 Tech Stack

- **Frontend**: Pure HTML5 + Tailwind CSS (CDN) + custom CSS (`styles.css`)
- **JavaScript**: Vanilla ES6+ (`main.js`) — no frameworks
- **Charts**: Chart.js
- **Icons**: Font Awesome 6
- **AI Backend** (demo): `/api/groq.js` — compatible with Next.js / Vercel Edge / Node
- **Fonts**: Inter + Space Grotesk (Google Fonts)

## 📁 Project Structure

```
symantic/
├── index.html          # Main landing page (clean, external resources)
├── styles.css          # All custom styles + glassmorphism + animations
├── main.js             # All interactive logic (modular & cleaned)
├── api/
│   └── groq.js         # Serverless function for Groq API calls
└── README.md
```

## 🚀 Getting Started

### Local Development

1. Clone or download the project
2. Serve the folder with any static server:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node
npx serve .

# Option 3: VS Code Live Server extension
```

3. Open `http://localhost:8000`

### AI Chat (Groq Integration)

The chat uses a real Groq API call via `/api/groq`.

**To make it work locally:**

- Deploy to **Vercel** (recommended) — the `api/groq.js` file works out of the box as a serverless function.
- Or run with **Next.js** by placing the `api/` folder inside `pages/api/` or `app/api/`.
- Add your Groq API key as environment variable: `GROQ_API_KEY`

If the API is unreachable, the chat gracefully falls back to an error message.

## 🎨 Customization

- **Colors & Theme**: Edit CSS variables in `styles.css` (`:root`)
- **AI Personality**: Change the system prompt inside `generateAIResponse()` in `main.js`
- **Live Data / Predictions**: Modify the mock data arrays in `initLiveFeed()`, `initPredictions()`, `renderNews()`
- **Add New Quick Prompts**: Edit the array in `initQuickPrompts()`

## 📦 Deployment

Recommended platforms:
- **Vercel** (best for the `/api` route)
- **Netlify** (static only — chat will show fallback)
- **Cloudflare Pages**
- Any static host + separate backend for Groq

## 📝 Notes

This is a **production-quality demo** built with clean, maintainable code:
- No duplicate functions
- Dead code removed
- External CSS/JS for better caching & editing
- All original animations, glass effects, and interactions preserved exactly

Built with ❤️ for gamers who play to win.

---

**Live Demo**: Open `index.html` locally or deploy it.

**Need help?** Open an issue or reach out. Happy to help you extend the AI features or add more games!