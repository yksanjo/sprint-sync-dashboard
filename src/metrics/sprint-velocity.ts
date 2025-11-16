import { differenceInDays } from 'date-fns';
import type { SprintData } from '../integrations/jira.js';
import type { SprintData as LinearSprintData } from '../integrations/linear.js';

/**
 * Unified sprint data type (works with both Jira and Linear)
 */
export type UnifiedSprintData = SprintData | LinearSprintData;

/**
 * Sprint velocity metrics
 */
export interface SprintVelocity {
  completedPoints: number;
  inProgressPoints: number;
  totalPoints: number;
  plannedPoints: number; // Estimated at sprint start
  completionPercentage: number;
  daysRemaining: number;
  daysElapsed: number;
  expectedBurndownRate: number; // Points per day needed
  actualBurndownRate: number; // Points per day completed
  isOnTrack: boolean;
  velocityScore: number; // 0-100
  scopeCreep: number; // Points added mid-sprint
}

/**
 * Calculates sprint velocity metrics
 * @param sprintData Sprint data from Jira or Linear
 * @returns Velocity metrics
 */
export function calculateSprintVelocity(sprintData: UnifiedSprintData): SprintVelocity {
  const now = new Date();
  const startDate = sprintData.startDate || now;
  const endDate = sprintData.endDate;

  // Calculate days
  const daysElapsed = differenceInDays(now, startDate);
  const daysRemaining = endDate ? Math.max(0, differenceInDays(endDate, now)) : 0;
  const totalSprintDays = endDate ? differenceInDays(endDate, startDate) : 10; // Default to 10 if no end date

  // Calculate points
  const completedPoints = sprintData.completedPoints;
  const inProgressPoints = sprintData.inProgressPoints;
  const totalPoints = sprintData.totalPoints;
  
  // Estimate planned points (assume total points at start, or use completed + in-progress as baseline)
  // This is an approximation - ideally we'd track points at sprint start
  const plannedPoints = totalPoints; // Simplified: assume all current tickets were planned

  // Calculate completion percentage
  const completionPercentage =
    plannedPoints > 0 ? (completedPoints / plannedPoints) * 100 : 0;

  // Calculate burndown rates
  const expectedBurndownRate = daysRemaining > 0 ? (plannedPoints - completedPoints) / daysRemaining : 0;
  const actualBurndownRate = daysElapsed > 0 ? completedPoints / daysElapsed : 0;

  // Determine if on track
  // On track if: (completed / elapsed) >= (remaining / days remaining) OR if we're ahead
  const pointsRemaining = plannedPoints - completedPoints;
  const requiredRate = daysRemaining > 0 ? pointsRemaining / daysRemaining : 0;
  const isOnTrack = actualBurndownRate >= requiredRate || completedPoints >= plannedPoints;

  // Calculate velocity score (0-100)
  // Based on completion percentage and whether we're on track
  let velocityScore = completionPercentage;
  if (!isOnTrack && daysRemaining < totalSprintDays * 0.3) {
    // Penalize if we're behind and close to sprint end
    velocityScore = Math.max(0, velocityScore - 20);
  }
  if (sprintData.blockedCount > 0) {
    // Penalize for blockers
    velocityScore = Math.max(0, velocityScore - sprintData.blockedCount * 5);
  }

  // Scope creep: tickets added mid-sprint (simplified - would need historical data for accuracy)
  // For now, we'll estimate based on tickets created after sprint start
  const scopeCreep = sprintData.tickets
    .filter((t) => t.createdAt > startDate)
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return {
    completedPoints,
    inProgressPoints,
    totalPoints,
    plannedPoints,
    completionPercentage: Math.round(completionPercentage * 10) / 10,
    daysRemaining,
    daysElapsed,
    expectedBurndownRate: Math.round(expectedBurndownRate * 10) / 10,
    actualBurndownRate: Math.round(actualBurndownRate * 10) / 10,
    isOnTrack,
    velocityScore: Math.max(0, Math.min(100, Math.round(velocityScore))),
    scopeCreep,
  };
}




