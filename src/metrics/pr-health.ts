import type { PullRequest } from '../integrations/github.js';

/**
 * PR Health Score calculation result
 */
export interface PRHealthScore {
  score: number; // 0-100
  breakdown: {
    baseScore: number;
    deductions: Array<{
      reason: string;
      points: number;
    }>;
  };
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    prNumber: number;
    prUrl: string;
  }>;
}

/**
 * Calculates PR health score for a collection of pull requests
 * Scoring rules:
 * - Base score: 100
 * - Pending PRs > 3 days old: -10 points each
 * - PRs without reviewers: -15 points each
 * - Failed CI/CD checks: -20 points each
 * - Draft PRs > 7 days: -5 points each
 * - PRs with unresolved comments > 24 hours: -10 points each
 * - PRs with no activity for 48+ hours: -15 points each
 *
 * @param prs Array of pull requests
 * @returns PR health score and breakdown
 */
export function calculatePRHealthScore(prs: PullRequest[]): PRHealthScore {
  let baseScore = 100;
  const deductions: Array<{ reason: string; points: number }> = [];
  const issues: PRHealthScore['issues'] = [];

  // Filter to only open PRs (including drafts)
  const openPRs = prs.filter((pr) => pr.status === 'open' || pr.status === 'draft');

  for (const pr of openPRs) {
    // Check for pending PRs > 3 days old
    if (pr.ageInDays > 3 && !pr.isDraft) {
      const points = -10;
      baseScore += points;
      deductions.push({
        reason: `PR #${pr.number} is ${pr.ageInDays} days old`,
        points,
      });
      issues.push({
        severity: pr.ageInDays > 5 ? 'critical' : pr.ageInDays > 4 ? 'high' : 'medium',
        message: `PR #${pr.number} has been open for ${pr.ageInDays} days`,
        prNumber: pr.number,
        prUrl: pr.url,
      });
    }

    // Check for PRs without reviewers (no reviews at all)
    if (pr.reviewCount === 0 && !pr.isDraft) {
      const points = -15;
      baseScore += points;
      deductions.push({
        reason: `PR #${pr.number} has no reviewers`,
        points,
      });
      issues.push({
        severity: 'high',
        message: `PR #${pr.number} has no reviews`,
        prNumber: pr.number,
        prUrl: pr.url,
      });
    }

    // Check for failed CI/CD checks
    if (pr.ciStatus === 'failure' || pr.ciStatus === 'error') {
      const points = -20;
      baseScore += points;
      deductions.push({
        reason: `PR #${pr.number} has failed CI/CD checks`,
        points,
      });
      issues.push({
        severity: 'critical',
        message: `PR #${pr.number} has failed CI/CD checks`,
        prNumber: pr.number,
        prUrl: pr.url,
      });
    }

    // Check for draft PRs > 7 days
    if (pr.isDraft && pr.ageInDays > 7) {
      const points = -5;
      baseScore += points;
      deductions.push({
        reason: `Draft PR #${pr.number} is ${pr.ageInDays} days old`,
        points,
      });
      issues.push({
        severity: 'low',
        message: `Draft PR #${pr.number} has been open for ${pr.ageInDays} days`,
        prNumber: pr.number,
        prUrl: pr.url,
      });
    }

    // Check for unresolved comments > 24 hours
    if (pr.hasUnresolvedComments && pr.hoursSinceLastActivity && pr.hoursSinceLastActivity > 24) {
      const points = -10;
      baseScore += points;
      deductions.push({
        reason: `PR #${pr.number} has unresolved comments for ${Math.floor(pr.hoursSinceLastActivity / 24)} days`,
        points,
      });
      issues.push({
        severity: 'medium',
        message: `PR #${pr.number} has unresolved review comments`,
        prNumber: pr.number,
        prUrl: pr.url,
      });
    }

    // Check for no activity for 48+ hours
    if (pr.hoursSinceLastActivity && pr.hoursSinceLastActivity >= 48 && !pr.isDraft) {
      const points = -15;
      baseScore += points;
      deductions.push({
        reason: `PR #${pr.number} has no activity for ${Math.floor(pr.hoursSinceLastActivity / 24)} days`,
        points,
      });
      issues.push({
        severity: pr.hoursSinceLastActivity >= 72 ? 'high' : 'medium',
        message: `PR #${pr.number} has been inactive for ${Math.floor(pr.hoursSinceLastActivity / 24)} days`,
        prNumber: pr.number,
        prUrl: pr.url,
      });
    }
  }

  // Ensure score is between 0 and 100
  const finalScore = Math.max(0, Math.min(100, baseScore));

  return {
    score: finalScore,
    breakdown: {
      baseScore: 100,
      deductions,
    },
    issues,
  };
}

/**
 * Gets summary statistics for pull requests
 */
export function getPRSummary(prs: PullRequest[]): {
  total: number;
  open: number;
  draft: number;
  merged: number;
  closed: number;
  byStatus: Record<string, number>;
  averageAge: number;
  oldestPR?: PullRequest;
  stuckPRs: PullRequest[]; // PRs > 5 days old
} {
  const open = prs.filter((pr) => pr.status === 'open').length;
  const draft = prs.filter((pr) => pr.status === 'draft').length;
  const merged = prs.filter((pr) => pr.status === 'merged').length;
  const closed = prs.filter((pr) => pr.status === 'closed').length;

  const openPRs = prs.filter((pr) => pr.status === 'open' || pr.status === 'draft');
  const averageAge =
    openPRs.length > 0
      ? openPRs.reduce((sum, pr) => sum + pr.ageInDays, 0) / openPRs.length
      : 0;

  const oldestPR = openPRs.sort((a, b) => b.ageInDays - a.ageInDays)[0];
  const stuckPRs = openPRs.filter((pr) => pr.ageInDays > 5);

  return {
    total: prs.length,
    open,
    draft,
    merged,
    closed,
    byStatus: {
      open,
      draft,
      merged,
      closed,
    },
    averageAge: Math.round(averageAge * 10) / 10,
    oldestPR,
    stuckPRs,
  };
}


