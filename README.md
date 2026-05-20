# FanLinc — GameDay IQ Challenge

> Website for visitors to **Toronto Tech Week**, played live at the **Brampton Honey Badgers** night. Five questions. One sport. A shot at signed merch.

Built with Next.js 16, TypeScript, Tailwind v4, and Motion (Framer Motion).

## What it does

Players scan a QR code, sign in (name + email + role at the event), pick a sport — Basketball, OHL Hockey, Baseball, or the FanLinc Sports Mix — and race the clock through five random questions. Speed and streaks earn bonus points. Top scorers climb a live leaderboard and are entered into the signed-merch draw at the end of the night.

A separate admin console (code-gated) lets the team browse signups, export emails as CSV, edit the question bank, reset the leaderboard, and run an animated winner draw.

## Stack

- **Next.js 16** App Router · static export of every route
- **TypeScript** end-to-end
- **Tailwind v4** with custom CSS variables for the editorial palette
- **Motion** for choreographed page transitions, split-text reveals, spring-popped badges, count-up score, and the continuous-flow gutter marquee
- **canvas-confetti** for the results burst
- **localStorage** for demo persistence — isolated in `src/lib/store.ts` so Firebase / Supabase can drop in without touching the rest of the app

## Design language

Editorial sports premium. Near-black canvas, single lime accent, one typeface (Geist) doing all the work via weight + tracking. Section indexes ("Index 01 / 02 / 03") give the page magazine-style architecture. On desktop (≥1280px) the gutters fill with two vertical marquee columns of curated sports photography — left flows bottom-to-top, right flows top-to-bottom, slightly different durations so they never beat in sync.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static production build
```

Admin code (demo): `fanlinc2026`

## Project layout

```
src/
  app/
    page.tsx            # editorial hero + sport picker + steps + prize + closer
    signup/             # roster check (name, email, fave, role, consent)
    category/           # sport selection — full-bleed image cards
    play/               # 5-question round, timer ring, score / streak tiles
    results/            # final score count-up, badge unlock, prize draw card
    leaderboard/        # ranked table with sport filters
    admin/              # signups + CSV + questions + reset + winner draw
  components/
    Shell.tsx           # PageShell — nav, footer, marquee gutters
    MarginalArt.tsx     # continuous vertical sports-photo flow
    SplitText.tsx       # animated headline primitives
    Magnetic.tsx        # pointer-aware CTA wrapper
    Tilt.tsx            # 3D card tilt
    TimerRing.tsx       # circular SVG round timer
    SportIcons.tsx      # custom SVG sport glyphs
    Confetti.tsx        # canvas-confetti helpers
    StepBar.tsx         # 4-step progress indicator
    Brand.tsx           # wordmark
  data/
    questions.json      # 67 questions across 4 categories
  lib/
    images.ts           # curated Unsplash IDs + gallery helpers
    questions.ts        # randomised round picker
    scoring.ts          # base / speed / streak / badge logic
    store.ts            # localStorage adapter (swap for backend)
    types.ts            # shared types
```

## Adding more questions before the event

Open `src/data/questions.json` and append to the relevant category array. Each entry follows:

```json
{
  "id": "bb-99",
  "type": "player",
  "prompt": "Who is widely nicknamed 'The Greek Freak'?",
  "options": ["Luka Doncic", "Giannis Antetokounmpo", "Joel Embiid", "Nikola Jokic"],
  "answer": 1,
  "explain": "Giannis Antetokounmpo earned the nickname for his Greek heritage and freakish athleticism."
}
```

Or use the admin UI's Questions tab — edits there are stored as overrides in localStorage so the live event team can iterate without redeploying.

---

© FanLinc · GameDay IQ · Toronto Tech Week 2026
