# KhetCool — Solar Cold-Storage-as-a-Service

Interactive React web app: project overview, an SMS/IVR-style booking flow simulation, and an impact dashboard (Pilot → Expansion → Full-scale).

## Tech stack
- React 18 + Vite 5
- Recharts (charts)
- lucide-react (icons)
- Plain CSS-in-JS (no Tailwind build step required)

## Run locally
```bash
npm install
npm run dev
```
Then open the printed local URL (usually http://localhost:5173).

## Build for production
```bash
npm run build
npm run preview   # optional: preview the production build locally
```
Output goes to the `dist/` folder.

## Deploy to Vercel

**Option A — Vercel CLI**
```bash
npm i -g vercel
vercel
```
Follow the prompts (defaults work — Vercel auto-detects Vite from `vercel.json`).

**Option B — Vercel dashboard**
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com/new and import the repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output directory `dist` (already set in `vercel.json`).
4. Click Deploy.

No environment variables are required — the app uses mock/demo data defined in `src/App.jsx`.

## Project structure
```
khetcool-app/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── src/
│   ├── main.jsx
│   ├── App.jsx      # main app component (all views: Overview, Book, Dashboard)
│   └── index.css
└── README.md
```
