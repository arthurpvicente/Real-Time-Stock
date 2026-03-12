# Signalist - AI-Powered Stock Market Tracker
Signalist is a full-stack stock tracking web application built with Next.js.
It allows users to create accounts, manage a personalized watchlist, view real-time stock data, and receive AI-powered news summaries and automated emails.

## 1. Project Overview

The goal of this project is to build a production-style stock tracking application using modern full-stack technologies, external APIs, and background job processing.

The application allows users to:

- Register and authenticate securely
- Track stocks in a personalized watchlist (**`in progress`**)
- View live stock market data
- Read AI-generated stock news summaries
- Trigger background jobs for asynchronous tasks

## 2. Tech Stack

- **Next.js 15**, **React 19**, **TypeScript**
- **Better Auth** – email/password authentication
- **MongoDB + Mongoose** – data storage (users, watchlist, alerts)
- **Finnhub** – market/stock data
- **Inngest** – background jobs (welcome emails, daily news)
- **Resend** – transactional emails
- **Tailwind CSS + Shadcn UI + Radix UI** – styling and components
- **Deployment**:
  - Vercel

**Cloning the Repository**

```bash
git clone https://github.com/arthurpvicente/Real-Time-Stock.git
cd Real-Time-Stock
```

## 3. System Architecture
Architecture Components:
- Client-side React components for UI
- Server-side data fetching using Next.js App Router
- MongoDB Atlas for persistent storage
- Inngest for event-driven background processing
- External APIs for stock data and AI summarization

The system follows a modular structure separating:
- Authentication logic
- Database models
- API integration
- Background job handlers

**Installation**

Install npm dependencies:

```bash
npm install
npm install mongodb
npm install resend
npx inggest-cli@latest dev 
npx shadcn@latest add sonner
```
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# FINNHUB
NEXT_PUBLIC_PUBLIC_FINNHUB_API_KEY=
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

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

## Deployment Troubleshooting:

### 1. Error on Vercel (build log):
```bash
MONGODB_URI must be set within .env
...
> Build error occurred
[Error: Failed to collect page data for /] { type: 'Error' }
``` 
### How to fix on **Vercel**
1. Go to Vercel dashboard → Project → Settings → Environment Variables.

2. Add: 
    - **Name:** `MONGODB_URI`
    - **Value:** same value locally in `.env`

3. Also add any other required API keys (E.G `NEXT_PUBLIC_FINNHUB_API_KEY`, `RESEND_API_KEY`, etc).

4. **Redeploy** the project.
