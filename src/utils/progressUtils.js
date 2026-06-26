/**
 * Progress calculation utilities for Control de Actividades Contables.
 */

import { SEDES, AREAS, TOTAL_SEDES } from '../data/activitiesData';
import { getCompletionStatus } from './dateUtils';

/**
 * Calculate the progress percentage for a single activity based on sede completions.
 *
 * @param {object} sedesStatus - { [sede]: { completed: boolean, completedAt, ... } }
 * @returns {{ completed: number, total: number, percentage: number }}
 */
export function calculateActivityProgress(sedesStatus) {
  if (!sedesStatus || typeof sedesStatus !== 'object') {
    return { completed: 0, total: TOTAL_SEDES, percentage: 0 };
  }

  let completed = 0;
  for (const sede of SEDES) {
    if (sedesStatus[sede]?.completed) {
      completed++;
    }
  }

  const percentage = Math.round((completed / TOTAL_SEDES) * 100);
  return { completed, total: TOTAL_SEDES, percentage };
}

/**
 * Calculate overall progress for an area (average of all its activity percentages).
 *
 * @param {object} activitiesData - { [activityId]: { deadline, sedes: { [sede]: { completed, ... } } } }
 * @param {string} areaId - e.g. 'ventas'
 * @returns {{ percentage: number, activitiesProgress: object }}
 */
export function calculateAreaProgress(activitiesData, areaId) {
  const area = AREAS[areaId];
  if (!area || !activitiesData) {
    return { percentage: 0, activitiesProgress: {} };
  }

  const activitiesProgress = {};
  let totalPercentage = 0;
  let activityCount = 0;

  for (const activity of area.activities) {
    const actData = activitiesData[activity.id];
    const progress = calculateActivityProgress(actData?.sedes);
    activitiesProgress[activity.id] = progress;
    totalPercentage += progress.percentage;
    activityCount++;
  }

  const percentage = activityCount > 0
    ? Math.round(totalPercentage / activityCount)
    : 0;

  return { percentage, activitiesProgress };
}

/**
 * Calculate overall progress across all 3 areas.
 *
 * @param {object} areasData - { [areaId]: { [activityId]: { deadline, sedes } } }
 * @returns {{ percentage: number, areasProgress: object }}
 */
export function getOverallProgress(areasData) {
  if (!areasData) {
    return { percentage: 0, areasProgress: {} };
  }

  const areasProgress = {};
  let totalPercentage = 0;
  let areaCount = 0;

  for (const areaId of Object.keys(AREAS)) {
    const areaData = areasData[areaId];
    const progress = calculateAreaProgress(areaData, areaId);
    areasProgress[areaId] = progress;
    totalPercentage += progress.percentage;
    areaCount++;
  }

  const percentage = areaCount > 0
    ? Math.round(totalPercentage / areaCount)
    : 0;

  return { percentage, areasProgress };
}

/**
 * Determine the completion color for an activity when it reaches 100%.
 * Uses the color logic: green (on time), yellow (within 3 days late), red (more than 3 days late), blue (not complete).
 *
 * @param {object} activityData - { deadline, sedes: { [sede]: { completed, completedAt } } }
 * @returns {'green'|'yellow'|'red'|'blue'}
 */
export function getActivityCompletionColor(activityData) {
  if (!activityData || !activityData.sedes) return 'blue';

  const { deadline, sedes } = activityData;

  // Check if all sedes are completed
  let allCompleted = true;
  let lastCompletionDate = null;

  for (const sede of SEDES) {
    const sedeData = sedes[sede];
    if (!sedeData?.completed) {
      allCompleted = false;
      break;
    }

    // Track the latest completion date
    const completedAt = sedeData.completedAt;
    if (completedAt) {
      const date = completedAt.toDate ? completedAt.toDate() : new Date(completedAt);
      if (!lastCompletionDate || date > lastCompletionDate) {
        lastCompletionDate = date;
      }
    }
  }

  return getCompletionStatus(deadline, lastCompletionDate, allCompleted);
}

/**
 * Determine the overall completion color for an area.
 * The area color is based on the "worst" color among its activities:
 * red > yellow > blue > green
 *
 * @param {object} areaData - { [activityId]: { deadline, sedes } }
 * @param {string} areaId - Area identifier
 * @returns {'green'|'yellow'|'red'|'blue'}
 */
export function getAreaCompletionColor(areaData, areaId) {
  const area = AREAS[areaId];
  if (!area || !areaData) return 'blue';

  const colorPriority = { red: 3, yellow: 2, blue: 1, green: 0 };
  let worstColor = 'green';
  let hasAnyActivity = false;

  for (const activity of area.activities) {
    const actData = areaData[activity.id];
    const color = getActivityCompletionColor(actData);
    hasAnyActivity = true;

    if (colorPriority[color] > colorPriority[worstColor]) {
      worstColor = color;
    }
  }

  if (!hasAnyActivity) return 'blue';

  return worstColor;
}

/**
 * Get a summary of sedes that have completed and not completed an activity.
 *
 * @param {object} sedesStatus - { [sede]: { completed, completedAt, completedBy } }
 * @returns {{ completedSedes: string[], pendingSedes: string[] }}
 */
export function getSedesSummary(sedesStatus) {
  const completedSedes = [];
  const pendingSedes = [];

  for (const sede of SEDES) {
    if (sedesStatus?.[sede]?.completed) {
      completedSedes.push(sede);
    } else {
      pendingSedes.push(sede);
    }
  }

  return { completedSedes, pendingSedes };
}
