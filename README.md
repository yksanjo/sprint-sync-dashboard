# 🚀 Sprint Sync Dashboard

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![License](https://img.shields.io/badge/License-MIT-yellow)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Enabled-2088FF?logo=github-actions)

**A developer productivity tool that aggregates sprint health metrics across GitHub, Jira/Linear, and Slack**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

> **Keep your team on track** with automated daily summaries, real-time alerts, and interactive Slack commands. Monitor PR health, sprint velocity, and detect anomalies before they become blockers.

![Sprint Sync Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success)

## ✨ Features

### 📊 PR Health Scoring
- **Automated health scores (0-100)** based on PR age, reviews, CI/CD status, and activity
- Track PR staleness, review response times, and unresolved comments
- Identify PRs without reviewers or failed CI/CD checks

### 🚀 Sprint Velocity Tracking
- Monitor sprint progress with **burndown rates** and completion percentages
- Track story points completed vs. planned
- Detect scope creep and velocity drops

### 🔍 Anomaly Detection
- **Automatically detect** stale PRs (>5 days), blockers, and overloaded developers
- Alert on sprint velocity drops and multiple simultaneous blockers
- Identify tickets stuck in progress without updates

### 📱 Slack Integration
- **Daily summaries** posted automatically at 9 AM (configurable)
- **Real-time alerts** for critical issues
- **Interactive slash commands**: `/sprint-health`, `/sprint-blockers`, `/sprint-prs`
- Beautiful Block Kit formatting with actionable insights

### 🔄 GitHub Actions
- **Zero-config deployment** - runs daily via GitHub Actions
- Manual trigger support for on-demand reports
- Automatic error notifications

### 🔌 Multi-Platform Support
- **GitHub** integration via GraphQL API
- **Jira** REST API support
- **Linear** GraphQL API support
- Auto-detects which project management tool is configured

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

## 🚀 Quick Start

### Option 1: GitHub Actions (Recommended)

1. **Fork or clone this repository**
2. **Add secrets** to your repository (Settings → Secrets and variables → Actions):
   - `GITHUB_TOKEN`, `GITHUB_ORG`, `GITHUB_REPOS`
   - `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_CHANNEL_ID`
   - `JIRA_*` or `LINEAR_*` (optional)
3. **The workflow runs daily at 9 AM** - that's it! 🎉

### Option 2: Local Development

See [QUICKSTART.md](QUICKSTART.md) for detailed local setup instructions.

## 📋 Setup

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

## 📊 How It Works

### PR Health Scoring

The PR Health Score (0-100) is calculated based on:

- **Base Score**: 100
- **Deductions**:
  - Pending PRs > 3 days old: -10 points each
  - PRs without reviewers: -15 points each
  - Failed CI/CD checks: -20 points each
  - Draft PRs > 7 days: -5 points each
  - PRs with unresolved comments > 24 hours: -10 points each
  - PRs with no activity for 48+ hours: -15 points each

### Anomaly Detection

The system automatically detects:

- PRs open > 5 days without merge or close
- Tickets in "In Progress" > 5 days without updates
- Developers with 5+ assigned PRs (overloaded)
- Sprint velocity < 60% with < 3 days remaining
- More than 3 blockers active simultaneously

### Daily Summary Format

The daily summary includes:

- Overall Health Score (0-100)
- Sprint metrics (completed, in progress, at risk story points)
- PR summary (open, draft, merged, average age)
- Action items (critical issues, blockers)
- Top issues list

## 💡 Use Cases

- **Engineering Managers**: Get visibility into team productivity and sprint health
- **Tech Leads**: Identify bottlenecks and blockers early
- **Development Teams**: Stay informed about PR status and sprint progress
- **DevOps Teams**: Monitor CI/CD health and deployment readiness
- **Product Teams**: Track sprint velocity and completion rates

## 🎯 Example Output

```
🚀 Sprint Health Report - Day 5/10
📊 Overall Health: 78/100 🟡

✅ Completed: 23 story points
🔄 In Progress: 15 story points
⚠️ At Risk: 8 story points

🔴 ACTION NEEDED:
• 3 PRs pending review > 3 days
• 2 tickets blocked
• CI failing on PR #456
```

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

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs** by opening an issue
2. **Suggest features** via issue discussions
3. **Submit pull requests** for improvements
4. **Improve documentation** - every bit helps!

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yksanjo/sprint-sync-dashboard.git
cd sprint-sync-dashboard

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/)
- Uses [Slack Bolt](https://slack.dev/bolt-js/) for Slack integration
- Powered by [GitHub GraphQL API](https://docs.github.com/en/graphql)
- Inspired by the need for better sprint visibility

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

<div align="center">

**Made with ❤️ for development teams**

[Report Bug](https://github.com/yksanjo/sprint-sync-dashboard/issues) • [Request Feature](https://github.com/yksanjo/sprint-sync-dashboard/issues) • [Documentation](README.md)

</div>

