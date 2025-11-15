# 🔄 How to Redeploy on Railway

## Quick Redeploy (30 seconds)

### Method 1: From Deployments Tab (Easiest)

1. **Go to Railway Dashboard**: https://railway.app
2. **Click on your project** → **Click on your service**
3. **Click "Deployments" tab** (top menu)
4. **Click the three dots (⋯)** on the latest deployment
5. **Click "Redeploy"**
6. **Wait for build to complete** (usually 2-5 minutes)

### Method 2: From Settings

1. **Go to your service** in Railway
2. **Click "Settings"** (left sidebar)
3. **Scroll to "Source"** section
4. **Click "Redeploy"** button
5. **Wait for build**

### Method 3: Push to GitHub (Automatic)

If you have auto-deploy enabled (default):

1. **Make a small change** (or just push latest code):
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```
2. **Railway automatically detects** the push
3. **New deployment starts automatically**
4. **Check "Deployments" tab** to see progress

## Force Rebuild (If Build is Cached)

If you're having build issues and want to clear cache:

1. **Go to your service** → **Settings** → **Build**
2. **Click "Clear Build Cache"**
3. **Then redeploy** using Method 1 or 2 above

## Change Builder (Dockerfile → Nixpacks)

If Railway is using Dockerfile and you want to use Nixpacks:

1. **Go to your service** → **Settings** → **Build**
2. **Change "Builder"** from "Dockerfile" to **"Nixpacks"**
3. **Save**
4. **Redeploy** (it will use Nixpacks now)

## Monitor Deployment

### View Build Logs

1. **Go to "Deployments" tab**
2. **Click on the deployment** (the one that's building)
3. **Click "View Logs"** or **"Build Logs"**
4. **Watch the build progress** in real-time

### Check Deployment Status

- **Building** = Still compiling
- **Deploying** = Building finished, starting app
- **Active** = ✅ Successfully deployed!
- **Failed** = ❌ Check logs for errors

## Troubleshooting Failed Deployments

### If Build Fails:

1. **Click on the failed deployment**
2. **Click "View Logs"**
3. **Scroll to find the error** (usually at the end)
4. **Common issues:**
   - Missing environment variables
   - Build command failing
   - Database connection issues

### Quick Fixes:

**Build command error:**
- Go to **Settings** → **Build**
- Set **Build Command**: `npm install && npx prisma generate && npm run build`

**Missing DATABASE_URL:**
- Go to **Variables** tab
- Add `DATABASE_URL` (Railway auto-provides this from PostgreSQL service)

**Prisma errors:**
- Make sure PostgreSQL service is added
- Check `DATABASE_URL` is set
- Try: `npx prisma migrate deploy` in Railway shell

## Redeploy After Code Changes

### Automatic (Recommended):

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
2. **Railway auto-deploys** (if connected to GitHub)

### Manual:

Use Method 1 or 2 above to manually trigger redeploy.

## Check Your App is Live

After deployment completes:

1. **Go to "Settings"** → **"Networking"**
2. **Copy your app URL** (e.g., `https://your-app.up.railway.app`)
3. **Visit the URL** in browser
4. **Should see your app!** 🎉

## Pro Tips

- ✅ **Always check logs** if deployment fails
- ✅ **Use Nixpacks** for Node.js projects (better than Dockerfile)
- ✅ **Clear build cache** if you change dependencies
- ✅ **Monitor first deployment** to catch issues early

---

**Need help?** Check the build logs - they usually tell you exactly what's wrong!

