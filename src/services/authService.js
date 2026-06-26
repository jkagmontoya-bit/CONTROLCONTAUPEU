import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Sign in with Email and Password.
 * Only allows @upeu.edu.pe email addresses.
 */
export async function signInWithEmail(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!normalizedEmail.endsWith('@upeu.edu.pe')) {
    throw new Error('Acceso restringido. Solo se permiten cuentas @upeu.edu.pe.');
  }

  return await signInWithEmailAndPassword(auth, normalizedEmail, password);
}

/**
 * Register with Email and Password.
 * Only allows @upeu.edu.pe email addresses.
 */
export async function registerWithEmail(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!normalizedEmail.endsWith('@upeu.edu.pe')) {
    throw new Error('Registro restringido. Solo se permiten cuentas @upeu.edu.pe.');
  }

  return await createUserWithEmailAndPassword(auth, normalizedEmail, password);
}

/**
 * Sign out the current user.
 */
export async function signOutUser() {
  await signOut(auth);
}

/**
 * Subscribe to Firebase auth state changes.
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}
