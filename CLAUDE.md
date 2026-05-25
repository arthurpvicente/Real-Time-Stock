# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server with Turbopack (http://localhost:3000)
- `npm run build` — production build (Turbopack)
- `npm start` — run the production build
- `npm run lint` — ESLint (uses `eslint-config-next` via `eslint.config.mjs`)
- `npm run test:db` — sanity-check the `MONGODB_URI` connection (`scripts/test-db.mjs`)
- `npx inngest-cli@latest dev` — local Inngest dev server; **must run in a second terminal** for sign-up emails and the daily news cron to fire locally

There is no automated test suite — verify changes by exercising the app in the browser.

## Architecture

This is a Next.js 15 (App Router, React 19, TypeScript) app that tracks stocks, manages a watchlist + holdings portfolio, and dispatches AI-generated emails via background jobs. All data access flows through Server Actions; the only HTTP route is the Inngest webhook.

### Request/data flow

1. **UI** — RSC pages in `app/(root)/` (`page.tsx`, `portfolio/`, `stocks/[symbol]/`) compose Shadcn/Radix components from `components/`. TradingView widgets are embedded as iframes via `components/TradingViewWidget.tsx` + `hooks/useTradingViewWidget.tsx` — no server proxy.
2. **Server Actions** in `lib/actions/` are the only mutation/fetch surface:
   - `auth.actions.ts` — Better Auth wrappers; `signUpWithEmail` also fires the `app/user.created` Inngest event (wrapped in try/catch so Inngest outages don't block registration).
   - `finnhub.actions.ts` — Finnhub REST calls (`/quote`, `/search`, `/stock/profile2`, `/company-news`, `/stock/candle`). Uses `fetch` with `cache: 'no-store'` for live quotes and `next.revalidate` (300s news, 1800s search, 3600s profiles) for cacheable data. `searchStocksForUser` overlays watchlist membership onto search results.
   - `portfolio.actions.ts` — watchlist CRUD against the `Portfolio` Mongoose model.
   - `holdings.actions.ts` — positions CRUD against the `Holdings` model; uses `findOneAndUpdate` with `upsert` so one row per `(userId, symbol)`. Calls `revalidatePath('/portfolio')` after writes.
   - `user.actions.ts` — `getAllUsersForNewsEmail` reads the Better Auth `user` collection for the daily cron.
3. **Database** — MongoDB Atlas via Mongoose. `database/mongoose.ts` caches the connection on `global.mongooseCache` to survive HMR/serverless cold starts. Two app-owned collections (`portfolios`, `holdings`); the Better Auth `user`/`session` collections are managed by the adapter.
4. **Auth** — `lib/better-auth/auth.ts` exports a top-level `await getAuth()` — the auth instance is constructed at module load, which means **a missing `MONGODB_URI` crashes the build**, not just runtime (see Troubleshooting in README). Sessions are HTTP-only cookies; `middleware/index.ts` redirects unauthenticated requests to `/sign-in` for everything except `api`, `_next/*`, `favicon.ico`, `sign-in`, `sign-up`, and `assets`.
5. **Background jobs** — `lib/inngest/functions.ts`:
   - `sendSignUpEmail` — triggered by `app/user.created`; uses `step.ai.infer` with `gemini-1.5-flash` and the `PERSONALIZED_WELCOME_EMAIL_PROMPT` template, then sends via Resend.
   - `sendDailyNewsSummary` — cron `0 12 * * *` (also triggerable via `app/send.daily.news`); per user, fetches portfolio symbols → Finnhub news (falls back to general news if a user has no symbols) → Gemini summary → Resend email.
   - The endpoint at `app/api/inngest/route.ts` serves `GET/POST/PUT` and registers both functions.

### Conventions worth knowing

- Path alias `@/*` maps to the repo root (`tsconfig.json`).
- Server Actions: every action file starts with `'use server'`; auth is enforced inside each action via `auth.api.getSession({ headers: await headers() })`, not at the route layer.
- `NEXT_PUBLIC_FINNHUB_API_KEY` is browser-exposed by design (used by TradingView widget configs); set Finnhub usage limits to mitigate. Server-side code prefers `FINNHUB_API_KEY` and falls back to the public key.
- Mongoose models live in `database/models/`. Both `Portfolio` and `Holdings` have a unique compound index on `{ userId, symbol }` — rely on that instead of pre-checking for duplicates.
- The portfolio page polls every 20s via `components/AutoRefresh.tsx` to keep gain/loss current.

### Required environment

All of these must be set for the app to build and run; see the README's "Environment Variables" section for the full list:
`MONGODB_URI`, `NEXT_PUBLIC_FINNHUB_API_KEY` (+ optional `FINNHUB_API_KEY`), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `INNGEST_SIGNING_KEY`, `NEXT_PUBLIC_BASE_URL`.
