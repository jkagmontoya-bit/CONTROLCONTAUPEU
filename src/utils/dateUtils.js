/**
 * Date utility functions for the Control de Actividades Contables app.
 */

/** 3 days in milliseconds (grace period for yellow status) */
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/** Spanish month names (0-indexed) */
const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Convert a Firestore Timestamp or Date to a JS Date.
 * @param {any} value - Firestore Timestamp, Date, string, or null
 * @returns {Date|null}
 */
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate(); // Firestore Timestamp
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return null;
}

/**
 * Determine the completion color status for an activity.
 *
 * Color logic:
 * - BLUE:   Not yet at 100% completion, or no deadline set
 * - GREEN:  All 9 sedes completed ON or BEFORE the deadline
 * - YELLOW: All 9 sedes completed within 3 days AFTER the deadline
 * - RED:    All 9 sedes completed MORE than 3 days after the deadline
 *
 * @param {Date|Timestamp|null} deadline - The deadline date
 * @param {Date|Timestamp|null} lastCompletionDate - The date the last sede completed
 * @param {boolean} allCompleted - Whether all 9 sedes are completed
 * @returns {'green'|'yellow'|'red'|'blue'}
 */
export function getCompletionStatus(deadline, lastCompletionDate, allCompleted = false) {
  // If no deadline is set, status is blue
  if (!deadline) return 'blue';

  // If not all sedes completed, status is blue
  if (!allCompleted) return 'blue';

  const deadlineDate = toDate(deadline);
  const completionDate = toDate(lastCompletionDate);

  if (!deadlineDate || !completionDate) return 'blue';

  // Normalize to start of day for fair comparison
  const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate(), 23, 59, 59, 999);
  const completionDay = new Date(completionDate.getFullYear(), completionDate.getMonth(), completionDate.getDate());

  if (completionDay <= deadlineDay) {
    return 'green';
  }

  const gracePeriodEnd = new Date(deadlineDay.getTime() + THREE_DAYS_MS);
  if (completionDay <= gracePeriodEnd) {
    return 'yellow';
  }

  return 'red';
}

/**
 * Determine the completion color for a single Sede based on its completion date vs deadline.
 * - GREEN: Completed on or before deadline
 * - YELLOW: Completed within 3 days after deadline
 * - RED: Completed more than 3 days after deadline
 * 
 * @param {Date|Timestamp|null} deadline 
 * @param {Date|Timestamp|null} completedAt 
 * @returns {'green'|'yellow'|'red'|null}
 */
export function getSedeCompletionColor(deadline, completedAt) {
  if (!deadline || !completedAt) return null;

  const deadlineDate = toDate(deadline);
  const completionDate = toDate(completedAt);

  if (!deadlineDate || !completionDate) return null;

  const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate(), 23, 59, 59, 999);
  const completionDay = new Date(completionDate.getFullYear(), completionDate.getMonth(), completionDate.getDate());

  if (completionDay <= deadlineDay) return 'green';
  
  const gracePeriodEnd = new Date(deadlineDay.getTime() + THREE_DAYS_MS);
  if (completionDay <= gracePeriodEnd) return 'yellow';

  return 'red';
}

/**
 * Format a date as dd/mm/yyyy.
 * @param {Date|Timestamp|string|null} date
 * @returns {string} Formatted date or empty string
 */
export function formatDate(date) {
  const d = toDate(date);
  if (!d || isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format a date as dd/mm/yyyy HH:mm.
 * @param {Date|Timestamp|string|null} date
 * @returns {string} Formatted date-time or empty string
 */
export function formatDateTime(date) {
  const d = toDate(date);
  if (!d || isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get the current period as 'YYYY-MM'.
 * @returns {string} e.g. '2026-06'
 */
export function getCurrentPeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get a human-readable label for a period in Spanish.
 * @param {string} period - e.g. '2026-06'
 * @returns {string} e.g. 'Junio 2026'
 */
export function getPeriodLabel(period) {
  if (!period || !period.includes('-')) return period ?? '';

  const [yearStr, monthStr] = period.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;

  if (monthIndex < 0 || monthIndex > 11) return period;

  return `${MONTH_NAMES_ES[monthIndex]} ${yearStr}`;
}

/**
 * Get an array of period options for a dropdown selector.
 * Includes the last 12 months and the next 3 months.
 *
 * @returns {{ value: string, label: string }[]}
 */
export function getMonthOptions() {
  const options = [];
  const now = new Date();

  // Start from 12 months ago
  for (let offset = -12; offset <= 3; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    const label = `${MONTH_NAMES_ES[date.getMonth()]} ${year}`;

    options.push({ value, label });
  }

  return options;
}

/**
 * Parse a period string into year and month.
 * @param {string} period - e.g. '2026-06'
 * @returns {{ year: number, month: number }} 1-indexed month
 */
export function parsePeriod(period) {
  const [yearStr, monthStr] = period.split('-');
  return {
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10),
  };
}

/**
 * Convert a date to an ISO string suitable for <input type="date">.
 * @param {Date|Timestamp|null} date
 * @returns {string} 'YYYY-MM-DD' or ''
 */
export function toInputDate(date) {
  const d = toDate(date);
  if (!d || isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get the number of days delayed. Negative means early, 0 means on time, positive means late.
 * @param {Date|Timestamp|string|null} deadline 
 * @param {Date|Timestamp|string|null} completedAt 
 * @returns {number}
 */
export function getDelayDays(deadline, completedAt) {
  if (!deadline || !completedAt) return 0;
  
  const d = toDate(deadline);
  const c = toDate(completedAt);
  
  if (!d || !c) return 0;
  
  // Normalize to local midnight to avoid timezone shift issues
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const cDay = new Date(c.getFullYear(), c.getMonth(), c.getDate());
  
  const diffTime = cDay.getTime() - dDay.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

