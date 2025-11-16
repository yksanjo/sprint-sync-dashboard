# 🔧 Fix Login/Registration Issues

## Quick Fix Steps

### Step 1: Check Database Status

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
  "hasJwtSecret": true
}
```

**If you see an error**, follow the suggestion it gives you.

### Step 2: Ensure Database is Set Up

1. Go to Railway → Your Project
2. Check if you have a **PostgreSQL** service
3. If not: Click "+ New" → "Database" → "Add PostgreSQL"
4. Wait for it to be created

### Step 3: Verify Migrations Ran

Check Railway logs for:
```
✅ Database migrations completed
```

**If migrations didn't run:**

1. Go to Railway → Deployments → Latest → **Shell**
2. Run:
   ```bash
   npx prisma migrate deploy
   ```
3. You should see:
   ```
   ✅ Applied migration: 0_init
   ```

### Step 4: Test Registration

Try registering with:
- **Email:** `test@example.com`
- **Password:** `test123456` (min 8 characters)

**If it fails**, check:
1. What error message shows on the page
2. Railway logs for "Registration error:"
3. Browser console (F12) for errors

### Step 5: Create Test User (Bypass Registration)

If registration still fails, create a user directly:

1. Go to Railway → Deployments → Latest → **Shell**
2. Run:
   ```bash
   npm run create-test-user test@example.com test123456
   ```
3. Then login with those credentials

## Common Errors & Fixes

### Error: "Database connection failed"
**Fix:** 
- Check Railway Variables → Make sure `DATABASE_URL` exists
- Verify PostgreSQL service is running

### Error: "Database tables not found"
**Fix:**
- Run migrations: `npx prisma migrate deploy`
- Check Railway logs for migration errors

### Error: "Email already registered"
**Fix:**
- This is normal - try a different email
- Or login with that email instead

### Error: "Registration failed" (generic)
**Fix:**
- Check Railway logs for the actual error
- The error message should now show more details
- Look for Prisma error codes (P1001, P2002, etc.)

## Still Not Working?

**Share these details:**
1. What `/api/auth/debug` shows
2. The exact error from registration page
3. Railway logs (last 20 lines)

This will help identify the exact issue!

