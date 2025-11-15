import axios, { AxiosInstance } from 'axios';

/**
 * Jira ticket status
 */
export type TicketStatus = 'to-do' | 'in-progress' | 'blocked' | 'done' | 'other';

/**
 * Jira ticket data structure
 */
export interface JiraTicket {
  id: string;
  key: string;
  summary: string;
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
 * Sprint data from Jira
 */
export interface SprintData {
  sprintId: string;
  sprintName: string;
  startDate?: Date;
  endDate?: Date;
  tickets: JiraTicket[];
  completedPoints: number;
  inProgressPoints: number;
  totalPoints: number;
  blockedCount: number;
}

/**
 * Jira API client for fetching sprint and ticket data
 */
export class JiraClient {
  private client: AxiosInstance;
  private projectKey: string;

  constructor(url: string, email: string, apiToken: string, projectKey: string) {
    this.projectKey = projectKey;
    this.client = axios.create({
      baseURL: url,
      auth: {
        username: email,
        password: apiToken,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Maps Jira status to standard ticket status
   */
  private mapStatus(statusName: string): TicketStatus {
    const lower = statusName.toLowerCase();
    if (lower.includes('done') || lower.includes('complete') || lower.includes('closed')) {
      return 'done';
    }
    if (lower.includes('blocked') || lower.includes('impediment')) {
      return 'blocked';
    }
    if (lower.includes('progress') || lower.includes('in dev')) {
      return 'in-progress';
    }
    if (lower.includes('to do') || lower.includes('backlog') || lower.includes('open')) {
      return 'to-do';
    }
    return 'other';
  }

  /**
   * Fetches active sprint for the project
   */
  async fetchActiveSprint(): Promise<SprintData | null> {
    try {
      // First, get the board ID for the project
      const boardsResponse = await this.client.get(
        `/rest/agile/1.0/board?projectKeyOrId=${this.projectKey}`
      );

      if (!boardsResponse.data.values || boardsResponse.data.values.length === 0) {
        console.warn(`No boards found for project ${this.projectKey}`);
        return null;
      }

      const boardId = boardsResponse.data.values[0].id;

      // Get active sprint
      const sprintResponse = await this.client.get(
        `/rest/agile/1.0/board/${boardId}/sprint?state=active`
      );

      if (!sprintResponse.data.values || sprintResponse.data.values.length === 0) {
        console.warn(`No active sprint found for board ${boardId}`);
        return null;
      }

      const sprint = sprintResponse.data.values[0];

      // Get issues in the sprint
      const issuesResponse = await this.client.get(
        `/rest/agile/1.0/sprint/${sprint.id}/issue`
      );

      const tickets: JiraTicket[] = [];
      const now = new Date();

      for (const issue of issuesResponse.data.issues || []) {
        const fields = issue.fields;
        const statusName = fields.status.name;
        const status = this.mapStatus(statusName);
        const isBlocked = status === 'blocked' || statusName.toLowerCase().includes('blocked');

        // Extract story points (custom field, varies by Jira instance)
        let storyPoints: number | undefined;
        if (fields.customfield_10016) {
          // Common story points field ID
          storyPoints = fields.customfield_10016;
        } else if (fields['customfield_10020']) {
          // Another common field ID
          storyPoints = fields['customfield_10020'];
        }

        const createdAt = new Date(fields.created);
        const updatedAt = new Date(fields.updated);
        const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        const ticket: JiraTicket = {
          id: issue.id,
          key: issue.key,
          summary: fields.summary,
          status,
          statusName,
          assignee: fields.assignee?.displayName || fields.assignee?.name,
          createdAt,
          updatedAt,
          ageInDays,
          isBlocked,
          storyPoints,
          labels: fields.labels || [],
          url: `${this.client.defaults.baseURL}/browse/${issue.key}`,
        };

        tickets.push(ticket);
      }

      // Calculate sprint metrics
      const completedPoints = tickets
        .filter((t) => t.status === 'done')
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const inProgressPoints = tickets
        .filter((t) => t.status === 'in-progress')
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const totalPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const blockedCount = tickets.filter((t) => t.isBlocked).length;

      return {
        sprintId: sprint.id.toString(),
        sprintName: sprint.name,
        startDate: sprint.startDate ? new Date(sprint.startDate) : undefined,
        endDate: sprint.endDate ? new Date(sprint.endDate) : undefined,
        tickets,
        completedPoints,
        inProgressPoints,
        totalPoints,
        blockedCount,
      };
    } catch (error) {
      console.error('Error fetching Jira sprint data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
      }
      throw error;
    }
  }

  /**
   * Fetches all tickets for the project (fallback if sprint API fails)
   */
  async fetchProjectTickets(): Promise<JiraTicket[]> {
    try {
      const response = await this.client.get(
        `/rest/api/3/search?jql=project=${this.projectKey}&maxResults=100`
      );

      const tickets: JiraTicket[] = [];
      const now = new Date();

      for (const issue of response.data.issues || []) {
        const fields = issue.fields;
        const statusName = fields.status.name;
        const status = this.mapStatus(statusName);
        const isBlocked = status === 'blocked';

        const createdAt = new Date(fields.created);
        const updatedAt = new Date(fields.updated);
        const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        const ticket: JiraTicket = {
          id: issue.id,
          key: issue.key,
          summary: fields.summary,
          status,
          statusName,
          assignee: fields.assignee?.displayName || fields.assignee?.name,
          createdAt,
          updatedAt,
          ageInDays,
          isBlocked,
          storyPoints: fields.customfield_10016 || fields['customfield_10020'],
          labels: fields.labels || [],
          url: `${this.client.defaults.baseURL}/browse/${issue.key}`,
        };

        tickets.push(ticket);
      }

      return tickets;
    } catch (error) {
      console.error('Error fetching Jira tickets:', error);
      throw error;
    }
  }
}


