# 🔍 Diagnose Registration Error

Since you already have the database set up, let's find the exact issue:

## Step 1: Check Debug Endpoint (30 seconds)

**Visit this URL in your browser:**
```
https://your-app-name.up.railway.app/api/auth/debug
```

**What to look for:**

✅ **If it shows:**
```json
{
  "status": "ok",
  "database": "connected",
  "tables": "exists",
  "userCount": 0,
  "hasJwtSecret": true
}
```
→ Database is working! The issue is something else.

❌ **If it shows:**
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "..."
}
```
→ Follow the suggestion it gives you.

## Step 2: Check Railway Logs

1. Go to Railway → Your Service → **Deployments** → Latest → **View Logs**
2. Try to register again
3. Look for lines that say:
   - `Registration error:`
   - `Error details:`
   - `❌` or `ERROR`

**Common errors you might see:**

### Error: "P1001" or "Can't reach database server"
→ Database service might not be running or not linked properly
- Go to Railway → Check if PostgreSQL service shows as "Active"
- Make sure it's in the same project as your app

### Error: "table does not exist" or "relation does not exist"
→ Migrations didn't run
- Check logs for: `✅ Database migrations completed`
- If you don't see it, migrations failed
- Solution: Go to Railway → Deployments → Latest → Shell → Run: `npx prisma migrate deploy`

### Error: "P2002" or "Unique constraint"
→ Email already exists (this is normal - try a different email)

### Error: "JWT_SECRET" related
→ JWT_SECRET not set (but it has a default, so this is unlikely)

## Step 3: Check Environment Variables

Go to Railway → Your Service → **Variables** tab

**Required:**
- ✅ `DATABASE_URL` - Should be set automatically by Railway
- ⚠️ `JWT_SECRET` - Optional (has default), but recommended for production

**To add JWT_SECRET:**
1. Click "+ New Variable"
2. Key: `JWT_SECRET`
3. Value: Any random string (e.g., `openssl rand -hex 32`)

## Step 4: Test Registration with Specific Error

Try registering and check:

1. **What error message shows on the page?**
   - The registration page now shows detailed errors
   - Look for the yellow warning box or red error box

2. **Check browser console:**
   - Press F12 → Console tab
   - Try registering
   - Look for any red error messages

3. **Check Network tab:**
   - Press F12 → Network tab
   - Try registering
   - Click on the `/api/auth/register` request
   - Check the "Response" tab to see the exact error

## Step 5: Quick Test - Create User Directly

If registration keeps failing, bypass it:

1. Go to Railway → Your Service → **Deployments** → Latest → **Shell**
2. Run:
   ```bash
   npm run create-test-user test@example.com test123456
   ```
3. If this works, you'll see:
   ```
   ✅ User created successfully!
   📧 Email: test@example.com
   🔑 Password: test123456
   ```
4. Then just login with those credentials!

**If this also fails**, the error message will tell you exactly what's wrong.

## Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Database connection failed" | DATABASE_URL not set or wrong | Check Railway Variables |
| "Table does not exist" | Migrations didn't run | Run `npx prisma migrate deploy` |
| "Email already registered" | User exists | Use different email or login |
| "Registration failed" (generic) | Check logs | See Railway Deploy Logs |
| 500 Internal Server Error | Server error | Check Railway logs for details |

## Still Stuck?

**Share these details:**
1. What the `/api/auth/debug` endpoint shows
2. The exact error message from the registration page
3. Any errors from Railway logs (last 50 lines)

This will help identify the exact issue!

