# 🔧 Fix DATABASE_URL Error

## Error You're Seeing

```
Validation Error Count: 1
errorCode: 'P1012'
DATABASE_URL: Not set
```

This means Railway doesn't have `DATABASE_URL` set in your environment variables.

## Quick Fix (2 minutes)

### Step 1: Add PostgreSQL Database

1. **Go to Railway Dashboard**: https://railway.app
2. **Click your project** (e.g., "sprint-sync-dashboard")
3. **Click "+ New"** button (top right)
4. **Select "Database"**
5. **Choose "Add PostgreSQL"**

✅ Railway will automatically:
- Create the PostgreSQL database
- Add `DATABASE_URL` environment variable to your service
- Link them together

### Step 2: Verify DATABASE_URL is Set

1. **Go to your service** (sprint-sync-dashboard)
2. **Click "Variables" tab**
3. **Check that `DATABASE_URL` exists**
   - Should look like: `postgresql://user:pass@host:port/dbname`
   - Railway auto-generates this

### Step 3: Redeploy

1. **Go to Deployments tab**
2. **Click "Redeploy"** or wait for auto-deploy

## Verify It's Fixed

After redeploy, check Railway logs. You should see:
```
✅ Database connected successfully
✅ Database migrations completed
🚀 Server running on port 3000
```

## Alternative: Manual DATABASE_URL (Not Recommended)

If you want to use an external database:

1. Go to Railway → Your Service → **Variables** tab
2. Click **"+ New Variable"**
3. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://user:password@host:5432/database`

But it's much easier to just add the PostgreSQL database in Railway!

## Still Not Working?

**Check:**
1. Is the PostgreSQL service running? (Go to Railway → Services)
2. Is `DATABASE_URL` in the Variables tab?
3. Did you redeploy after adding the database?

---

**Most common issue:** Forgetting to add the PostgreSQL database. Once you add it, Railway handles everything automatically! 🎉

