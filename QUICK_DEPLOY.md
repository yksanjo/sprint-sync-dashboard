# ⚡ Quick Deploy to Railway - 5 Minutes!

Get your SaaS live in 5 minutes with Railway.

## Step 1: Deploy to Railway (2 minutes)

1. **Go to [railway.app](https://railway.app)** and sign up (free)
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Select** `yksanjo/sprint-sync-dashboard`
4. **Railway will start building** automatically

## Step 2: Add Database (1 minute) ⚠️ REQUIRED!

**Your app will crash without this step!**

1. In your Railway project, click **"+ New"** (top right)
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway creates the database automatically
4. The `DATABASE_URL` is automatically set as an environment variable
5. **Verify**: Go to your service → Variables tab → Check `DATABASE_URL` exists

## Step 3: Set Environment Variables (1 minute)

Go to your service → **Variables** tab, add:

```bash
JWT_SECRET=your-random-secret-key-here
FRONTEND_URL=https://your-app-name.up.railway.app
NODE_ENV=production
```

**Generate JWT_SECRET:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use any random string generator
```

## Step 4: Run Database Migrations (1 minute)

1. In Railway, go to your service
2. Click **"Deployments"** → Latest deployment → **"Shell"**
3. Run:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Step 5: Set Up Worker (Optional - for scheduled syncs)

### Option A: Railway Cron (Recommended)

1. In Railway, click **"+ New"** → **"Cron Job"**
2. Schedule: `0 9 * * *` (9 AM daily)
3. Command: `npm run start:worker`
4. Service: Your main service

### Option B: External Cron

Use [cron-job.org](https://cron-job.org) (free) to call:
```
https://your-app.up.railway.app/api/worker/run
```
Set to run daily at 9 AM.

## ✅ Done!

**Your app is live!** Visit: `https://your-app-name.up.railway.app`

### Next Steps:

1. **Sign up** for an account
2. **Create a configuration** with your GitHub/Slack tokens
3. **Test it!** The worker will sync daily

### Optional: Add Payments

See [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) for Stripe setup.

---

**Cost:** Free tier available! $0-5/month to start.

**Need help?** Check [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) for detailed guide.

