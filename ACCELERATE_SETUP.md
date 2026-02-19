# Fix Vercel “pool timeout” with Prisma Accelerate

If sign-up/sign-in on Vercel keeps failing with **pool timeout** (DB connection never establishes), use **Prisma Accelerate**. It’s a connection pool in front of your MySQL so Vercel talks to Accelerate (fast) instead of opening direct connections to Railway (which time out).

---

## 1. Create a Prisma Data Platform project

1. Go to **[console.prisma.io](https://console.prisma.io/)** and sign in (or create an account).
2. Create a **new project** and link it to this repo (or skip linking; you only need Accelerate).

---

## 2. Enable Accelerate and add your database

1. In the project, open an **environment** (e.g. Production).
2. Find **Accelerate** and turn it **on**.
3. When asked for the **database connection string**, use your **direct MySQL URL** (Railway):

   ```text
   mysql://root:YOUR_PASSWORD@yamanote.proxy.rlwy.net:29513/railway
   ```

   (Same value you’d use for `DIRECT_DATABASE_URL` — no `prisma://` here.)
4. Pick the **region** closest to your DB (e.g. same as Railway).
5. Create an **API key** and copy the **Accelerate connection string** (it looks like):

   ```text
   prisma://accelerate.prisma-data.net/?api_key=xxxxx
   ```

---

## 3. Set env vars on Vercel

In **Vercel → your project → Settings → Environment Variables** set:

| Name | Value | Where |
|------|--------|--------|
| `DATABASE_URL` | `prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY` | Production (and Preview if you use it) |
| `DIRECT_DATABASE_URL` | `mysql://root:PASSWORD@yamanote.proxy.rlwy.net:29513/railway` | Production (and Preview) — only needed for running migrations from your machine; Vercel uses `DATABASE_URL` at runtime |

Use your real Railway password and the exact `prisma://` URL from the Prisma console.

---

## 4. Deploy

1. **Redeploy** the app on Vercel (e.g. Deployments → ⋮ → Redeploy).
2. Try **sign-up** and **sign-in** on the live URL.

Runtime will use `prisma://` (Accelerate); migrations use `DIRECT_DATABASE_URL` when you run `prisma migrate` locally.

---

## 5. Local development

Keep using your **direct** MySQL URL in `.env`:

```env
DATABASE_URL="mysql://root:PASSWORD@yamanote.proxy.rlwy.net:29513/railway"
```

Do **not** put the `prisma://` URL in local `.env` unless you want to use Accelerate locally too. For local, direct MySQL is fine.

---

## Summary

- **Vercel** → `DATABASE_URL` = `prisma://...` (Accelerate) → no more pool timeout.
- **Migrations** → `DIRECT_DATABASE_URL` = `mysql://...` (Railway) in `prisma.config.ts`.
- **Local** → `DATABASE_URL` = `mysql://...` (direct) in `.env`.
