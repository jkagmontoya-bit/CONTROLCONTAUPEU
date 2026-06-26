/**
 * Role and permission utilities for Control de Actividades Contables.
 */

import { ADMIN_EMAIL } from '../data/activitiesData';

/**
 * Check if an email belongs to the admin (Contador General).
 *
 * @param {string|null|undefined} email
 * @returns {boolean}
 */
export function isAdmin(email) {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Check if a user can edit deadlines.
 * Only the admin (Contador General) can set/modify deadlines.
 *
 * @param {object|null} user - User profile object with at least { email } or { role }
 * @returns {boolean}
 */
export function canEditDeadline(user) {
  if (!user) return false;
  // Check by role first, then by email
  if (user.role === 'admin') return true;
  return isAdmin(user.email);
}

/**
 * Check if a user can toggle (mark/unmark) a specific sede's completion.
 *
 * Rules:
 * - Admin can toggle ANY sede
 * - Regular users can only toggle their assigned sede
 *
 * @param {object|null} user - User profile with { email, sede, role }
 * @param {string} sede - The sede to toggle, e.g. 'LIMA'
 * @returns {boolean}
 */
export function canToggleSede(user, sede) {
  if (!user) return false;

  // Admin can toggle any sede
  if (isAdmin(user.email) || user.role === 'admin') {
    return true;
  }

  // Regular users can only toggle their own assigned sede
  return user.sede === sede;
}

/**
 * Determine the user role based on their email.
 *
 * @param {string} email
 * @returns {'admin'|'user'}
 */
export function getUserRole(email) {
  return isAdmin(email) ? 'admin' : 'user';
}
