# Cron setup (2 minutes)

Cron runs things on a schedule (pending orders, alerts, etc.). Your `.env` already has `CRON_SECRET` — that’s done.

---

## If you deploy on Vercel

1. Open [vercel.com](https://vercel.com) → your project.
2. Go to **Settings** → **Environment Variables**.
3. Add one variable:
   - **Name:** `CRON_SECRET`
   - **Value:** copy the same value from your `.env` (the line that says `CRON_SECRET="qp_..."`).
4. Redeploy the project (or wait for the next deploy).

That’s it. Vercel will run the cron jobs automatically using the schedule in `vercel.json`.

---

## If you don’t use Vercel

Use [cron-job.org](https://cron-job.org) (free, no credit card):

1. Sign up at cron-job.org.
2. Click **Create cron job**.
3. **URL:** `https://YOUR-APP-URL/api/cron/pending-orders`  
   (replace YOUR-APP-URL with your real app URL, e.g. `yourapp.herokuapp.com`).
4. **Schedule:** every 1 minute (or pick “Every minute”).
5. **Request headers:** Add one header:
   - Name: `Authorization`
   - Value: `Bearer qp_8K2mN9xL4vR7wY1zQ3cF6hJ0bP5sT8uA2dE4g`  
   (use the same value as `CRON_SECRET` in your `.env`).
6. Save.

Repeat for other endpoints if you want:

- `/api/cron/recurring` → every hour  
- `/api/cron/alerts` → every 5 minutes  
- `/api/cron/snapshots` → daily  
- `/api/cron/contest` → weekly (Friday 4 PM)

Same URL pattern and same `Authorization: Bearer YOUR_CRON_SECRET` header.

---

**Summary:** Your app already has `CRON_SECRET` in `.env`. If you’re on Vercel, add that same value in Vercel’s env vars and you’re done. If not, use cron-job.org and call the URLs with that header.
