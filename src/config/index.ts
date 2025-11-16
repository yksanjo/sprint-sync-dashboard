import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration loaded from environment variables
 */
export interface Config {
  github: {
    token: string;
    org: string;
    repos: string[];
  };
  jira?: {
    url: string;
    email: string;
    apiToken: string;
    projectKey: string;
  };
  linear?: {
    apiKey: string;
    teamId: string;
  };
  slack: {
    botToken: string;
    signingSecret: string;
    channelId: string;
  };
  app: {
    timezone: string;
    sprintLengthDays: number;
    alertThresholdDays: number;
  };
}

/**
 * Validates and loads configuration from environment variables
 * @throws Error if required configuration is missing
 */
export function loadConfig(): Config {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubOrg = process.env.GITHUB_ORG;
  const githubRepos = process.env.GITHUB_REPOS;

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is required');
  }
  if (!githubOrg) {
    throw new Error('GITHUB_ORG is required');
  }
  if (!githubRepos) {
    throw new Error('GITHUB_REPOS is required');
  }

  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
  const slackChannelId = process.env.SLACK_CHANNEL_ID;

  if (!slackBotToken) {
    throw new Error('SLACK_BOT_TOKEN is required');
  }
  if (!slackSigningSecret) {
    throw new Error('SLACK_SIGNING_SECRET is required');
  }
  if (!slackChannelId) {
    throw new Error('SLACK_CHANNEL_ID is required');
  }

  const config: Config = {
    github: {
      token: githubToken,
      org: githubOrg,
      repos: githubRepos.split(',').map((r) => r.trim()),
    },
    slack: {
      botToken: slackBotToken,
      signingSecret: slackSigningSecret,
      channelId: slackChannelId,
    },
    app: {
      timezone: process.env.TIMEZONE || 'America/New_York',
      sprintLengthDays: parseInt(process.env.SPRINT_LENGTH_DAYS || '10', 10),
      alertThresholdDays: parseInt(process.env.ALERT_THRESHOLD_DAYS || '3', 10),
    },
  };

  // Jira configuration (optional)
  const jiraUrl = process.env.JIRA_URL;
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraApiToken = process.env.JIRA_API_TOKEN;
  const jiraProjectKey = process.env.JIRA_PROJECT_KEY;

  if (jiraUrl && jiraEmail && jiraApiToken && jiraProjectKey) {
    config.jira = {
      url: jiraUrl,
      email: jiraEmail,
      apiToken: jiraApiToken,
      projectKey: jiraProjectKey,
    };
  }

  // Linear configuration (optional)
  const linearApiKey = process.env.LINEAR_API_KEY;
  const linearTeamId = process.env.LINEAR_TEAM_ID;

  if (linearApiKey && linearTeamId) {
    config.linear = {
      apiKey: linearApiKey,
      teamId: linearTeamId,
    };
  }

  // Validate that at least one project management tool is configured
  if (!config.jira && !config.linear) {
    console.warn('Warning: Neither Jira nor Linear is configured. Sprint metrics will be limited.');
  }

  return config;
}




