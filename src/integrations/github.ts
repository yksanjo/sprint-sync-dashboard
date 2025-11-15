import { graphql } from '@octokit/graphql';
import { differenceInDays, differenceInHours } from 'date-fns';

/**
 * GitHub Pull Request status
 */
export type PRStatus = 'open' | 'draft' | 'merged' | 'closed';

/**
 * CI/CD check status
 */
export type CheckStatus = 'pending' | 'success' | 'failure' | 'error';

/**
 * Review state
 */
export type ReviewState = 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';

/**
 * Pull Request data structure
 */
export interface PullRequest {
  id: string;
  number: number;
  title: string;
  url: string;
  author: string;
  status: PRStatus;
  createdAt: Date;
  updatedAt: Date;
  ageInDays: number;
  isDraft: boolean;
  reviewCount: number;
  approvalCount: number;
  commentCount: number;
  hasUnresolvedComments: boolean;
  lastReviewActivity?: Date;
  hoursSinceLastActivity?: number;
  ciStatus: CheckStatus;
  labels: string[];
  baseRef: string;
  headRef: string;
}

/**
 * GitHub API client for fetching PR data
 */
export class GitHubClient {
  private graphql: typeof graphql;

  constructor(token: string) {
    this.graphql = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  /**
   * Fetches all pull requests for a repository
   * @param owner Repository owner (org or user)
   * @param repo Repository name
   * @returns Array of pull requests
   */
  async fetchPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
    const prs: PullRequest[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const query = `
        query GetPullRequests($owner: String!, $repo: String!, $cursor: String) {
          repository(owner: $owner, name: $repo) {
            pullRequests(
              first: 100
              after: $cursor
              states: [OPEN, CLOSED, MERGED]
              orderBy: { field: UPDATED_AT, direction: DESC }
            ) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                number
                title
                url
                state
                isDraft
                createdAt
                updatedAt
                baseRefName
                headRefName
                author {
                  login
                }
                labels(first: 10) {
                  nodes {
                    name
                  }
                }
                reviews(first: 50) {
                  nodes {
                    state
                    submittedAt
                    author {
                      login
                    }
                  }
                }
                comments(first: 50) {
                  nodes {
                    createdAt
                    author {
                      login
                    }
                  }
                }
                reviewThreads(first: 20) {
                  nodes {
                    isResolved
                    comments(first: 5) {
                      nodes {
                        createdAt
                      }
                    }
                  }
                }
                commits(last: 1) {
                  nodes {
                    commit {
                      statusCheckRollup {
                        state
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        type GraphQLResponse = {
          repository: {
            pullRequests: {
              pageInfo: {
                hasNextPage: boolean;
                endCursor: string;
              };
              nodes: Array<{
                id: string;
                number: number;
                title: string;
                url: string;
                state: string;
                isDraft: boolean;
                createdAt: string;
                updatedAt: string;
                baseRefName: string;
                headRefName: string;
                author: { login: string } | null;
                labels: { nodes: Array<{ name: string }> };
                reviews: {
                  nodes: Array<{
                    state: string;
                    submittedAt: string | null;
                    author: { login: string } | null;
                  }>;
                };
                comments: {
                  nodes: Array<{
                    createdAt: string;
                    author: { login: string } | null;
                  }>;
                };
                reviewThreads: {
                  nodes: Array<{
                    isResolved: boolean;
                    comments: {
                      nodes: Array<{
                        createdAt: string;
                      }>;
                    };
                  }>;
                };
                commits: {
                  nodes: Array<{
                    commit: {
                      statusCheckRollup: {
                        state: string | null;
                      } | null;
                    };
                  }>;
                };
              }>;
            };
          };
        };

        const response: GraphQLResponse = await this.graphql(query, {
          owner,
          repo,
          cursor,
        });

        const repository = response.repository;
        if (!repository) {
          console.warn(`Repository ${owner}/${repo} not found or not accessible`);
          break;
        }

        const pullRequests = repository.pullRequests;
        hasNextPage = pullRequests.pageInfo.hasNextPage;
        cursor = pullRequests.pageInfo.endCursor;

        for (const pr of pullRequests.nodes) {
          const createdAt = new Date(pr.createdAt);
          const updatedAt = new Date(pr.updatedAt);
          const now = new Date();
          const ageInDays = differenceInDays(now, createdAt);

          // Determine PR status
          let status: PRStatus = 'open';
          if (pr.state === 'MERGED') {
            status = 'merged';
          } else if (pr.state === 'CLOSED') {
            status = 'closed';
          } else if (pr.isDraft) {
            status = 'draft';
          }

          // Process reviews
          const reviews = pr.reviews.nodes.filter((r) => r.submittedAt !== null);
          const approvalCount = reviews.filter((r) => r.state === 'APPROVED').length;
          const reviewCount = reviews.length;
          const lastReview = reviews
            .map((r) => new Date(r.submittedAt!))
            .sort((a, b) => b.getTime() - a.getTime())[0];

          // Check for unresolved review comments
          const unresolvedThreads = pr.reviewThreads.nodes.filter((t) => !t.isResolved);
          const hasUnresolvedComments = unresolvedThreads.length > 0;

          // Get most recent comment from unresolved threads
          let lastUnresolvedCommentDate: Date | undefined;
          if (hasUnresolvedComments) {
            const allUnresolvedComments = unresolvedThreads.flatMap((t) =>
              t.comments.nodes.map((c) => new Date(c.createdAt))
            );
            lastUnresolvedCommentDate = allUnresolvedComments.sort(
              (a, b) => b.getTime() - a.getTime()
            )[0];
          }

          // Determine hours since last activity
          const activityDates = [
            updatedAt,
            lastReview,
            lastUnresolvedCommentDate,
          ].filter((d): d is Date => d !== undefined);
          const lastActivity = activityDates.sort((a, b) => b.getTime() - a.getTime())[0];
          const hoursSinceLastActivity = lastActivity
            ? differenceInHours(now, lastActivity)
            : undefined;

          // Determine CI/CD status
          let ciStatus: CheckStatus = 'pending';
          const statusCheckRollup = pr.commits.nodes[0]?.commit?.statusCheckRollup?.state;
          if (statusCheckRollup) {
            switch (statusCheckRollup) {
              case 'SUCCESS':
                ciStatus = 'success';
                break;
              case 'FAILURE':
                ciStatus = 'failure';
                break;
              case 'ERROR':
                ciStatus = 'error';
                break;
              default:
                ciStatus = 'pending';
            }
          }

          const pullRequest: PullRequest = {
            id: pr.id,
            number: pr.number,
            title: pr.title,
            url: pr.url,
            author: pr.author?.login || 'unknown',
            status,
            createdAt,
            updatedAt,
            ageInDays,
            isDraft: pr.isDraft,
            reviewCount,
            approvalCount,
            commentCount: pr.comments.nodes.length,
            hasUnresolvedComments,
            lastReviewActivity: lastReview,
            hoursSinceLastActivity,
            ciStatus,
            labels: pr.labels.nodes.map((l) => l.name),
            baseRef: pr.baseRefName,
            headRef: pr.headRefName,
          };

          prs.push(pullRequest);
        }
      } catch (error) {
        console.error(`Error fetching PRs for ${owner}/${repo}:`, error);
        throw error;
      }
    }

    return prs;
  }

  /**
   * Fetches pull requests for multiple repositories
   * @param owner Repository owner (org or user)
   * @param repos Array of repository names
   * @returns Map of repository names to their pull requests
   */
  async fetchAllPullRequests(
    owner: string,
    repos: string[]
  ): Promise<Map<string, PullRequest[]>> {
    const allPRs = new Map<string, PullRequest[]>();

    // Fetch PRs for each repository sequentially to avoid rate limits
    for (const repo of repos) {
      try {
        console.log(`Fetching PRs for ${owner}/${repo}...`);
        const prs = await this.fetchPullRequests(owner, repo);
        allPRs.set(repo, prs);
        console.log(`Found ${prs.length} PRs in ${owner}/${repo}`);

        // Small delay to avoid hitting rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to fetch PRs for ${owner}/${repo}:`, error);
        // Continue with other repos even if one fails
        allPRs.set(repo, []);
      }
    }

    return allPRs;
  }
}

