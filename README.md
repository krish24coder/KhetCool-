# KhetCool — Solar Cold-Storage-as-a-Service

Interactive React web app: project overview, an SMS/IVR-style booking flow simulation, and an impact dashboard (Pilot → Expansion → Full-scale). Bookings are saved to a real database and trigger an email notification.

https://github.com/user-attachments/assets/1ad806c9-012b-4a25-ba65-613f7b7d016c

## Tech stack
- React 18 + Vite 5
- Recharts (charts)
- lucide-react (icons)
- Supabase (Postgres database — cold-storage units + real bookings)
- EmailJS (sends an email notification for every booking, no backend needed)
- Plain CSS-in-JS (no Tailwind build step required)

## Run locally
```bash
npm install
npm run dev
```
Then open the printed local URL (usually http://localhost:5173).

The app works fine with **no environment variables set** — it runs in demo mode with local mock data (no real database, no real emails). See below to enable both for real.

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
1. Push this repo to GitHub.
2. Go to https://vercel.com/new and import the repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output directory `dist` (already set in `vercel.json`).
4. Add the environment variables listed below (Settings → Environment Variables).
5. Click Deploy.

## Database setup (Supabase)

The app falls back to mock data automatically if this isn't set up. To make bookings save for real:

1. Go to [supabase.com](https://supabase.com) → sign in free → **New project**.
2. Open **SQL Editor → New query**, paste the contents of `sql/schema.sql`, and click **Run**. This creates the `units` and `bookings` tables, seeds 4 demo units, sets permissions, and adds a trigger that auto-updates a unit's utilization whenever a booking is made.
3. Go to **Settings → API** and copy your **Project URL** and **anon / public** key.
4. Add these as environment variables (locally in `.env`, and on Vercel under Settings → Environment Variables):

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

5. Redeploy (or restart `npm run dev` locally).

Once configured, the Book a Slot page shows a green **"Live database connected"** badge instead of the amber **"Demo mode"** one, and the Impact Dashboard shows a real count of bookings recorded.

## Email notifications (get an email for every booking)

Uses [EmailJS](https://www.emailjs.com) — sends straight from the browser, no backend server needed. Free tier: 200 emails/month.

1. Sign up free at **emailjs.com**.
2. **Email Services → Add New Service → Gmail** → connect the sending Gmail account → note the **Service ID**.
3. **Email Templates → Create New Template**:
   - **To email**: `kushagrapawansharma240@gmail.com`
   - **Subject**: `New KhetCool booking — {{booking_code}}`
   - **Content**:
 New booking received.

 Code: {{booking_code}}
 Unit: {{unit_id}} — {{village}}, {{district}}
 Crop: {{crop}}
 Quantity: {{qty_tonnes}} tonne(s)
 Duration: {{days}} day(s)
 Cost: ₹{{cost_inr}}
 Booked at: {{booked_at}}
   - Note the **Template ID**.
4. **Account → General** → copy your **Public Key**.
5. Add these as environment variables (locally in `.env`, and on Vercel):

VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
VITE_EMAILJS_PUBLIC_KEY=your-public-key

6. Redeploy.

Once set up, every confirmed booking emails `kushagrapawansharma240@gmail.com` automatically, and the confirmation box shows "· email sent" next to the booking code.

## Project structure
khetcool-app/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
├── src/
│ ├── main.jsx
│ ├── App.jsx # main app component (all views: Overview, Book, Dashboard)
│ ├── index.css
│ └── lib/
│ ├── supabaseClient.js
│ └── emailClient.js
├── sql/
│ └── schema.sql # run this in Supabase's SQL Editor
└── README.md
