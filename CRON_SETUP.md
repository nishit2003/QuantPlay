# Cron setup (2 minutes)

Cron runs things on a schedule (pending orders, alerts, etc.). Your `.env` already has `CRON_SECRET` — that’s done.

---

## If you deploy on Vercel (Hobby / free plan)

Vercel’s free plan only allows cron jobs that run **at most once per day**. So `vercel.json` is set to run only:

- **Portfolio snapshots** — daily (for the “Performance over time” chart)
- **Dividends** — monthly
- **Weekly contest** — Friday 4 PM ET

1. Open [vercel.com](https://vercel.com) → your project.
2. Go to **Settings** → **Environment Variables**.
3. Add **Name:** `CRON_SECRET`, **Value:** same as in your `.env` (`CRON_SECRET="qp_..."`).
4. Redeploy.

**Pending orders, recurring orders, and price alerts** need to run every minute or every few minutes. On the free plan Vercel can’t do that. To run those too, use cron-job.org below (free, ~5 min setup).

---

## cron-job.org (for pending orders, recurring, alerts)

Your app: **https://quant-play.vercel.app**

Use [cron-job.org](https://cron-job.org) (free). Create **3 cron jobs** with these exact URLs (add the header below to each):

| Job        | URL | Schedule      |
|------------|-----|---------------|
| Pending orders | `https://quant-play.vercel.app/api/cron/pending-orders` | Every 1 minute |
| Recurring  | `https://quant-play.vercel.app/api/cron/recurring`      | Every 1 hour   |
| Alerts     | `https://quant-play.vercel.app/api/cron/alerts`         | Every 5 minutes |

**Request header** (add to each job if the form has a “Headers” or “Request” section):  
- Name: `Authorization`  
- Value: `Bearer qp_8K2mN9xL4vR7wY1zQ3cF6hJ0bP5sT8uA2dE4g`

If there’s no header field, use the secret in the URL instead, e.g.:  
`https://quant-play.vercel.app/api/cron/pending-orders?secret=qp_8K2mN9xL4vR7wY1zQ3cF6hJ0bP5sT8uA2dE4g`

---

**Summary:** Your app already has `CRON_SECRET` in `.env`. If you’re on Vercel, add that same value in Vercel’s env vars and you’re done. If not, use cron-job.org and call the URLs with that header.
