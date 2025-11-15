import { loadConfig } from './config/index.js';
import { GitHubClient } from './integrations/github.js';
import { JiraClient } from './integrations/jira.js';
import { LinearClient } from './integrations/linear.js';
import { SlackClient } from './integrations/slack.js';
import { calculatePRHealthScore, getPRSummary } from './metrics/pr-health.js';
import { calculateSprintVelocity } from './metrics/sprint-velocity.js';
import { AnomalyDetector } from './metrics/anomaly-detector.js';
import { differenceInDays } from 'date-fns';
import type { UnifiedSprintData } from './metrics/sprint-velocity.js';

/**
 * Main application entry point
 */
async function main() {
  console.log('🚀 Starting Sprint Sync Dashboard...');

  try {
    // Load configuration
    const config = loadConfig();
    console.log(`✓ Configuration loaded (${config.github.repos.length} repos)`);

    // Initialize clients
    const githubClient = new GitHubClient(config.github.token);
    let jiraClient: JiraClient | null = null;
    let linearClient: LinearClient | null = null;

    if (config.jira) {
      jiraClient = new JiraClient(
        config.jira.url,
        config.jira.email,
        config.jira.apiToken,
        config.jira.projectKey
      );
      console.log('✓ Jira client initialized');
    }

    if (config.linear) {
      linearClient = new LinearClient(config.linear.apiKey, config.linear.teamId);
      console.log('✓ Linear client initialized');
    }

    const slackClient = new SlackClient(
      config.slack.botToken,
      config.slack.signingSecret,
      config.slack.channelId
    );
    console.log('✓ Slack client initialized');

    // Fetch GitHub PRs
    console.log('\n📊 Fetching GitHub pull requests...');
    const allPRsMap = await githubClient.fetchAllPullRequests(config.github.org, config.github.repos);
    const allPRs = Array.from(allPRsMap.values()).flat();
    console.log(`✓ Found ${allPRs.length} total PRs across all repositories`);

    // Calculate PR health
    console.log('\n📈 Calculating PR health metrics...');
    const prHealth = calculatePRHealthScore(allPRs);
    const prSummary = getPRSummary(allPRs);
    console.log(`✓ PR Health Score: ${prHealth.score}/100`);

    // Fetch sprint data (Jira or Linear)
    let sprintData: UnifiedSprintData | null = null;
    let velocity = null;

    if (jiraClient) {
      console.log('\n📋 Fetching Jira sprint data...');
      try {
        sprintData = await jiraClient.fetchActiveSprint();
        if (sprintData) {
          console.log(`✓ Found sprint: ${sprintData.sprintName}`);
          velocity = calculateSprintVelocity(sprintData);
          console.log(`✓ Sprint velocity: ${velocity.completionPercentage.toFixed(1)}% complete`);
        } else {
          console.log('⚠ No active sprint found in Jira');
        }
      } catch (error) {
        console.error('Error fetching Jira data:', error);
      }
    } else if (linearClient) {
      console.log('\n📋 Fetching Linear cycle data...');
      try {
        sprintData = await linearClient.fetchActiveCycle();
        if (sprintData) {
          console.log(`✓ Found cycle: ${sprintData.sprintName}`);
          velocity = calculateSprintVelocity(sprintData);
          console.log(`✓ Cycle velocity: ${velocity.completionPercentage.toFixed(1)}% complete`);
        } else {
          console.log('⚠ No active cycle found in Linear');
        }
      } catch (error) {
        console.error('Error fetching Linear data:', error);
      }
    }

    // Calculate day of sprint
    let dayOfSprint = 1;
    if (sprintData?.startDate) {
      const now = new Date();
      dayOfSprint = Math.max(1, differenceInDays(now, sprintData.startDate) + 1);
    }

    // Detect anomalies
    console.log('\n🔍 Detecting anomalies...');
    const anomalyDetector = new AnomalyDetector();
    const anomalies = anomalyDetector.detectAll(allPRs, sprintData, velocity);
    console.log(`✓ Found ${anomalies.length} anomalies`);

    // Post daily summary to Slack
    console.log('\n📤 Posting daily summary to Slack...');
    await slackClient.postDailySummary(
      prHealth,
      sprintData,
      velocity,
      prSummary,
      dayOfSprint,
      config.app.sprintLengthDays
    );

    // Post real-time alerts for critical anomalies
    if (anomalies.length > 0) {
      console.log('\n🚨 Posting anomaly alerts...');
      await slackClient.postRealTimeAlerts(anomalies);
    }

    console.log('\n✅ Sprint sync completed successfully!');
    console.log(`\nSummary:`);
    console.log(`  - PR Health: ${prHealth.score}/100`);
    console.log(`  - Open PRs: ${prSummary.open}`);
    console.log(`  - Anomalies: ${anomalies.length}`);
    if (velocity) {
      console.log(`  - Sprint Progress: ${velocity.completionPercentage.toFixed(1)}%`);
    }
  } catch (error) {
    console.error('❌ Error in sprint sync:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('index.js')) {
  main();
}

export { main };

