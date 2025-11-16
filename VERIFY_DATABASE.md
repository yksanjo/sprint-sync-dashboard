# ✅ Verify Database is Connected

If you added the PostgreSQL database but still see errors, follow these steps:

## Step 1: Verify DATABASE_URL is Set

1. **Go to Railway → Your Service** (sprint-sync-dashboard)
2. **Click "Variables" tab**
3. **Look for `DATABASE_URL`**
   - Should exist and have a value like: `postgresql://user:pass@host:port/dbname`
   - Should NOT be empty
   - Should NOT contain "dummy"

**If DATABASE_URL is missing:**
- The database service might not be linked to your app service
- See Step 2 below

## Step 2: Verify Database Service is Linked

1. **Go to Railway → Your Project**
2. **Check if you see TWO services:**
   - Your app service (sprint-sync-dashboard)
   - PostgreSQL service (usually named "Postgres" or "PostgreSQL")

**If you only see one service:**
- The database wasn't created in the same project
- Or it's not linked to your app

**To link them:**
1. Click on your app service
2. Go to "Variables" tab
3. Look for "Shared Variables" or "Reference Variable"
4. If you see the PostgreSQL service listed, click to link it
5. Or manually add `DATABASE_URL` by copying it from the PostgreSQL service

## Step 3: Check Database Service Status

1. **Go to Railway → Your Project**
2. **Click on the PostgreSQL service**
3. **Check if it shows as "Active" or "Running"**

**If it's not running:**
- Click "Start" or "Deploy"
- Wait for it to start

## Step 4: Verify DATABASE_URL Format

The DATABASE_URL should look like:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Common issues:**
- Missing `postgresql://` prefix
- Wrong port (should be 5432)
- Invalid credentials

## Step 5: Test Connection

Visit your debug endpoint:
```
https://your-app.up.railway.app/api/auth/debug
```

**What you should see:**
```json
{
  "status": "ok",
  "database": "connected",
  "tables": "exists",
  "userCount": 0,
  "hasDatabaseUrl": true
}
```

**If you see an error:**
- Check the `suggestion` field - it will tell you what's wrong
- Check Railway logs for more details

## Step 6: Redeploy After Adding Database

**Important:** After adding the database, you MUST redeploy:

1. **Go to Railway → Your Service**
2. **Click "Deployments" tab**
3. **Click "Redeploy"** (or wait for auto-redeploy)

The app needs to restart to pick up the new `DATABASE_URL` environment variable.

## Step 7: Check Railway Logs

1. **Go to Railway → Your Service → Deployments → Latest → View Logs**
2. **Look for:**
   - `✅ Database connected successfully` → Good!
   - `❌ Database connection failed` → Check DATABASE_URL
   - `⚠️ DATABASE_URL not set!` → Database not linked

## Common Issues

### Issue: DATABASE_URL exists but app still shows error

**Solution:**
- Redeploy your service (the app needs to restart)
- Check if DATABASE_URL is in the correct format
- Verify the database service is running

### Issue: Database service exists but DATABASE_URL is missing

**Solution:**
- The services might not be linked
- Go to your app service → Variables → Check for "Shared Variables"
- Or manually copy DATABASE_URL from PostgreSQL service to your app service

### Issue: "Database not connected" but DATABASE_URL is set

**Solution:**
- Check Railway logs for connection errors
- Verify database service is running
- Check if migrations ran: Look for `✅ Database migrations completed` in logs

## Still Not Working?

**Share these details:**
1. What does `/api/auth/debug` show?
2. Is `DATABASE_URL` in the Variables tab?
3. Is the PostgreSQL service running?
4. What do Railway logs show?

This will help identify the exact issue!

