# Signalist — Real-Time Stock Tracker

Signalist is a full-stack stock tracking web application built with Next.js.
It allows users to create accounts, manage a personalized watchlist, view real-time stock data, and receive AI-powered news summaries and automated emails.

## 1. Project Overview

The goal of this project is to build a production-style stock tracking application using modern full-stack technologies, external APIs, and background job processing.

The application allows users to:

- Register and authenticate securely with email/password
- Complete an investor profile on sign-up (country, investment goals, risk tolerance, preferred industry)
- Upload a profile picture via URL during sign-up
- Track stocks in a personalized watchlist
- Add/remove stocks from watchlist with a live star button in search results
- View a watchlist page with live prices and % change
- View individual stock detail pages with TradingView charts
- Read AI-generated stock news summaries
- Receive a welcome email triggered on account creation via background jobs

## 2. Tech Stack

- **Next.js 15**, **React 19**, **TypeScript**
- **Better Auth** – email/password authentication
- **MongoDB + Mongoose** – data storage (users, watchlist)
- **Finnhub** – real-time market/stock data
- **Inngest** – background jobs (welcome emails, daily news)
- **Resend** – transactional emails
- **Tailwind CSS + Shadcn UI + Radix UI** – styling and components
- **Deployment**: Vercel

## 3. System Architecture

Architecture Components:
- Client-side React components for UI
- Server-side data fetching using Next.js App Router
- MongoDB Atlas for persistent storage
- Inngest for event-driven background processing
- External APIs for stock data and AI summarization

The system follows a modular structure separating:
- Authentication logic (`lib/better-auth/`)
- Database models (`database/models/`)
- Server actions (`lib/actions/`)
- Background job handlers (`lib/inngest/`)
- API integrations (`lib/resend/`, Finnhub)

## 4. Getting Started

**Cloning the Repository**

```bash
git clone https://github.com/arthurpvicente/Real-Time-Stock.git
cd Real-Time-Stock
```

**Installation**

```bash
npm install
```

Shadcn components (if adding new ones):
```bash
npx shadcn@latest add sonner
```

Tailwind (already configured, only if setting up from scratch):
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Set Up Environment Variables**

Create a `.env` file in the root of your project:

```env
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# FINNHUB
NEXT_PUBLIC_FINNHUB_API_KEY=
FINNHUB_BASE_URL=https://finnhub.io/api/v1

# MONGODB
MONGODB_URI=

# BETTER AUTH
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# GEMINI
GEMINI_API_KEY=

# RESEND
RESEND_API_KEY=
```

**Running the Project**

```bash
npm run dev
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Inngest must be running locally for welcome emails and background jobs to trigger. The app still works without it — sign-up will not be blocked if Inngest is unavailable.

## 5. Features

### Authentication
- Email/password sign-up and sign-in via Better Auth
- Investor profile collected at sign-up: country, investment goals, risk tolerance, preferred industry
- Profile picture upload via URL on sign-up
- User dropdown in header showing avatar, name, and sign-out

### Watchlist
- Add/remove stocks from a personalized watchlist
- Live star toggle button in search results reflects real watchlist state
- Dedicated watchlist page showing all saved stocks with live prices and % change

### Stock Detail
- Dynamic route `/stocks/[symbol]` for individual stock pages
- TradingView chart widget embedded per stock

### Background Jobs (Inngest)
- `app/user.created` event fires on sign-up, triggering a welcome email via Resend
- Daily AI-generated news summary jobs

## 6. Deployment Troubleshooting

### Error: `MONGODB_URI must be set within .env` (Vercel build failure)

```
MONGODB_URI must be set within .env
> Build error occurred
[Error: Failed to collect page data for /] { type: 'Error' }
```

**Why it happens:** The auth instance initializes at module load time during the build. If `MONGODB_URI` is missing from Vercel's environment, the build crashes — not just at runtime.

**Fix:**
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Add all required variables: `MONGODB_URI`, `NEXT_PUBLIC_FINNHUB_API_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `GEMINI_API_KEY`
3. Redeploy the project

---

### Error: Sign-up blocked when Inngest is unavailable

**What happened:** `inngest.send()` was called without error handling inside the sign-up action. If Inngest was down or misconfigured, it threw an unhandled exception and blocked account creation entirely.

**Fix:** Wrapped the `inngest.send()` call in a try/catch. Welcome email failure is now logged but does not interrupt sign-up.

---

### Error: Wrong watchlist state shown in search results (`isInWatchlist`)

**What happened:** The star button in search results showed incorrect starred/unstarred state — stocks already in the watchlist appeared unstarred and vice versa.

**Fix:** Corrected the `isInWatchlist` logic in the search results server action to properly compare stock symbols against the user's watchlist.

---

### Error: Auth errors not returned to the sign-up form

**What happened:** `auth.actions.ts` was catching errors silently and not returning them, so users saw no feedback when sign-up failed (e.g., email already in use).

**Fix:** Updated the action to return real error messages from Better Auth so the form can display them.

---

### Error: Unauthenticated users could access protected routes

**What happened:** Middleware was not redirecting users without a session to `/sign-in`, so protected pages were accessible without logging in.

**Fix:** Updated `middleware/index.ts` to check session state and redirect unauthenticated users.

---

### Error: Sign-up form validation bugs

**What happened:** Multiple issues in the sign-up form:
- Label showed "Email name is required" instead of the correct field name
- Broken regex for field validation
- Invalid `message` prop passed to a component that didn't accept it
- Unused `signUpWithEmail` import causing lint/build warnings

**Fix:** Each issue was resolved individually — corrected labels, fixed regex, removed invalid props, and cleaned up unused imports.
