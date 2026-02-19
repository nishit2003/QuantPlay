# Vercel deployment checklist

If **sign-in** or **create account** fails on your live URL with “Something went wrong. Please try again.”, check the following.

---

## 1. Auth env vars (required for sign-in / register)

In Vercel: **Project → Settings → Environment Variables**. Add for **Production** (and Preview if you use it):

| Name | Value | Notes |
|------|--------|--------|
| `AUTH_SECRET` | `openssl rand -base64 32` | **Required.** Used by NextAuth to sign cookies/tokens. |
| `AUTH_URL` | `https://quant-play.vercel.app` | Your actual app URL (no trailing slash). |

- If you already use `NEXTAUTH_SECRET`, that works too; NextAuth v5 accepts both.
- After changing env vars, **redeploy** (Deployments → ⋮ → Redeploy).

---

## 2. Database (“pool timeout” from Vercel)

If logs show **`pool timeout: failed to retrieve a connection from pool after …ms`** with `active=0 idle=0`, the app **never** got a DB connection from Vercel. Fix one of these:

### Use the **public** connection URL

- **Railway:** Use **MYSQL_PUBLIC_URL** (not a private/internal URL). In Vercel env, set `DATABASE_URL` to that value.
- **Aiven / others:** Use the “public” or “external” MySQL URL that is reachable from the internet. The URL must use the hostname and port your provider gives for **public** access.

### No IP allowlisting (or allow all)

- Vercel serverless runs from **dynamic IPs**. If your DB host (Railway, Aiven, etc.) requires **IP allowlisting**, you must either:
  - Allow **all IPs** (e.g. 0.0.0.0/0) in the DB provider’s firewall/allowlist, or  
  - Use a host that does **not** require allowlisting for public access.
- Railway and Aiven usually allow public access by default; if you locked it down, open it for `0.0.0.0/0` or disable “restrict access” for the DB.

### SSL

- **Railway MySQL:** Do **not** add `?ssl-mode=REQUIRED`. Railway’s MySQL does not provide SSL; forcing it can cause connection timeouts. The app connects without SSL when the URL has no SSL param.
- **Other providers (e.g. Aiven):** Add `?ssl-mode=REQUIRED` to the URL if the host requires SSL.

### If it still times out

- **Vercel Hobby** has a **10s** function timeout; DB connection can take longer on cold start. Consider **Vercel Pro** (60s) or a **serverless-friendly DB** (e.g. PlanetScale with serverless driver, or Neon for Postgres) that handles short-lived connections well.
- Timeouts in the app are set to 45s; if the DB is just slow, a redeploy may help. If the DB is unreachable (wrong URL or firewall), fix that first.

---

## 3. See the real error

1. Vercel → your project → **Logs**.
2. Trigger sign-in or create account again.
3. Filter by **Function** or time; look for the stack trace or message (e.g. `MissingSecretError`, `pool timeout`, `ECONNREFUSED`).

That message tells you whether the problem is auth (missing secret/URL) or database.
