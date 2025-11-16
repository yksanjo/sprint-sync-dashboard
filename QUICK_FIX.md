# ⚡ Quick Fix: App Crashing - No Database

## The Problem
Your app is crashing because there's no PostgreSQL database connected.

## The Solution (2 minutes)

### Step 1: Add PostgreSQL Database in Railway

1. **Go to Railway Dashboard**: https://railway.app
2. **Click your project** (e.g., "sweet-illumination")
3. **Click "+ New"** button (top right)
4. **Select "Database"**
5. **Choose "Add PostgreSQL"**

✅ Railway automatically:
- Creates the database
- Adds `DATABASE_URL` environment variable
- Links it to your service

### Step 2: Verify DATABASE_URL is Set

1. **Go to your service** (sprint-sync-dashboard)
2. **Click "Variables" tab**
3. **Check that `DATABASE_URL` exists**
   - Should look like: `postgresql://user:pass@host:port/dbname`
   - Railway auto-generates this

### Step 3: Redeploy

1. **Go to Deployments tab**
2. **Click three dots (⋯)** on latest deployment
3. **Click "Redeploy"**

OR just push a new commit to trigger auto-deploy.

## ✅ That's It!

After redeploy, check the logs:
- Should see: `✅ Database connected successfully`
- Should see: `✅ Database migrations completed`
- App should start without crashing

## Troubleshooting

### Still crashing?

**Check Railway logs:**
1. Go to Deployments → View Logs
2. Look for:
   - `❌ Database connection failed` → DATABASE_URL not set
   - `Can't reach database server` → Database service not running
   - `Table does not exist` → Migrations didn't run

**Verify database is running:**
1. Go to Railway → Services
2. Check PostgreSQL service shows as "Active"

**Manual migration (if needed):**
1. Go to Deployments → Latest → Shell
2. Run: `npx prisma migrate deploy`

## Alternative: External Database

If you want to use an external PostgreSQL database:

1. Go to your service → **Variables** tab
2. Click **"+ New Variable"**
3. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://user:password@host:5432/database`

---

**Need more help?** See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed guide.



