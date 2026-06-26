import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload an evidence file to Firebase Storage.
 *
 * Storage path: evidences/{period}/{areaId}/{activityId}/{sede}/{filename}
 *
 * @param {File} file - The file to upload (from an <input type="file"> element)
 * @param {string} period - e.g. '2026-06'
 * @param {string} areaId - e.g. 'ventas'
 * @param {string} activityId - e.g. 'subida-lotes-ventas'
 * @param {string} sede - e.g. 'LIMA'
 * @returns {Promise<{ url: string, path: string }>} Download URL and storage path
 */
export async function uploadEvidence(file, period, areaId, activityId, sede) {
  // Create a unique filename with timestamp to avoid collisions
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${timestamp}_${sanitizedName}`;
  const storagePath = `evidences/${period}/${areaId}/${activityId}/${sede}/${filename}`;

  const storageRef = ref(storage, storagePath);

  // Set metadata for proper content type
  const metadata = {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      period,
      areaId,
      activityId,
      sede,
    },
  };

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file, metadata);

  // Get the download URL
  const url = await getDownloadURL(snapshot.ref);

  return { url, path: storagePath };
}

/**
 * Get the download URL for a file at the given storage path.
 *
 * @param {string} path - Storage path, e.g. 'evidences/2026-06/ventas/.../file.pdf'
 * @returns {Promise<string>} Download URL
 */
export async function getEvidenceUrl(path) {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
}

/**
 * Delete an evidence file from Firebase Storage.
 *
 * @param {string} path - Storage path to delete
 * @returns {Promise<void>}
 */
export async function deleteEvidence(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
