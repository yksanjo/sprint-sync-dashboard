import { App } from '@slack/bolt';
import type { PRHealthScore } from '../metrics/pr-health.js';
import type { SprintVelocity } from '../metrics/sprint-velocity.js';
import type { Anomaly } from '../metrics/anomaly-detector.js';
import type { UnifiedSprintData } from '../metrics/sprint-velocity.js';
import { getPRSummary } from '../metrics/pr-health.js';
import {
  formatDailySummary,
  formatAnomalyAlert,
  formatBlockers,
  formatPendingPRs,
  formatHealthCheck,
} from '../formatters/slack-messages.js';

/**
 * Slack integration client
 */
export class SlackClient {
  private app: App;
  private channelId: string;

  constructor(botToken: string, signingSecret: string, channelId: string) {
    this.channelId = channelId;
    this.app = new App({
      token: botToken,
      signingSecret: signingSecret,
    });

    this.setupCommands();
  }

  /**
   * Sets up Slack slash commands
   * Note: Commands need to be registered in Slack app settings
   */
  private setupCommands(): void {
    // /sprint-health command
    this.app.command('/sprint-health', async ({ ack, respond }) => {
      await ack();
      // This will be handled by the main application
      // For now, just acknowledge
      await respond({
        text: 'Fetching sprint health data... This feature requires additional setup.',
        response_type: 'ephemeral',
      });
    });

    // /sprint-blockers command
    this.app.command('/sprint-blockers', async ({ ack, respond }) => {
      await ack();
      await respond({
        text: 'Fetching blockers... This feature requires additional setup.',
        response_type: 'ephemeral',
      });
    });

    // /sprint-prs command
    this.app.command('/sprint-prs', async ({ ack, respond }) => {
      await ack();
      await respond({
        text: 'Fetching pending PRs... This feature requires additional setup.',
        response_type: 'ephemeral',
      });
    });
  }

  /**
   * Posts daily summary to Slack
   */
  async postDailySummary(
    prHealth: PRHealthScore,
    sprintData: UnifiedSprintData | null,
    velocity: SprintVelocity | null,
    prSummary: ReturnType<typeof getPRSummary>,
    dayOfSprint: number,
    sprintLength: number
  ): Promise<void> {
    try {
      const blocks = formatDailySummary(
        prHealth,
        sprintData,
        velocity,
        prSummary,
        dayOfSprint,
        sprintLength
      );

      await this.app.client.chat.postMessage({
        channel: this.channelId,
        blocks,
        text: `Sprint Health Report - Day ${dayOfSprint}/${sprintLength}`,
      });

      console.log('Daily summary posted to Slack');
    } catch (error) {
      console.error('Error posting daily summary to Slack:', error);
      throw error;
    }
  }

  /**
   * Posts an anomaly alert to Slack
   */
  async postAnomalyAlert(anomaly: Anomaly): Promise<void> {
    try {
      const blocks = formatAnomalyAlert(anomaly);

      await this.app.client.chat.postMessage({
        channel: this.channelId,
        blocks,
        text: `Alert: ${anomaly.title}`,
      });

      console.log(`Anomaly alert posted: ${anomaly.id}`);
    } catch (error) {
      console.error('Error posting anomaly alert to Slack:', error);
      throw error;
    }
  }

  /**
   * Posts real-time alerts for critical issues
   */
  async postRealTimeAlerts(anomalies: Anomaly[]): Promise<void> {
    // Only post critical and high severity anomalies as real-time alerts
    const criticalAnomalies = anomalies.filter(
      (a) => a.severity === 'critical' || a.severity === 'high'
    );

    for (const anomaly of criticalAnomalies) {
      await this.postAnomalyAlert(anomaly);
      // Small delay between alerts to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  /**
   * Responds to /sprint-health command
   */
  async respondToHealthCheck(
    responseUrl: string,
    prHealth: PRHealthScore,
    velocity: SprintVelocity | null
  ): Promise<void> {
    try {
      const blocks = formatHealthCheck(prHealth, velocity);

      await this.app.client.chat.update({
        channel: this.channelId,
        ts: responseUrl, // This would need to be the timestamp from the command
        blocks,
        text: 'Sprint Health Check',
      });
    } catch (error) {
      console.error('Error responding to health check:', error);
      throw error;
    }
  }

  /**
   * Responds to /sprint-blockers command
   */
  async respondToBlockers(sprintData: UnifiedSprintData | null): Promise<string> {
    if (!sprintData) {
      return 'No sprint data available.';
    }

    const blocks = formatBlockers(sprintData);
    // This would be called from the command handler
    // For now, return formatted text
    return JSON.stringify(blocks, null, 2);
  }

  /**
   * Responds to /sprint-prs command
   */
  async respondToPRs(prs: Array<{ number: number; title: string; url: string; ageInDays: number }>): Promise<string> {
    const blocks = formatPendingPRs(prs);
    return JSON.stringify(blocks, null, 2);
  }

  /**
   * Starts the Slack app (for interactive features)
   */
  async start(port: number = 3000): Promise<void> {
    await this.app.start(port);
    console.log(`⚡️ Slack app is running on port ${port}`);
  }

  /**
   * Stops the Slack app
   */
  async stop(): Promise<void> {
    await this.app.stop();
  }
}

