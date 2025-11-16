import axios, { AxiosInstance } from 'axios';

/**
 * Linear ticket status
 */
export type TicketStatus = 'to-do' | 'in-progress' | 'blocked' | 'done' | 'other';

/**
 * Linear ticket data structure
 */
export interface LinearTicket {
  id: string;
  identifier: string;
  title: string;
  status: TicketStatus;
  statusName: string;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  ageInDays: number;
  isBlocked: boolean;
  storyPoints?: number;
  labels: string[];
  url: string;
}

/**
 * Sprint data from Linear
 */
export interface SprintData {
  sprintId: string;
  sprintName: string;
  startDate?: Date;
  endDate?: Date;
  tickets: LinearTicket[];
  completedPoints: number;
  inProgressPoints: number;
  totalPoints: number;
  blockedCount: number;
}

/**
 * Linear API client for fetching sprint and ticket data
 */
export class LinearClient {
  private client: AxiosInstance;
  private teamId: string;

  constructor(apiKey: string, teamId: string) {
    this.teamId = teamId;
    this.client = axios.create({
      baseURL: 'https://api.linear.app/graphql',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
    });
  }

  /**
   * Maps Linear status to standard ticket status
   */
  private mapStatus(statusName: string, statusType: string): TicketStatus {
    const lower = statusName.toLowerCase();
    const typeLower = statusType.toLowerCase();

    if (typeLower === 'completed' || typeLower === 'canceled' || lower.includes('done')) {
      return 'done';
    }
    if (lower.includes('blocked') || lower.includes('impediment')) {
      return 'blocked';
    }
    if (typeLower === 'started' || lower.includes('progress') || lower.includes('in dev')) {
      return 'in-progress';
    }
    if (typeLower === 'unstarted' || lower.includes('backlog') || lower.includes('todo')) {
      return 'to-do';
    }
    return 'other';
  }

  /**
   * Executes a GraphQL query against Linear API
   */
  private async graphqlQuery(query: string, variables?: Record<string, unknown>) {
    const response = await this.client.post('', {
      query,
      variables,
    });

    if (response.data.errors) {
      throw new Error(`Linear API error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data;
  }

  /**
   * Fetches active cycle (sprint) for the team
   */
  async fetchActiveCycle(): Promise<SprintData | null> {
    try {
      const query = `
        query GetActiveCycle($teamId: String!) {
          team(id: $teamId) {
            activeCycle {
              id
              name
              startsAt
              endsAt
            }
            issues(
              filter: { cycle: { isActive: { eq: true } } }
              first: 100
            ) {
              nodes {
                id
                identifier
                title
                state {
                  name
                  type
                }
                assignee {
                  name
                  displayName
                }
                createdAt
                updatedAt
                estimate
                labels {
                  nodes {
                    name
                  }
                }
                url
              }
            }
          }
        }
      `;

      const data = await this.graphqlQuery(query, { teamId: this.teamId });

      if (!data.team) {
        console.warn(`Team ${this.teamId} not found`);
        return null;
      }

      const cycle = data.team.activeCycle;
      if (!cycle) {
        console.warn(`No active cycle found for team ${this.teamId}`);
        return null;
      }

      const issues = data.team.issues.nodes || [];
      const tickets: LinearTicket[] = [];
      const now = new Date();

      for (const issue of issues) {
        const statusName = issue.state.name;
        const statusType = issue.state.type;
        const status = this.mapStatus(statusName, statusType);
        const isBlocked = status === 'blocked' || statusName.toLowerCase().includes('blocked');

        const createdAt = new Date(issue.createdAt);
        const updatedAt = new Date(issue.updatedAt);
        const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        const ticket: LinearTicket = {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          status,
          statusName,
          assignee: issue.assignee?.displayName || issue.assignee?.name,
          createdAt,
          updatedAt,
          ageInDays,
          isBlocked,
          storyPoints: issue.estimate,
          labels: issue.labels.nodes.map((l: { name: string }) => l.name),
          url: issue.url,
        };

        tickets.push(ticket);
      }

      // Calculate cycle metrics
      const completedPoints = tickets
        .filter((t) => t.status === 'done')
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const inProgressPoints = tickets
        .filter((t) => t.status === 'in-progress')
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const totalPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const blockedCount = tickets.filter((t) => t.isBlocked).length;

      return {
        sprintId: cycle.id,
        sprintName: cycle.name,
        startDate: cycle.startsAt ? new Date(cycle.startsAt) : undefined,
        endDate: cycle.endsAt ? new Date(cycle.endsAt) : undefined,
        tickets,
        completedPoints,
        inProgressPoints,
        totalPoints,
        blockedCount,
      };
    } catch (error) {
      console.error('Error fetching Linear cycle data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
      }
      throw error;
    }
  }
}




