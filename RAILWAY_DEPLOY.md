# 🚂 Railway Deployment Guide

Complete guide to deploy Sprint Sync Dashboard as a SaaS on Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app) (free tier available)
2. **GitHub Account**: Your code should be on GitHub
3. **Stripe Account** (optional): For payments - sign up at [stripe.com](https://stripe.com)

## Step 1: Prepare Your Repository

Your repository is already set up with:
- ✅ Railway configuration files
- ✅ Database schema (Prisma)
- ✅ Web UI
- ✅ API server
- ✅ Worker process

## Step 2: Deploy to Railway

### 2.1 Create New Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `sprint-sync-dashboard` repository

### 2.2 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a database
4. Copy the `DATABASE_URL` from the database service (you'll need it)

### 2.3 Configure Environment Variables

In your Railway project, go to **Variables** tab and add:

#### Required Variables

```bash
# Database (Railway auto-provides this, but verify it's set)
DATABASE_URL=postgresql://...

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Frontend URL (your Railway app URL)
FRONTEND_URL=https://your-app-name.up.railway.app

# Node Environment
NODE_ENV=production
```

#### Optional: Stripe (for payments)

```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_TEAM=price_xxx
```

### 2.4 Deploy

Railway will automatically:
1. Detect your `package.json`
2. Run `npm install`
3. Run `npm run build`
4. Start your app with `npm start`

**Your app should be live!** 🎉

## Step 3: Set Up Database

### 3.1 Run Migrations

1. In Railway, go to your project
2. Click on your service
3. Go to **"Deployments"** tab
4. Click on the latest deployment
5. Open **"Shell"** tab
6. Run:

```bash
npx prisma migrate deploy
npx prisma generate
```

Or add this to your build command in `railway.json`:

```json
{
  "build": {
    "buildCommand": "npm install && npm run db:generate && npm run build"
  }
}
```

## Step 4: Set Up Worker (Scheduled Jobs)

The worker process runs sprint syncs on a schedule. You have two options:

### Option A: Railway Cron Jobs (Recommended)

1. In Railway, click **"+ New"**
2. Select **"Cron Job"**
3. Configure:
   - **Schedule**: `0 9 * * *` (9 AM daily)
   - **Command**: `npm run start:worker`
   - **Service**: Your main service

### Option B: External Cron Service

Use a service like:
- [cron-job.org](https://cron-job.org) (free)
- [EasyCron](https://www.easycron.com) (free tier)

Set it to call: `https://your-app.up.railway.app/api/worker/run` (you'll need to add this endpoint)

## Step 5: Set Up Custom Domain (Optional)

1. In Railway, go to your service
2. Click **"Settings"** → **"Networking"**
3. Click **"Generate Domain"** (free Railway domain)
4. Or add your custom domain:
   - Click **"Custom Domain"**
   - Enter your domain (e.g., `sprintsync.io`)
   - Follow DNS instructions

## Step 6: Set Up Stripe (Optional - for Payments)

### 6.1 Create Products in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Products** → **Add Product**
3. Create two products:
   - **Pro Plan**: $9/month (recurring)
   - **Team Plan**: $29/month (recurring)
4. Copy the **Price IDs** (starts with `price_`)

### 6.2 Set Up Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. URL: `https://your-app.up.railway.app/api/subscription/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Webhook Signing Secret** (starts with `whsec_`)

### 6.3 Add Stripe Variables to Railway

Add to Railway environment variables:
```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_TEAM=price_xxx
```

## Step 7: Test Your Deployment

1. **Visit your app**: `https://your-app.up.railway.app`
2. **Register** a new account
3. **Create a configuration** with your GitHub/Slack tokens
4. **Check logs** in Railway to see if worker runs

## Step 8: Monitor and Maintain

### View Logs

1. In Railway, go to your service
2. Click **"Deployments"** → **"View Logs"**

### Monitor Database

1. Click on your PostgreSQL service
2. View **"Metrics"** tab
3. Check **"Data"** tab for your tables

### Update Your App

Just push to GitHub! Railway auto-deploys on push to main branch.

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly
- Check database service is running
- Run migrations: `npx prisma migrate deploy`

### Build Failures

- Check build logs in Railway
- Verify all dependencies in `package.json`
- Ensure TypeScript compiles: `npm run build`

### Worker Not Running

- Check cron job configuration
- Verify worker command: `npm run start:worker`
- Check worker logs

### Stripe Webhook Not Working

- Verify webhook URL is correct
- Check webhook secret matches
- View webhook events in Stripe dashboard

## Cost Estimate

**Free Tier:**
- Railway: $5 credit/month (usually enough for small apps)
- Database: Included
- **Total: $0/month**

**Growing:**
- Railway: $5-10/month
- Database: Included
- **Total: $5-10/month**

## Next Steps

1. ✅ Your app is live!
2. 📧 Set up email notifications (optional)
3. 📊 Add analytics (optional)
4. 🚀 Start promoting!

## Support

- Railway Docs: https://docs.railway.app
- Prisma Docs: https://www.prisma.io/docs
- Stripe Docs: https://stripe.com/docs

---

**Congratulations! Your SaaS is live! 🎉**



