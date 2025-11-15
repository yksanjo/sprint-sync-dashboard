import type { PullRequest } from '../integrations/github.js';
import type { UnifiedSprintData } from './sprint-velocity.js';
import type { SprintVelocity } from './sprint-velocity.js';

/**
 * Anomaly severity level
 */
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Detected anomaly
 */
export interface Anomaly {
  id: string;
  severity: AnomalySeverity;
  type: string;
  title: string;
  description: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Detects anomalies in PRs, sprint data, and team workload
 */
export class AnomalyDetector {
  /**
   * Detects anomalies in pull requests
   */
  detectPRAnomalies(prs: PullRequest[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const openPRs = prs.filter((pr) => pr.status === 'open' || pr.status === 'draft');

    for (const pr of openPRs) {
      // PR open > 5 days without merge or close
      if (pr.ageInDays > 5 && !pr.isDraft) {
        anomalies.push({
          id: `pr-stale-${pr.number}`,
          severity: pr.ageInDays > 7 ? 'critical' : 'high',
          type: 'stale_pr',
          title: `PR #${pr.number} has been open for ${pr.ageInDays} days`,
          description: `Pull request "${pr.title}" has been open for ${pr.ageInDays} days without being merged or closed.`,
          url: pr.url,
          metadata: {
            prNumber: pr.number,
            ageInDays: pr.ageInDays,
            author: pr.author,
          },
        });
      }

      // Draft PR > 7 days
      if (pr.isDraft && pr.ageInDays > 7) {
        anomalies.push({
          id: `pr-draft-stale-${pr.number}`,
          severity: 'medium',
          type: 'stale_draft_pr',
          title: `Draft PR #${pr.number} has been open for ${pr.ageInDays} days`,
          description: `Draft pull request "${pr.title}" has been open for ${pr.ageInDays} days.`,
          url: pr.url,
          metadata: {
            prNumber: pr.number,
            ageInDays: pr.ageInDays,
            author: pr.author,
          },
        });
      }

      // PR with no activity for 48+ hours
      if (pr.hoursSinceLastActivity && pr.hoursSinceLastActivity >= 48 && !pr.isDraft) {
        anomalies.push({
          id: `pr-inactive-${pr.number}`,
          severity: pr.hoursSinceLastActivity >= 72 ? 'high' : 'medium',
          type: 'inactive_pr',
          title: `PR #${pr.number} has no activity for ${Math.floor(pr.hoursSinceLastActivity / 24)} days`,
          description: `Pull request "${pr.title}" has had no activity for ${Math.floor(pr.hoursSinceLastActivity / 24)} days.`,
          url: pr.url,
          metadata: {
            prNumber: pr.number,
            hoursSinceLastActivity: pr.hoursSinceLastActivity,
            author: pr.author,
          },
        });
      }

      // PR with unresolved review comments > 24 hours
      if (pr.hasUnresolvedComments && pr.hoursSinceLastActivity && pr.hoursSinceLastActivity > 24) {
        anomalies.push({
          id: `pr-unresolved-comments-${pr.number}`,
          severity: 'medium',
          type: 'unresolved_comments',
          title: `PR #${pr.number} has unresolved review comments`,
          description: `Pull request "${pr.title}" has unresolved review comments that are more than 24 hours old.`,
          url: pr.url,
          metadata: {
            prNumber: pr.number,
            hoursSinceLastActivity: pr.hoursSinceLastActivity,
            author: pr.author,
          },
        });
      }
    }

    // Developer with 5+ assigned PRs (overloaded)
    const prsByAuthor = new Map<string, PullRequest[]>();
    for (const pr of openPRs) {
      const author = pr.author;
      if (!prsByAuthor.has(author)) {
        prsByAuthor.set(author, []);
      }
      prsByAuthor.get(author)!.push(pr);
    }

    for (const [author, authorPRs] of prsByAuthor.entries()) {
      if (authorPRs.length >= 5) {
        anomalies.push({
          id: `developer-overloaded-${author}`,
          severity: 'high',
          type: 'developer_overload',
          title: `${author} has ${authorPRs.length} open PRs`,
          description: `Developer ${author} has ${authorPRs.length} open pull requests, which may indicate overload.`,
          metadata: {
            author,
            prCount: authorPRs.length,
            prs: authorPRs.map((pr) => ({ number: pr.number, url: pr.url })),
          },
        });
      }
    }

    return anomalies;
  }

  /**
   * Detects anomalies in sprint data
   */
  detectSprintAnomalies(
    sprintData: UnifiedSprintData,
    velocity: SprintVelocity
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Sprint velocity < 60% with < 3 days remaining
    if (velocity.daysRemaining < 3 && velocity.completionPercentage < 60) {
      anomalies.push({
        id: `sprint-velocity-low-${sprintData.sprintId}`,
        severity: 'critical',
        type: 'low_velocity',
        title: `Sprint "${sprintData.sprintName}" is behind schedule`,
        description: `Sprint is ${velocity.completionPercentage.toFixed(1)}% complete with only ${velocity.daysRemaining} days remaining.`,
        metadata: {
          sprintId: sprintData.sprintId,
          completionPercentage: velocity.completionPercentage,
          daysRemaining: velocity.daysRemaining,
        },
      });
    }

    // More than 3 blockers active simultaneously
    if (sprintData.blockedCount > 3) {
      anomalies.push({
        id: `sprint-blockers-${sprintData.sprintId}`,
        severity: sprintData.blockedCount > 5 ? 'critical' : 'high',
        type: 'multiple_blockers',
        title: `${sprintData.blockedCount} tickets are blocked`,
        description: `There are ${sprintData.blockedCount} blocked tickets in the sprint, which may indicate systemic issues.`,
        metadata: {
          sprintId: sprintData.sprintId,
          blockedCount: sprintData.blockedCount,
          blockedTickets: sprintData.tickets
            .filter((t) => t.isBlocked)
            .map((t) => ({
              key: 'key' in t ? t.key : t.identifier,
              title: 'summary' in t ? t.summary : t.title,
              url: t.url,
            })),
        },
      });
    }

    // Tickets in "In Progress" > 5 days without updates
    const now = new Date();
    for (const ticket of sprintData.tickets) {
      if (ticket.status === 'in-progress') {
        const daysSinceUpdate = Math.floor(
          (now.getTime() - ticket.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceUpdate > 5) {
          const ticketKey = 'key' in ticket ? ticket.key : ticket.identifier;
          anomalies.push({
            id: `ticket-stale-${ticket.id}`,
            severity: 'medium',
            type: 'stale_ticket',
            title: `Ticket ${ticketKey} has been in progress for ${daysSinceUpdate} days`,
            description: `Ticket "${'summary' in ticket ? ticket.summary : ticket.title}" has been in progress for ${daysSinceUpdate} days without updates.`,
            url: ticket.url,
            metadata: {
              ticketId: ticket.id,
              ticketKey,
              daysSinceUpdate,
              assignee: ticket.assignee,
            },
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Detects all anomalies across PRs and sprint data
   */
  detectAll(
    prs: PullRequest[],
    sprintData: UnifiedSprintData | null,
    velocity: SprintVelocity | null
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // PR anomalies
    anomalies.push(...this.detectPRAnomalies(prs));

    // Sprint anomalies (if sprint data is available)
    if (sprintData && velocity) {
      anomalies.push(...this.detectSprintAnomalies(sprintData, velocity));
    }

    // Sort by severity (critical first)
    const severityOrder: Record<AnomalySeverity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }
}

