# 🔧 Railway Database Setup - Complete Guide

## Quick Fix Steps

### Step 1: Check Environment Variables in Railway

Go to your Railway project and make sure these variables are set:

**Option A: Single DATABASE_URL (Recommended)**
```
DATABASE_URL=postgresql://username:password@host:port/database
```

**Option B: Individual Variables (if your code supports it)**
```
DB_HOST=your-host
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
DB_PORT=5432
```

**Note:** This app uses `DATABASE_URL` (Option A).

### Step 2: Link Database to Your Service

In Railway:

1. **Click on your web service** (sprint-sync-dashboard, NOT the database)
2. **Go to "Variables" tab**
3. **Look for "Reference variables from another service"** or **"Shared Variables"**
4. **Select your PostgreSQL database service**
5. This will automatically add `DATABASE_URL` to your app service

**Alternative: Manual Linking**
1. Go to Railway → Your PostgreSQL service
2. Click "Variables" tab
3. Find `DATABASE_URL` and **copy its value**
4. Go to Railway → Your app service (sprint-sync-dashboard)
5. Click "Variables" tab → "+ New Variable"
6. Key: `DATABASE_URL`
7. Value: Paste the value you copied
8. Save

### Step 3: Verify Database Connection

Your code already reads `DATABASE_URL` correctly:
```typescript
// In server/db/index.ts
const prisma = new PrismaClient(); // Uses DATABASE_URL from env
```

**Test the connection:**
1. Visit: `https://your-app.up.railway.app/api/auth/debug`
2. Should show: `"database": "connected"`

### Step 4: Redeploy

After setting variables:

1. **Save the changes** in Railway
2. **Railway should auto-redeploy** (watch the Deployments tab)
3. **If not, manually trigger a redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" or "Deploy Latest"

## Common Issues & Solutions

### ❌ Variables Not Linked

**Symptom:** `DATABASE_URL` is missing from your app service Variables tab

**Solution:**
- Database and web service aren't connected
- Follow Step 2 above to link them
- Make sure both services are in the same Railway project

### ❌ Wrong Variable Names

**Symptom:** Variables exist but app still can't connect

**Solution:**
- This app expects `DATABASE_URL` (not `DB_HOST`, `DB_USER`, etc.)
- Check that the variable is named exactly `DATABASE_URL`
- Check that it starts with `postgresql://`

### ❌ Database Not Started

**Symptom:** Connection errors even with `DATABASE_URL` set

**Solution:**
- Go to Railway → Your PostgreSQL service
- Check if it shows as "Active" or "Running"
- If stopped, click "Start" or "Deploy"
- Wait for it to fully start (30-60 seconds)

### ❌ Migrations Not Run

**Symptom:** Database connected but "table does not exist" errors

**Solution:**
- Migrations should run automatically on startup
- Check Railway logs for: `✅ Database migrations completed`
- If missing, go to Deployments → Latest → Shell
- Run: `npx prisma migrate deploy`

## Verification Checklist

- [ ] PostgreSQL service exists in Railway project
- [ ] PostgreSQL service is running (shows as "Active")
- [ ] `DATABASE_URL` exists in app service Variables tab
- [ ] `DATABASE_URL` starts with `postgresql://`
- [ ] Both services are in the same Railway project
- [ ] App service has been redeployed after adding database
- [ ] `/api/auth/debug` shows `"database": "connected"`

## Still Not Working?

**Check Railway Logs:**
1. Go to Railway → Your Service → Deployments → Latest → View Logs
2. Look for:
   - `✅ Database connected successfully` → Good!
   - `❌ Database connection failed` → Check DATABASE_URL format
   - `⚠️ DATABASE_URL not set!` → Database not linked

**Test Debug Endpoint:**
Visit: `https://your-app.up.railway.app/api/auth/debug`

This will show:
- If `DATABASE_URL` is set
- If database is connected
- What error (if any) is occurring
- Specific suggestions to fix it

## Quick Test

After setup, test registration:
1. Go to your app: `https://your-app.up.railway.app`
2. Try to register with:
   - Email: `test@example.com`
   - Password: `test123456`
3. Should work without errors!

---

**Most Common Issue:** Database service exists but `DATABASE_URL` isn't linked to the app service. Follow Step 2 to link them! 🔗

