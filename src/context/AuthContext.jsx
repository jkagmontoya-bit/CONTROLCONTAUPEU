import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChange, signInWithEmail, registerWithEmail, signOutUser } from '../services/authService';
import { getUserProfile, createUserProfile } from '../services/firestoreService';
import { isAdmin, getUserRole } from '../utils/roleUtils';

/**
 * @typedef {object} AuthContextValue
 * @property {import('firebase/auth').User|null} user - Firebase Auth user
 * @property {object|null} userProfile - Firestore user profile { email, displayName, sede, role, createdAt }
 * @property {boolean} isAdminUser - Whether the current user is the admin
 * @property {boolean} needsRegistration - True if user is authenticated but has no Firestore profile
 * @property {boolean} loading - True while checking auth state or loading profile
 * @property {string|null} error - Error message if any
 * @property {(email, password) => Promise<void>} login - Sign in with Email/Password
 * @property {(email, password) => Promise<void>} register - Register with Email/Password
 * @property {() => Promise<void>} logout - Sign out
 * @property {(sede: string) => Promise<void>} registerSede - Complete registration with a sede
 */

export const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides authentication state and methods.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setError(null);

      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // Fetch user profile from Firestore
          const profile = await getUserProfile(firebaseUser.uid);

          if (profile) {
            setUserProfile(profile);
            setNeedsRegistration(false);
          } else {
            // User exists in Firebase Auth but no Firestore profile → needs registration
            setUserProfile(null);
            setNeedsRegistration(true);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Error al cargar el perfil del usuario.');
          setUserProfile(null);
          setNeedsRegistration(false);
        }
      } else {
        // User signed out
        setUser(null);
        setUserProfile(null);
        setNeedsRegistration(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign in with Email and Password.
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      // Auth state listener will handle the rest
    } catch (err) {
      console.error('Login error:', err);
      // Map common Firebase errors to Spanish
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setError('Correo o contraseña incorrectos.');
      } else {
          setError(err.message || 'Error al iniciar sesión.');
      }
      setLoading(false);
    }
  }, []);

  /**
   * Register with Email and Password.
   */
  const register = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      await registerWithEmail(email, password);
      // Auth state listener will handle the rest, and route to RegisterSede
    } catch (err) {
      console.error('Register error:', err);
      if (err.code === 'auth/email-already-in-use') {
          setError('El correo ya está registrado. Intenta iniciar sesión.');
      } else if (err.code === 'auth/weak-password') {
          setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
          setError(err.message || 'Error al registrarse.');
      }
      setLoading(false);
    }
  }, []);

  /**
   * Sign out the current user.
   */
  const logout = useCallback(async () => {
    setError(null);

    try {
      await signOutUser();
      // Auth state listener will reset state
    } catch (err) {
      console.error('Logout error:', err);
      setError('Error al cerrar sesión.');
    }
  }, []);

  /**
   * Complete the registration process by selecting a sede and area.
   * Creates the user profile in Firestore.
   *
   * @param {string} sede - The selected sede, e.g. 'Lima'
   * @param {string} area - The selected area, e.g. 'Ventas'
   */
  const registerSede = useCallback(async (sede, area) => {
    if (!user) {
      setError('Debes iniciar sesión primero.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const email = user.email?.toLowerCase() ?? '';
      const role = getUserRole(email);

      const profileData = {
        email,
        displayName: user.displayName || email.split('@')[0],
        sede,
        area,
        role,
      };

      await createUserProfile(user.uid, profileData);

      // Fetch the newly created profile
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      setNeedsRegistration(false);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error al completar el registro.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Memoize the admin status
  const isAdminUser = useMemo(() => {
    return isAdmin(user?.email) || userProfile?.role === 'admin';
  }, [user?.email, userProfile?.role]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    userProfile,
    isAdmin: isAdminUser,
    needsRegistration,
    loading,
    error,
    login,
    register,
    logout,
    registerSede,
  }), [user, userProfile, isAdminUser, needsRegistration, loading, error, login, register, logout, registerSede]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the auth context.
 * Must be used within an <AuthProvider>.
 *
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
