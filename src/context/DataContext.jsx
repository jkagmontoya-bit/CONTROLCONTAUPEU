import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  subscribeToAllAreas,
  updateSedeStatus,
  setDeadline as setDeadlineFirestore,
  initializePeriod,
} from '../services/firestoreService';
import { uploadEvidence } from '../services/storageService';
import { getCurrentPeriod } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import { AREAS, AREA_IDS } from '../data/activitiesData';

/**
 * @typedef {object} DataContextValue
 * @property {object} activitiesData - { [areaId]: { [activityId]: { deadline, sedes } } }
 * @property {string} selectedPeriod - Current selected period, e.g. '2026-06'
 * @property {(period: string) => void} setSelectedPeriod - Change the selected period
 * @property {boolean} loading - Whether data is loading
 * @property {string|null} error - Error message
 * @property {(period, areaId, activityId, sede, file?) => Promise<void>} toggleSede - Toggle a sede's completion
 * @property {(period, areaId, activityId, deadline) => Promise<void>} setDeadline - Set a deadline
 * @property {(file, period, areaId, activityId, sede) => Promise<{url, path}>} uploadEvidenceFile - Upload evidence
 */

export const DataContext = createContext(null);

/**
 * DataProvider wraps the app and manages all Firestore data subscriptions
 * and mutations for activities, sedes, and deadlines.
 */
export function DataProvider({ children }) {
  const { user, userProfile } = useAuth();
  const [activitiesData, setActivitiesData] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track active subscription to clean it up on period change
  const unsubscribeRef = useRef(null);
  // Track if period has been initialized to avoid duplicate calls
  const initializedPeriods = useRef(new Set());

  // Subscribe to real-time data when period changes or user is authenticated
  useEffect(() => {
    // Only subscribe if user is authenticated
    if (!user) {
      setActivitiesData({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Initialize period structure in Firestore (idempotent)
    const initPeriod = async () => {
      if (!initializedPeriods.current.has(selectedPeriod)) {
        try {
          await initializePeriod(selectedPeriod);
          initializedPeriods.current.add(selectedPeriod);
        } catch (err) {
          console.error('Error initializing period:', err);
          // Don't block on initialization errors — data may already exist
        }
      }
    };

    // Set up real-time subscription
    const setupSubscription = () => {
      // Clean up previous subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      try {
        let isFirstUpdate = true;

        const unsubscribe = subscribeToAllAreas(selectedPeriod, (data) => {
          setActivitiesData(data);
          if (isFirstUpdate) {
            setLoading(false);
            isFirstUpdate = false;
          }
        });

        unsubscribeRef.current = unsubscribe;
      } catch (err) {
        console.error('Error subscribing to data:', err);
        setError('Error al cargar los datos.');
        setLoading(false);
      }
    };

    initPeriod().then(setupSubscription);

    // Cleanup subscription on unmount or dependency change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [selectedPeriod, user]);

  /**
   * Toggle a sede's completion status.
   * If currently not completed → mark as completed (optionally with evidence file).
   * If currently completed → mark as not completed.
   *
   * @param {string} period - e.g. '2026-06'
   * @param {string} areaId - e.g. 'ventas'
   * @param {string} activityId - e.g. 'subida-lotes-ventas'
   * @param {string} sede - e.g. 'LIMA'
   * @param {File|null} [file=null] - Optional evidence file to upload
   */
  const toggleSede = useCallback(async (period, areaId, activityId, sede, file = null) => {
    if (!user || !userProfile) {
      throw new Error('Debes iniciar sesión para realizar esta acción.');
    }

    try {
      // Get current status
      const currentData = activitiesData[areaId]?.[activityId]?.sedes?.[sede];
      const isCurrentlyCompleted = currentData?.completed ?? false;

      if (isCurrentlyCompleted) {
        // Un-mark completion
        await updateSedeStatus(period, areaId, activityId, sede, {
          completed: false,
          completedAt: null,
          completedBy: null,
          evidenceUrl: null,
        });
      } else {
        // Mark as completed
        let evidenceUrl = null;

        // Upload evidence if a file is provided
        if (file) {
          const result = await uploadEvidence(file, period, areaId, activityId, sede);
          evidenceUrl = result.url;
        }

        await updateSedeStatus(period, areaId, activityId, sede, {
          completed: true,
          completedAt: new Date(),
          completedBy: userProfile.email || user.email,
          evidenceUrl,
        });
      }
    } catch (err) {
      console.error('Error toggling sede:', err);
      throw new Error('Error al actualizar el estado. Intente de nuevo.');
    }
  }, [user, userProfile, activitiesData]);

  /**
   * Set a deadline for a specific activity.
   *
   * @param {string} period - e.g. '2026-06'
   * @param {string} areaId - e.g. 'ventas'
   * @param {string} activityId - e.g. 'subida-lotes-ventas'
   * @param {Date} deadline - The deadline date
   */
  const setDeadline = useCallback(async (period, areaId, activityId, deadline) => {
    try {
      await setDeadlineFirestore(period, areaId, activityId, deadline);
    } catch (err) {
      console.error('Error setting deadline:', err);
      throw new Error('Error al establecer la fecha límite.');
    }
  }, []);

  /**
   * Upload an evidence file for a sede's activity.
   *
   * @param {File} file - The file to upload
   * @param {string} period
   * @param {string} areaId
   * @param {string} activityId
   * @param {string} sede
   * @returns {Promise<{ url: string, path: string }>}
   */
  const uploadEvidenceFile = useCallback(async (file, period, areaId, activityId, sede) => {
    try {
      return await uploadEvidence(file, period, areaId, activityId, sede);
    } catch (err) {
      console.error('Error uploading evidence:', err);
      throw new Error('Error al subir la evidencia.');
    }
  }, []);

  /**
   * Extract deadlines for a specific area from the activities data.
   *
   * @param {string} areaId
   * @returns {object} { [activityId]: deadline }
   */
  const getAreaDeadlines = useCallback((areaId) => {
    const areaData = activitiesData[areaId];
    if (!areaData) return {};

    const deadlines = {};
    for (const [activityId, actData] of Object.entries(areaData)) {
      if (actData?.deadline) {
        deadlines[activityId] = actData.deadline;
      }
    }
    return deadlines;
  }, [activitiesData]);

  // Memoize context value
  const contextValue = useMemo(() => ({
    activitiesData,
    selectedPeriod,
    setSelectedPeriod,
    loading,
    error,
    toggleSede,
    setDeadline,
    uploadEvidenceFile,
    getAreaDeadlines,
  }), [activitiesData, selectedPeriod, loading, error, toggleSede, setDeadline, uploadEvidenceFile, getAreaDeadlines]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * Hook to access the data context.
 * Must be used within a <DataProvider>.
 *
 * @returns {DataContextValue}
 */
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataContext;
