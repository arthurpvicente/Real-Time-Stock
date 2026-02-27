# Stock Market 

Signalist is a Next.js application that lets users sign up, track a personalized watchlist, explore stock details, and receive AI‑powered news summaries and welcome emails.

## Tech Stack

- **Next.js 15**, **React 19**, **TypeScript**
- **Better Auth** – email/password authentication
- **MongoDB + Mongoose** – data storage (users, watchlist, alerts)
- **Finnhub** – market/stock data
- **Inngest** – background jobs (welcome emails, daily news)
- **Resend + Nodemailer** – transactional emails
- **Tailwind CSS + Shadcn UI + Radix UI** – styling and components


**Cloning the Repository**

```bash
git clone https://github.com/arthurpvicente/Real-Time-Stock.git

cd real-time-stock
```

**Installation**

Install npm dependecies:

```bash
npm install
```
```bash
npm install mongodb
```
```bash
npm install install resend
```
```bash
npx inggest-cli@latest dev 
```
```bash
npx shadcn@latest add sonner
```
```bash
npx inggest-cli@latest dev
```
```bash
npm install -D tailwindcss postcss autoprefixer\nnpx tailwindcss init -p\n
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# FINNHUB
NEXT_PUBLIC_NEXT_PUBLIC_FINNHUB_API_KEY=
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

Open [http://localhost:3000](http://localhost:3000) in your browser to view the projec.

## Deployment Troubleshooting:

### 1.Error on Vercel (build log):
```bash
MONGODB_URI must be set within .env
...
> Build error occurred
[Error: Failed to collect page data for /] { type: 'Error' }
``` 
### How to fix on **Vercel**
1. Go to Vercel dashboard → Project → Settings → Environment Variables.

2. Add: 
    - **Name:**`npm run build`
    - **Value:** same value locally in `.env`

3. Also add any other required API keys.

4. **Redeploy** the project.
