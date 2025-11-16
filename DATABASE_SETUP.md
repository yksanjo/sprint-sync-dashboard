# 🗄️ Database Setup Guide

## Quick Setup

### Step 1: Add PostgreSQL Database in Railway

1. Go to Railway → Your Project
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway automatically creates the database and sets `DATABASE_URL`

### Step 2: Verify DATABASE_URL

1. Go to Railway → Your Service → **Variables** tab
2. Check that `DATABASE_URL` is set
3. It should look like: `postgresql://user:pass@host:port/dbname`

### Step 3: Run Migrations

Migrations now run automatically on startup (added to `npm start`), but you can also run manually:

**Option A: Automatic (Recommended)**
- Migrations run automatically when the app starts
- Check logs for: `✅ Database migrations completed`

**Option B: Manual (If needed)**
1. Go to Railway → Deployments → Latest → **Shell**
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

### Step 4: Verify Database Connection

Check Railway logs for:
- `✅ Database connected successfully`
- If you see `❌ Database connection failed`, check `DATABASE_URL`

## Troubleshooting Registration Errors

### Error: "Database tables not found"

**Solution:** Run migrations
```bash
npx prisma migrate deploy
```

### Error: "Database connection failed"

**Check:**
1. `DATABASE_URL` is set in Railway Variables
2. PostgreSQL service is running in Railway
3. Database service is connected to your app service

### Error: "Email already registered"

This is normal - the email is already in use. Try a different email or login instead.

### Error: "Registration failed" (generic)

**Check Railway Deploy Logs:**
1. Go to Railway → Deployments → View Logs
2. Look for "Registration error:" messages
3. Check for Prisma error codes:
   - `P1001` = Database connection failed
   - `P2002` = Unique constraint violation (email exists)
   - `P2025` = Record not found

## Create Initial Migration (If needed)

If you need to create a migration from scratch:

```bash
# Locally
npx prisma migrate dev --name init

# This creates the migration files
# Then commit and push to GitHub
# Railway will run `prisma migrate deploy` on startup
```

## Verify Tables Exist

In Railway Shell, you can check:

```bash
# Connect to database
npx prisma studio
# Or use psql if available
```

## Common Issues

### Issue: Migrations fail on startup

**Solution:** Run migrations manually first:
```bash
npx prisma migrate deploy
```

Then restart the service.

### Issue: "Can't reach database server"

**Check:**
1. PostgreSQL service is running
2. `DATABASE_URL` is correct
3. Database service is in the same Railway project

### Issue: "Migration already applied"

This is fine - migrations are idempotent. The app will continue normally.

## Environment Variables Checklist

Make sure these are set in Railway Variables:

- ✅ `DATABASE_URL` - Auto-provided by Railway PostgreSQL
- ✅ `JWT_SECRET` - Required for authentication
- ✅ `NODE_ENV=production` - Set automatically by Railway

## Next Steps

After database is set up:
1. ✅ Try registering a new user
2. ✅ Try logging in
3. ✅ Create a configuration
4. ✅ Test the API endpoints

---

**Need help?** Check the Railway logs for specific error messages!



