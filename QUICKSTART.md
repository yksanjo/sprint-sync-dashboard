# Quick Start Guide

Get Sprint Sync Dashboard up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd sprint-sync-dashboard
npm install
```

## Step 2: Get Your API Tokens

### GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token (starts with `ghp_`)

### Slack Bot Token
1. Go to https://api.slack.com/apps
2. Create a new app or use existing
3. Go to "OAuth & Permissions"
4. Add scopes: `chat:write`, `commands`, `channels:read`
5. Install app to workspace
6. Copy "Bot User OAuth Token" (starts with `xoxb-`)
7. Copy "Signing Secret" from "Basic Information"

### Get Slack Channel ID
1. Open Slack in browser
2. Go to your channel
3. Look at the URL: `https://workspace.slack.com/archives/C1234567890`
4. The `C1234567890` part is your channel ID

### Jira Token (Optional)
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API token
3. Use your email + API token for authentication

### Linear API Key (Optional - Alternative to Jira)
1. Go to Linear Settings → API
2. Create a personal API key
3. Get your team ID from the URL when viewing a team

## Step 3: Configure Environment

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

Edit `.env` with your values:

```bash
# Required
GITHUB_TOKEN=ghp_your_token_here
GITHUB_ORG=your-org-name
GITHUB_REPOS=repo1,repo2
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_CHANNEL_ID=C1234567890

# Optional - Jira OR Linear (at least one recommended)
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-jira-token
JIRA_PROJECT_KEY=PROJ
```

## Step 4: Build and Run

```bash
npm run build
npm start
```

You should see output like:
```
🚀 Starting Sprint Sync Dashboard...
✓ Configuration loaded (2 repos)
✓ GitHub client initialized
✓ Jira client initialized
✓ Slack client initialized
...
✅ Sprint sync completed successfully!
```

## Step 5: Check Slack

Go to your Slack channel - you should see the daily sprint health report!

## Step 6: Set Up GitHub Actions (Optional)

1. Push this code to a GitHub repository
2. Go to repository Settings → Secrets and variables → Actions
3. Add all the secrets from your `.env` file
4. The workflow will run daily at 9 AM (adjust timezone in `.github/workflows/daily-sync.yml`)

## Troubleshooting

### "GITHUB_TOKEN is required"
- Make sure your `.env` file exists and has the correct token
- Check that the token has `repo` scope

### "SLACK_BOT_TOKEN is required"
- Verify your Slack bot token is correct
- Make sure the bot is installed to your workspace

### "Repository not found or not accessible"
- Check that your GitHub token has access to the repositories
- Verify the org name and repo names are correct

### "No active sprint found"
- This is normal if you don't have an active sprint in Jira/Linear
- The tool will still work for PR metrics

### Slack messages not appearing
- Verify the bot is invited to the channel: `/invite @YourBotName`
- Check that `SLACK_CHANNEL_ID` is correct (use ID, not channel name)
- Ensure the bot has `chat:write` scope

## Next Steps

- Customize the alert thresholds in `.env`
- Set up slash commands in Slack app settings
- Adjust the daily schedule in GitHub Actions workflow
- Add more repositories to monitor

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the code comments for implementation details
- Open an issue on GitHub if you encounter bugs

