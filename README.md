# Sprint Sync Dashboard

A developer productivity tool that aggregates sprint health metrics across GitHub, Jira/Linear, and Slack. Get daily summaries, real-time alerts, and interactive commands to keep your team on track.

## Features

- 📊 **PR Health Scoring**: Automated health scores based on PR age, reviews, CI/CD status, and activity
- 🚀 **Sprint Velocity Tracking**: Monitor sprint progress, burndown rates, and completion percentages
- 🔍 **Anomaly Detection**: Automatically detect stale PRs, blockers, overloaded developers, and at-risk sprints
- 📱 **Slack Integration**: Daily summaries, real-time alerts, and interactive slash commands
- 🔄 **GitHub Actions**: Automated daily syncs via GitHub Actions

## Architecture

```
┌─────────────┐
│ GitHub API  │───┐
└─────────────┘   │
                  │    ┌──────────────┐
┌─────────────┐   ├───▶│ Data Engine  │
│ Jira/Linear │───┤    │ (Node.js)    │
└─────────────┘   │    └──────┬───────┘
                  │           │
┌─────────────┐   │           │
│  Slack API  │───┘           │
└─────────────┘               │
                              ▼
                    ┌──────────────────┐
                    │ Metrics Calculator│
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Slack Notifier   │
                    └───────────────────┘
```

## Setup

### Prerequisites

- Node.js 20+
- GitHub Personal Access Token (with `repo` scope)
- Slack Bot Token and Signing Secret
- Jira API Token OR Linear API Key (optional, but recommended)

### Installation

1. **Clone and install dependencies:**

```bash
cd sprint-sync-dashboard
npm install
```

2. **Configure environment variables:**

Create a `.env` file (see `.env.example`):

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_xxx
GITHUB_ORG=your-org
GITHUB_REPOS=repo1,repo2,repo3

# Jira Configuration (optional)
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=xxx
JIRA_PROJECT_KEY=PROJ

# Linear Configuration (optional - use either Jira or Linear)
LINEAR_API_KEY=lin_api_xxx
LINEAR_TEAM_ID=team_xxx

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-xxx
SLACK_SIGNING_SECRET=xxx
SLACK_CHANNEL_ID=C1234567890

# Application Configuration
TIMEZONE=America/New_York
SPRINT_LENGTH_DAYS=10
ALERT_THRESHOLD_DAYS=3
```

3. **Build the project:**

```bash
npm run build
```

4. **Run manually:**

```bash
npm start
```

## GitHub Actions Setup

1. **Add secrets to your GitHub repository:**

Go to Settings → Secrets and variables → Actions, and add:

- `GITHUB_TOKEN` (automatically available, but you may need a PAT with more permissions)
- `GITHUB_ORG`: Your GitHub organization or username
- `GITHUB_REPOS`: Comma-separated list of repositories (e.g., `repo1,repo2,repo3`)
- `SLACK_BOT_TOKEN`: Your Slack bot token
- `SLACK_SIGNING_SECRET`: Your Slack app signing secret
- `SLACK_CHANNEL_ID`: The Slack channel ID where reports will be posted
- `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY` (if using Jira)
- `LINEAR_API_KEY`, `LINEAR_TEAM_ID` (if using Linear)
- `TIMEZONE`: Timezone for daily reports (default: `America/New_York`)
- `SPRINT_LENGTH_DAYS`: Sprint length in days (default: `10`)
- `ALERT_THRESHOLD_DAYS`: Days before alerting on stale PRs (default: `3`)

2. **The workflow will run daily at 9 AM** (adjust the cron schedule in `.github/workflows/daily-sync.yml` for your timezone)

3. **Manual trigger:** You can also trigger the workflow manually from the Actions tab

## Slack Setup

1. **Create a Slack App:**

   - Go to https://api.slack.com/apps
   - Create a new app
   - Add the following OAuth scopes:
     - `chat:write`
     - `commands`
     - `channels:read`
     - `channels:history`

2. **Install the app to your workspace**

3. **Get your tokens:**

   - Bot Token: `xoxb-...` (from OAuth & Permissions)
   - Signing Secret: (from Basic Information)

4. **Invite the bot to your channel:**

   - `/invite @YourBotName` in the channel where you want reports

5. **Slash Commands (optional):**

   The app supports these slash commands:
   - `/sprint-health` - Get instant health check
   - `/sprint-blockers` - List all blockers
   - `/sprint-prs` - Show pending PRs

   To enable, add them in your Slack app settings under "Slash Commands"

## PR Health Scoring

The PR Health Score (0-100) is calculated based on:

- **Base Score**: 100
- **Deductions**:
  - Pending PRs > 3 days old: -10 points each
  - PRs without reviewers: -15 points each
  - Failed CI/CD checks: -20 points each
  - Draft PRs > 7 days: -5 points each
  - PRs with unresolved comments > 24 hours: -10 points each
  - PRs with no activity for 48+ hours: -15 points each

## Anomaly Detection

The system automatically detects:

- PRs open > 5 days without merge or close
- Tickets in "In Progress" > 5 days without updates
- Developers with 5+ assigned PRs (overloaded)
- Sprint velocity < 60% with < 3 days remaining
- More than 3 blockers active simultaneously

## Daily Summary Format

The daily summary includes:

- Overall Health Score (0-100)
- Sprint metrics (completed, in progress, at risk story points)
- PR summary (open, draft, merged, average age)
- Action items (critical issues, blockers)
- Top issues list

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Run tests (when implemented)
npm test
```

## Project Structure

```
sprint-sync-dashboard/
├── .github/
│   └── workflows/
│       └── daily-sync.yml          # GitHub Action workflow
├── src/
│   ├── integrations/
│   │   ├── github.ts               # GitHub API client
│   │   ├── jira.ts                 # Jira API client
│   │   ├── linear.ts               # Linear API client
│   │   └── slack.ts                # Slack Bolt app
│   ├── metrics/
│   │   ├── pr-health.ts            # PR health calculations
│   │   ├── sprint-velocity.ts      # Sprint velocity logic
│   │   └── anomaly-detector.ts     # Anomaly detection rules
│   ├── formatters/
│   │   └── slack-messages.ts       # Slack Block Kit formatting
│   ├── config/
│   │   └── index.ts                # Environment config
│   └── index.ts                    # Main entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### GitHub API Rate Limits

The app includes rate limiting delays between repository fetches. If you hit rate limits:

- Use a GitHub Personal Access Token with appropriate scopes
- Reduce the number of repositories monitored
- Increase delays in the code

### Jira API Issues

- Ensure your Jira API token has the correct permissions
- Check that the project key is correct
- Verify the Jira URL format (should end with `.atlassian.net`)

### Slack Notifications Not Appearing

- Verify the bot is invited to the channel
- Check that `SLACK_CHANNEL_ID` is correct (use channel ID, not name)
- Ensure the bot has `chat:write` scope
- Check Slack app logs for errors

## License

MIT

## Contributing

Contributions welcome! Please open an issue or pull request.

