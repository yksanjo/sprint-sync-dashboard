# 🚀 Deployment Guide

Multiple ways to deploy Sprint Sync Dashboard - choose what works best for you!

## 🐳 Option 1: Docker (Easiest for Self-Hosting)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yksanjo/sprint-sync-dashboard.git
cd sprint-sync-dashboard

# 2. Copy environment file
cp env.example .env

# 3. Edit .env with your credentials
nano .env

# 4. Run with Docker Compose
docker-compose up -d

# 5. Check logs
docker-compose logs -f
```

### Manual Docker Run

```bash
docker build -t sprint-sync-dashboard .
docker run --env-file .env sprint-sync-dashboard
```

## ☁️ Option 2: Railway (Recommended for Hosted)

1. **Go to [Railway.app](https://railway.app)** and sign up
2. **New Project** → **Deploy from GitHub repo**
3. Select `yksanjo/sprint-sync-dashboard`
4. **Add Environment Variables:**
   - `GITHUB_TOKEN`
   - `GITHUB_ORG`
   - `GITHUB_REPOS`
   - `SLACK_BOT_TOKEN`
   - `SLACK_SIGNING_SECRET`
   - `SLACK_CHANNEL_ID`
   - `JIRA_*` or `LINEAR_*` (optional)
5. **Deploy!**

Railway will automatically:
- Build the Docker image
- Run the application
- Provide a URL

**Note:** For scheduled runs, use GitHub Actions or Railway Cron Jobs.

## 🌐 Option 3: Render

1. **Go to [Render.com](https://render.com)** and sign up
2. **New +** → **Web Service**
3. Connect your GitHub repository
4. **Settings:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
   - **Environment:** Node
5. **Add Environment Variables** (same as Railway)
6. **Deploy!**

## ⚡ Option 4: GitHub Actions (Current - No Hosting Needed)

Already configured! Just:
1. Add secrets to your repository
2. The workflow runs daily automatically
3. No hosting costs!

See `.github/workflows/daily-sync.yml`

## 🚁 Option 5: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Add secrets
fly secrets set GITHUB_TOKEN=xxx
fly secrets set SLACK_BOT_TOKEN=xxx
# ... etc

# Deploy
fly deploy
```

## 📊 Comparison

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **GitHub Actions** | ⭐ Easy | Free | Scheduled daily runs |
| **Docker** | ⭐⭐ Medium | Free | Self-hosting |
| **Railway** | ⭐ Easy | Free tier | Quick hosted deployment |
| **Render** | ⭐ Easy | Free tier | Simple hosting |
| **Fly.io** | ⭐⭐ Medium | Free tier | Global distribution |

## 🔄 Scheduled Runs

### Using GitHub Actions (Recommended)
Already configured! Runs daily at 9 AM.

### Using Cron (Self-Hosted)
```bash
# Add to crontab
0 9 * * * cd /path/to/sprint-sync-dashboard && docker-compose run --rm sprint-sync node dist/index.js
```

### Using Railway Cron
Railway supports cron jobs - configure in dashboard.

## 🎯 Recommended Setup

**For most users:** GitHub Actions (already set up!)
- ✅ Free
- ✅ No hosting needed
- ✅ Runs automatically
- ✅ Easy to configure

**For advanced users:** Docker + Self-hosted
- ✅ Full control
- ✅ Can customize schedule
- ✅ No external dependencies

**For SaaS version:** Railway/Render
- ✅ Easy deployment
- ✅ Can add web UI later
- ✅ Scales automatically

## 📝 Environment Variables

See `env.example` for all required variables.

**Required:**
- `GITHUB_TOKEN`
- `GITHUB_ORG`
- `GITHUB_REPOS`
- `SLACK_BOT_TOKEN`
- `SLACK_SIGNING_SECRET`
- `SLACK_CHANNEL_ID`

**Optional:**
- `JIRA_*` (if using Jira)
- `LINEAR_*` (if using Linear)
- `TIMEZONE` (default: America/New_York)
- `SPRINT_LENGTH_DAYS` (default: 10)
- `ALERT_THRESHOLD_DAYS` (default: 3)

## 🐛 Troubleshooting

### Docker Issues
```bash
# Rebuild image
docker-compose build --no-cache

# Check logs
docker-compose logs sprint-sync

# Restart
docker-compose restart
```

### Railway/Render Issues
- Check build logs in dashboard
- Verify all environment variables are set
- Ensure Node.js version is 20+

### GitHub Actions Issues
- Check Actions tab for error logs
- Verify secrets are set correctly
- Check workflow file syntax

## 🎉 After Deployment

1. **Test the connection:**
   - Check Slack for daily summary
   - Verify GitHub PRs are fetched
   - Confirm Jira/Linear integration works

2. **Monitor:**
   - Check logs regularly
   - Set up error alerts
   - Monitor API rate limits

3. **Customize:**
   - Adjust schedule if needed
   - Tune alert thresholds
   - Add more repositories

---

Need help? Open an issue on GitHub!

