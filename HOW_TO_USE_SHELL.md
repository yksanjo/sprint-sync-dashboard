# 🖥️ How to Access Railway Shell

## Step-by-Step Guide

### Method 1: From Deployments Tab

1. **Go to your Railway project**
2. **Click on "Deployments" tab** (top navigation bar)
3. **Click on the latest deployment** (the most recent one at the top)
4. **Look for one of these:**
   - A **"Shell"** button
   - A **"Terminal"** button  
   - **Three dots (⋯)** menu → Select "Shell" or "Open Shell"
   - A **terminal icon** 🖥️

### Method 2: From Service Overview

1. **Go to your service** (sprint-sync-dashboard)
2. **Look for a "Shell" or "Terminal" tab** in the service view
3. **Click it** to open the shell

### Method 3: Alternative - Use Railway CLI

If you can't find the web shell, use Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run command directly
railway run npm run create-test-user
```

## What You'll See

Once you open the shell, you'll see a terminal prompt like:
```bash
/app $
```

This means you're in the container and can run commands!

## Common Commands

Once in the shell, you can run:

```bash
# Create a test user
npm run create-test-user

# Or with custom email/password
npm run create-test-user test@example.com mypassword

# Check database connection
npx prisma db pull

# Run migrations manually (if needed)
npx prisma migrate deploy

# Check environment variables
env | grep DATABASE_URL

# Check if files exist
ls -la
```

## Troubleshooting

**Can't find Shell button?**
- Make sure you're looking at the **latest deployment**
- Some Railway interfaces have it in different places
- Try refreshing the page

**Shell not working?**
- Make sure your service is deployed and running
- Wait a few seconds after deployment completes
- Try clicking on a different deployment

**Alternative: Use Railway CLI** (see Method 3 above)

---

**Quick Tip:** The shell runs inside your deployed container, so you have access to all your code, dependencies, and environment variables!

