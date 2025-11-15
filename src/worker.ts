/**
 * Worker process that runs sprint sync for all active configurations
 * This runs on a schedule (via cron or Railway cron jobs)
 */
import { loadConfig } from './config/index.js';
import { GitHubClient } from './integrations/github.js';
import { JiraClient } from './integrations/jira.js';
import { LinearClient } from './integrations/linear.js';
import { SlackClient } from './integrations/slack.js';
import { calculatePRHealthScore, getPRSummary } from './metrics/pr-health.js';
import { calculateSprintVelocity } from './metrics/sprint-velocity.js';
import { AnomalyDetector } from './metrics/anomaly-detector.js';
import { differenceInDays } from 'date-fns';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import type { UnifiedSprintData } from './metrics/sprint-velocity.js';

/**
 * Process a single user configuration
 */
async function processConfig(configId: string): Promise<void> {
  console.log(`\n🔄 Processing config ${configId}...`);

  try {
    const config = await prisma.config.findUnique({
      where: { id: configId },
      include: { user: true },
    });

    if (!config || !config.isActive) {
      console.log(`⏭️  Config ${configId} is inactive, skipping`);
      return;
    }

    // Initialize clients
    const githubClient = new GitHubClient(config.githubToken);
    let jiraClient: JiraClient | null = null;
    let linearClient: LinearClient | null = null;

    if (config.jiraUrl && config.jiraEmail && config.jiraApiToken && config.jiraProjectKey) {
      jiraClient = new JiraClient(
        config.jiraUrl,
        config.jiraEmail,
        config.jiraApiToken,
        config.jiraProjectKey
      );
    }

    if (config.linearApiKey && config.linearTeamId) {
      linearClient = new LinearClient(config.linearApiKey, config.linearTeamId);
    }

    const slackClient = new SlackClient(
      config.slackBotToken,
      config.slackSigningSecret,
      config.slackChannelId
    );

    // Fetch GitHub PRs
    const repos = config.githubRepos.split(',').map((r) => r.trim());
    const allPRsMap = await githubClient.fetchAllPullRequests(config.githubOrg, repos);
    const allPRs = Array.from(allPRsMap.values()).flat();

    // Calculate PR health
    const prHealth = calculatePRHealthScore(allPRs);
    const prSummary = getPRSummary(allPRs);

    // Fetch sprint data
    let sprintData: UnifiedSprintData | null = null;
    let velocity = null;

    if (jiraClient) {
      sprintData = await jiraClient.fetchActiveSprint();
      if (sprintData) {
        velocity = calculateSprintVelocity(sprintData);
      }
    } else if (linearClient) {
      sprintData = await linearClient.fetchActiveCycle();
      if (sprintData) {
        velocity = calculateSprintVelocity(sprintData);
      }
    }

    // Calculate day of sprint
    let dayOfSprint = 1;
    if (sprintData?.startDate) {
      const now = new Date();
      dayOfSprint = Math.max(1, differenceInDays(now, sprintData.startDate) + 1);
    }

    // Detect anomalies
    const anomalyDetector = new AnomalyDetector();
    const anomalies = anomalyDetector.detectAll(allPRs, sprintData, velocity);

    // Post daily summary to Slack
    await slackClient.postDailySummary(
      prHealth,
      sprintData,
      velocity,
      prSummary,
      dayOfSprint,
      config.sprintLengthDays
    );

    // Post real-time alerts
    if (anomalies.length > 0) {
      await slackClient.postRealTimeAlerts(anomalies);
    }

    // Update config with last run time
    await prisma.config.update({
      where: { id: configId },
      data: {
        lastRunAt: new Date(),
        nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    console.log(`✅ Config ${configId} processed successfully`);
  } catch (error) {
    console.error(`❌ Error processing config ${configId}:`, error);
    // Don't throw - continue with other configs
  }
}

/**
 * Main worker function - processes all active configurations
 */
async function runWorker(): Promise<void> {
  console.log('🚀 Starting Sprint Sync Worker...');
  console.log(`⏰ ${new Date().toISOString()}`);

  try {
    // Get all active configurations
    const configs = await prisma.config.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    console.log(`📋 Found ${configs.length} active configuration(s)`);

    // Process each config
    for (const config of configs) {
      await processConfig(config.id);
      // Small delay between configs to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('\n✅ Worker completed successfully');
  } catch (error) {
    console.error('❌ Worker error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('worker')) {
  runWorker();
}

export { runWorker };

