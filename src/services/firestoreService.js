import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AREAS, SEDES, AREA_IDS } from '../data/activitiesData';

// ─── User Profiles ────────────────────────────────────────────────────────────

/**
 * Get a user profile document from the `users` collection.
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<object|null>} User profile data or null if not found
 */
export async function getUserProfile(uid) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

/**
 * Create a user profile document in the `users` collection.
 * @param {string} uid - Firebase Auth UID
 * @param {object} data - { email, displayName, sede, role }
 * @returns {Promise<void>}
 */
export async function createUserProfile(uid, data) {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, {
    email: data.email,
    displayName: data.displayName,
    sedes: data.sedes || [],
    area: data.area || null,
    role: data.role,
    createdAt: serverTimestamp(),
  });
}

// ─── Activities & Sedes Status ────────────────────────────────────────────────

/**
 * Get all activities status for an area in a specific period.
 * Returns an object keyed by activityId, each containing a `sedes` map.
 *
 * @param {string} period - e.g. '2026-06'
 * @param {string} areaId - e.g. 'ventas'
 * @returns {Promise<object>} { [activityId]: { deadline, sedes: { [sede]: { completed, completedAt, ... } } } }
 */
export async function getActivitiesData(period, areaId) {
  const area = AREAS[areaId];
  if (!area) throw new Error(`Unknown area: ${areaId}`);

  const result = {};

  for (const activity of area.activities) {
    const activityDocRef = doc(
      db,
      'periods', period,
      'areas', areaId,
      'activities', activity.id
    );
    const activitySnap = await getDoc(activityDocRef);
    const activityData = activitySnap.exists() ? activitySnap.data() : {};

    // Fetch each sede's status
    const sedesData = {};
    const sedesCollRef = collection(
      db,
      'periods', period,
      'areas', areaId,
      'activities', activity.id,
      'sedes'
    );
    const sedesSnap = await getDocs(sedesCollRef);
    sedesSnap.forEach((sedeDoc) => {
      sedesData[sedeDoc.id] = sedeDoc.data();
    });

    result[activity.id] = {
      deadline: activityData.deadline ?? null,
      sedes: sedesData,
    };
  }

  return result;
}

/**
 * Update a sede's completion status for a specific activity.
 * @param {string} period - e.g. '2026-06'
 * @param {string} areaId - e.g. 'ventas'
 * @param {string} activityId - e.g. 'subida-lotes-ventas'
 * @param {string} sede - e.g. 'LIMA'
 * @param {object} data - { completed, completedAt, completedBy, evidenceUrl }
 * @returns {Promise<void>}
 */
export async function updateSedeStatus(period, areaId, activityId, sede, data) {
  const sedeDocRef = doc(
    db,
    'periods', period,
    'areas', areaId,
    'activities', activityId,
    'sedes', sede
  );

  await setDoc(sedeDocRef, {
    completed: data.completed,
    completedAt: data.completed ? (data.completedAt ?? serverTimestamp()) : null,
    completedBy: data.completedBy ?? null,
    evidenceUrl: data.evidenceUrl ?? null,
  }, { merge: true });
}

// ─── Deadlines ────────────────────────────────────────────────────────────────

/**
 * Set a deadline date for a specific activity.
 * @param {string} period - e.g. '2026-06'
 * @param {string} areaId - e.g. 'ventas'
 * @param {string} activityId - e.g. 'subida-lotes-ventas'
 * @param {Date} deadline - The deadline date
 * @returns {Promise<void>}
 */
export async function setDeadline(period, areaId, activityId, deadline) {
  const activityDocRef = doc(
    db,
    'periods', period,
    'areas', areaId,
    'activities', activityId
  );

  await setDoc(activityDocRef, {
    deadline: Timestamp.fromDate(deadline),
  }, { merge: true });
}

/**
 * Get all deadlines for an area in a period.
 * @param {string} period - e.g. '2026-06'
 * @param {string} areaId - e.g. 'ventas'
 * @returns {Promise<object>} { [activityId]: Timestamp }
 */
export async function getDeadlines(period, areaId) {
  const area = AREAS[areaId];
  if (!area) throw new Error(`Unknown area: ${areaId}`);

  const deadlines = {};

  for (const activity of area.activities) {
    const activityDocRef = doc(
      db,
      'periods', period,
      'areas', areaId,
      'activities', activity.id
    );
    const activitySnap = await getDoc(activityDocRef);
    if (activitySnap.exists()) {
      const data = activitySnap.data();
      if (data.deadline) {
        deadlines[activity.id] = data.deadline;
      }
    }
  }

  return deadlines;
}

// ─── Period Initialization ────────────────────────────────────────────────────

/**
 * Initialize a period structure with all areas, activities, and sedes.
 * Only creates documents that don't already exist (safe to call multiple times).
 *
 * @param {string} period - e.g. '2026-06'
 * @returns {Promise<void>}
 */
export async function initializePeriod(period) {
  const batch = writeBatch(db);
  let operationCount = 0;
  const MAX_BATCH_SIZE = 450; // Firestore limit is 500, keep a margin

  for (const areaId of AREA_IDS) {
    const area = AREAS[areaId];

    for (const activity of area.activities) {
      // Create the activity document (with merge to not overwrite existing deadlines)
      const activityDocRef = doc(
        db,
        'periods', period,
        'areas', areaId,
        'activities', activity.id
      );

      batch.set(activityDocRef, {
        name: activity.name,
        areaId,
      }, { merge: true });
      operationCount++;

      // Create sede documents
      for (const sede of SEDES) {
        const sedeDocRef = doc(
          db,
          'periods', period,
          'areas', areaId,
          'activities', activity.id,
          'sedes', sede
        );

        // We only want to create the document if it doesn't exist to avoid overwriting progress
        // But since we are in a batch, we can't easily read first. 
        // We will just skip initializing sedes entirely since the UI handles missing docs fine, 
        // or we could use updateDoc which fails if it doesn't exist, but that's complex.
        // Actually, if we don't initialize the sedes documents, they will be created when the user toggles them!
        // We can just remove the sede initialization from here.
      }
    }
  }

  // Commit remaining operations
  if (operationCount > 0) {
    await batch.commit();
  }
}

// ─── Real-time Subscriptions ─────────────────────────────────────────────────

/**
 * Subscribe to real-time changes for all activities in an area.
 * Calls `callback` with the full activities data for the area whenever any sede changes.
 *
 * @param {string} period - e.g. '2026-06'
 * @param {string} areaId - e.g. 'ventas'
 * @param {(data: object) => void} callback - Called with { [activityId]: { deadline, sedes } }
 * @returns {() => void} Unsubscribe function that cleans up all listeners
 */
export function subscribeToActivities(period, areaId, callback) {
  const area = AREAS[areaId];
  if (!area) throw new Error(`Unknown area: ${areaId}`);

  const unsubscribers = [];
  const activitiesState = {};

  // Initialize state for each activity
  for (const activity of area.activities) {
    activitiesState[activity.id] = { deadline: null, sedes: {} };
  }

  // Function to emit current state
  const emitState = () => {
    // Deep clone to avoid mutation issues
    callback(JSON.parse(JSON.stringify(activitiesState)));
  };

  for (const activity of area.activities) {
    // Listen to the activity document (for deadline changes)
    const activityDocRef = doc(
      db,
      'periods', period,
      'areas', areaId,
      'activities', activity.id
    );

    const unsubActivity = onSnapshot(activityDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let deadlineIso = null;
        if (data.deadline) {
          deadlineIso = data.deadline.toDate ? data.deadline.toDate().toISOString() : new Date(data.deadline).toISOString();
        }
        activitiesState[activity.id].deadline = deadlineIso;
      }
      emitState();
    });
    unsubscribers.push(unsubActivity);

    // Listen to the sedes subcollection
    const sedesCollRef = collection(
      db,
      'periods', period,
      'areas', areaId,
      'activities', activity.id,
      'sedes'
    );

    const unsubSedes = onSnapshot(sedesCollRef, (snapshot) => {
      const sedesData = {};
      snapshot.forEach((sedeDoc) => {
        const sData = sedeDoc.data();
        if (sData.completedAt && sData.completedAt.toDate) {
          sData.completedAt = sData.completedAt.toDate().toISOString();
        }
        sedesData[sedeDoc.id] = sData;
      });
      activitiesState[activity.id].sedes = sedesData;
      emitState();
    });
    unsubscribers.push(unsubSedes);
  }

  // Return a single unsubscribe function
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

/**
 * Subscribe to real-time changes for all 3 areas in a period.
 * Calls `callback` with data for all areas: { ventas: {...}, compras: {...}, conciliaciones: {...} }
 *
 * @param {string} period - e.g. '2026-06'
 * @param {(data: object) => void} callback - Called with all areas data
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToAllAreas(period, callback) {
  const allAreasState = {};
  const unsubscribers = [];

  for (const areaId of AREA_IDS) {
    allAreasState[areaId] = {};

    const unsub = subscribeToActivities(period, areaId, (areaData) => {
      allAreasState[areaId] = areaData;
      // Emit a snapshot of all areas
      callback({ ...allAreasState });
    });
    unsubscribers.push(unsub);
  }

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}
