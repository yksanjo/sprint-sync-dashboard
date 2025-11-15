# 🔧 Railway Build Fix

If you're getting build errors on Railway, follow these steps:

## Issue: Build fails with "npm ci --only=production" error

This happens because Railway is trying to use the Dockerfile, which installs production dependencies before building (but we need dev dependencies to build TypeScript).

## Solution 1: Use Nixpacks (Recommended)

Railway should automatically use Nixpacks for Node.js projects. If it's using Dockerfile instead:

1. **In Railway dashboard:**
   - Go to your service
   - Click **Settings** → **Build**
   - Change **Builder** from "Dockerfile" to **"Nixpacks"**
   - Save

2. **The build should now work!**

## Solution 2: Fix Dockerfile (If Railway insists on using it)

The Dockerfile has been fixed, but if you still have issues:

1. **Make sure Railway is using the latest code:**
   - Push latest changes to GitHub
   - Railway should auto-redeploy

2. **Or manually trigger rebuild:**
   - Go to Railway dashboard
   - Click **Deployments**
   - Click **Redeploy**

## Solution 3: Manual Build Command Override

If neither works, you can override the build command in Railway:

1. Go to your service → **Settings** → **Build**
2. Set **Build Command** to:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
3. Set **Start Command** to:
   ```bash
   npm start
   ```

## Verify Build Steps

The build should:
1. ✅ Install all dependencies (including dev)
2. ✅ Generate Prisma client
3. ✅ Build TypeScript (`tsc`)
4. ✅ Build web UI (`cd web && npm install && npm run build`)
5. ✅ Start server (`node dist/server/index.js`)

## Still Having Issues?

1. **Check Railway logs:**
   - Go to **Deployments** → Latest deployment → **View Logs**
   - Look for error messages

2. **Common issues:**
   - Missing `package-lock.json` → Run `npm install` locally and commit it
   - Prisma not generating → Make sure `DATABASE_URL` is set (even if empty initially)
   - Web build failing → Check `web/package.json` exists

3. **Quick fix - disable web build temporarily:**
   - Change `build:web` script to: `echo "Skipping web build"`
   - Deploy
   - Fix web build later

## Recommended: Use Nixpacks

Nixpacks is Railway's default builder and handles Node.js projects better. The `nixpacks.toml` file has been added to configure it properly.

