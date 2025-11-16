# 👀 How to View Your Product

## Step 1: Get Your Railway URL

1. **Go to Railway Dashboard**: https://railway.app
2. **Click on your project** → **Click on your service** (sprint-sync-dashboard)
3. **Click "Settings"** → **"Networking"** tab
4. **Find your domain** - it should look like:
   - `https://sprint-sync-dashboard-production.up.railway.app`
   - Or your custom domain if you set one up

## Step 2: Visit Your App

1. **Copy the URL** from Railway
2. **Open in browser**
3. **You should see:**
   - Login page (if not logged in)
   - Or dashboard (if you're logged in)

## Step 3: Test It Out

### Create an Account

1. Click **"Register"**
2. Enter:
   - Email
   - Password (min 8 characters)
   - Name (optional)
3. Click **"Register"**

### Create Your First Configuration

1. After login, click **"+ New Configuration"**
2. Fill in:
   - **GitHub Token** (from GitHub Settings → Developer settings → Personal access tokens)
   - **GitHub Org** (your organization or username)
   - **GitHub Repos** (comma-separated: `repo1,repo2`)
   - **Slack Bot Token** (from Slack app settings)
   - **Slack Signing Secret** (from Slack app settings)
   - **Slack Channel ID** (from Slack channel URL)
3. Click **"Create Configuration"**

### Test the Worker

1. **Manual trigger** (for testing):
   - Go to: `https://your-app.up.railway.app/api/worker/run`
   - Or use curl:
     ```bash
     curl -X POST https://your-app.up.railway.app/api/worker/run
     ```
2. **Check Slack** - you should see the daily summary!

## Step 4: Set Up Scheduled Runs

### Option A: Railway Cron (Recommended)

1. In Railway, click **"+ New"** → **"Cron Job"**
2. **Schedule**: `0 9 * * *` (9 AM daily)
3. **Command**: `npm run start:worker`
4. **Service**: Your main service

### Option B: External Cron Service

Use [cron-job.org](https://cron-job.org) (free):
1. Sign up
2. Create new cron job
3. URL: `https://your-app.up.railway.app/api/worker/run`
4. Method: POST
5. Schedule: Daily at 9 AM

## Step 5: Share Your URL

Your app URL is ready to share! It should look like:
```
https://sprint-sync-dashboard-production.up.railway.app
```

Or if you set up a custom domain:
```
https://sprintsync.io
```

## Troubleshooting

### App Not Loading?

1. **Check Railway logs:**
   - Go to Railway → Deployments → View Logs
   - Look for errors

2. **Check if service is running:**
   - Go to Railway → Metrics
   - Should show CPU/memory usage

3. **Check environment variables:**
   - Go to Railway → Variables
   - Make sure `DATABASE_URL` is set
   - Make sure `JWT_SECRET` is set

### Database Issues?

1. **Run migrations:**
   - Go to Railway → Deployments → Shell
   - Run: `npx prisma migrate deploy`

2. **Check database connection:**
   - Verify `DATABASE_URL` is set correctly
   - Check PostgreSQL service is running

### Can't Register/Login?

- Check database is set up
- Check JWT_SECRET is set
- Check logs for errors

---

**Your app is live! 🎉**

Share the URL and start getting users!

