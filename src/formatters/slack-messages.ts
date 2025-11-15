import type { Block, KnownBlock } from '@slack/bolt';
import type { PRHealthScore } from '../metrics/pr-health.js';
import type { SprintVelocity } from '../metrics/sprint-velocity.js';
import type { Anomaly } from '../metrics/anomaly-detector.js';
import type { UnifiedSprintData } from '../metrics/sprint-velocity.js';
import { getPRSummary } from '../metrics/pr-health.js';

/**
 * Formats daily sprint health summary for Slack
 */
export function formatDailySummary(
  prHealth: PRHealthScore,
  sprintData: UnifiedSprintData | null,
  velocity: SprintVelocity | null,
  prSummary: ReturnType<typeof getPRSummary>,
  dayOfSprint: number,
  sprintLength: number
): Block[] {
  const blocks: Block[] = [];

  // Header
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: `🚀 Sprint Health Report - Day ${dayOfSprint}/${sprintLength}`,
      emoji: true,
    },
  } as KnownBlock);

  blocks.push({ type: 'divider' } as KnownBlock);

  // Overall Health Score
  const healthEmoji = prHealth.score >= 80 ? '🟢' : prHealth.score >= 60 ? '🟡' : '🔴';
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `📊 *Overall Health:* ${prHealth.score}/100 ${healthEmoji}`,
    },
  } as KnownBlock);

  // Sprint Metrics (if available)
  if (sprintData && velocity) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `✅ *Completed:* ${velocity.completedPoints} story points`,
        },
        {
          type: 'mrkdwn',
          text: `🔄 *In Progress:* ${velocity.inProgressPoints} story points`,
        },
        {
          type: 'mrkdwn',
          text: `⚠️ *At Risk:* ${velocity.totalPoints - velocity.completedPoints - velocity.inProgressPoints} story points`,
        },
        {
          type: 'mrkdwn',
          text: `📈 *Velocity:* ${velocity.completionPercentage.toFixed(1)}% complete`,
        },
      ],
    } as KnownBlock);
  }

  // PR Summary
  blocks.push({
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `📝 *Open PRs:* ${prSummary.open}`,
      },
      {
        type: 'mrkdwn',
        text: `📄 *Draft PRs:* ${prSummary.draft}`,
      },
      {
        type: 'mrkdwn',
        text: `✅ *Merged:* ${prSummary.merged}`,
      },
      {
        type: 'mrkdwn',
        text: `⏱️ *Avg Age:* ${prSummary.averageAge} days`,
      },
    ],
  } as KnownBlock);

  // Critical Issues
  const criticalIssues = prHealth.issues.filter((i) => i.severity === 'critical');
  const highIssues = prHealth.issues.filter((i) => i.severity === 'high');

  if (criticalIssues.length > 0 || highIssues.length > 0) {
    blocks.push({ type: 'divider' } as KnownBlock);
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🔴 *ACTION NEEDED:*',
      },
    } as KnownBlock);

    const actionItems: string[] = [];
    if (criticalIssues.length > 0) {
      actionItems.push(`• ${criticalIssues.length} critical PR issue${criticalIssues.length > 1 ? 's' : ''}`);
    }
    if (highIssues.length > 0) {
      actionItems.push(`• ${highIssues.length} high-priority PR issue${highIssues.length > 1 ? 's' : ''}`);
    }
    if (sprintData && sprintData.blockedCount > 0) {
      actionItems.push(`• ${sprintData.blockedCount} ticket${sprintData.blockedCount > 1 ? 's' : ''} blocked`);
    }

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: actionItems.join('\n'),
      },
    } as KnownBlock);
  }

  // Top Issues List
  const topIssues = prHealth.issues.slice(0, 5);
  if (topIssues.length > 0) {
    blocks.push({ type: 'divider' } as KnownBlock);
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Top Issues:*',
      },
    } as KnownBlock);

    const issuesList = topIssues
      .map((issue) => {
        const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡';
        return `${emoji} <${issue.prUrl}|PR #${issue.prNumber}>: ${issue.message}`;
      })
      .join('\n');

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: issuesList,
      },
    } as KnownBlock);
  }

  return blocks;
}

/**
 * Formats an anomaly alert for Slack
 */
export function formatAnomalyAlert(anomaly: Anomaly): Block[] {
  const blocks: Block[] = [];

  const severityEmoji: Record<Anomaly['severity'], string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵',
  };

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${severityEmoji[anomaly.severity]} *${anomaly.title}*\n\n${anomaly.description}`,
    },
  } as KnownBlock);

  if (anomaly.url) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Details',
          },
          url: anomaly.url,
          style: anomaly.severity === 'critical' ? 'danger' : undefined,
        },
      ],
    } as KnownBlock);
  }

  return blocks;
}

/**
 * Formats a list of blockers for Slack
 */
export function formatBlockers(sprintData: UnifiedSprintData): Block[] {
  const blocks: Block[] = [];
  const blockedTickets = sprintData.tickets.filter((t) => t.isBlocked);

  if (blockedTickets.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '✅ *No blockers found!*',
      },
    } as KnownBlock);
    return blocks;
  }

  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: `🚫 Blockers (${blockedTickets.length})`,
      emoji: true,
    },
  } as KnownBlock);

  for (const ticket of blockedTickets) {
    const ticketKey = 'key' in ticket ? ticket.key : ticket.identifier;
    const ticketTitle = 'summary' in ticket ? ticket.summary : ticket.title;

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `• <${ticket.url}|${ticketKey}>: ${ticketTitle}`,
      },
    } as KnownBlock);
  }

  return blocks;
}

/**
 * Formats a list of pending PRs for Slack
 */
export function formatPendingPRs(prs: Array<{ number: number; title: string; url: string; ageInDays: number }>): Block[] {
  const blocks: Block[] = [];

  if (prs.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '✅ *No pending PRs!*',
      },
    } as KnownBlock);
    return blocks;
  }

  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: `📝 Pending PRs (${prs.length})`,
      emoji: true,
    },
  } as KnownBlock);

  // Sort by age (oldest first)
  const sortedPRs = [...prs].sort((a, b) => b.ageInDays - a.ageInDays);

  for (const pr of sortedPRs.slice(0, 10)) {
    const ageText = pr.ageInDays > 5 ? `🔴 ${pr.ageInDays}d` : pr.ageInDays > 3 ? `🟠 ${pr.ageInDays}d` : `${pr.ageInDays}d`;
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${ageText} <${pr.url}|PR #${pr.number}>: ${pr.title}`,
      },
    } as KnownBlock);
  }

  if (prs.length > 10) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `_...and ${prs.length - 10} more_`,
      },
    } as KnownBlock);
  }

  return blocks;
}

/**
 * Formats sprint health check response
 */
export function formatHealthCheck(
  prHealth: PRHealthScore,
  velocity: SprintVelocity | null
): Block[] {
  const blocks: Block[] = [];

  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: '📊 Sprint Health Check',
      emoji: true,
    },
  } as KnownBlock);

  blocks.push({ type: 'divider' } as KnownBlock);

  const healthEmoji = prHealth.score >= 80 ? '🟢' : prHealth.score >= 60 ? '🟡' : '🔴';
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*PR Health Score:* ${prHealth.score}/100 ${healthEmoji}`,
    },
  } as KnownBlock);

  if (velocity) {
    const velocityEmoji = velocity.velocityScore >= 80 ? '🟢' : velocity.velocityScore >= 60 ? '🟡' : '🔴';
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Sprint Velocity:* ${velocity.velocityScore}/100 ${velocityEmoji}\n${velocity.completionPercentage.toFixed(1)}% complete (${velocity.daysRemaining} days remaining)`,
      },
    } as KnownBlock);
  }

  return blocks;
}

