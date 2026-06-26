import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ToastProvider from './components/common/Toast';
import LoginScreen from './components/Auth/LoginScreen';
import RegisterSede from './components/Auth/RegisterSede';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/Layout/Header';
import './App.css';

/**
 * ProtectedRoute — Guards routes that require authentication.
 * - Not logged in → redirect to /login
 * - Logged in but no profile (no sede assigned) → redirect to /register
 * - Otherwise → render children
 */
function ProtectedRoute() {
  const { user, userProfile, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p className="app-loading__text">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!userProfile) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
}

/**
 * PublicRoute — Guards auth routes (login/register).
 * If already logged in with a profile → redirect to dashboard.
 */
function PublicRoute({ children }) {
  const { user, userProfile, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p className="app-loading__text">Cargando...</p>
      </div>
    );
  }

  if (user) {
    if (userProfile) {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/register" replace />;
    }
  }

  return children;
}

/**
 * RegisterRoute — For authenticated users without a profile.
 */
function RegisterRoute({ children }) {
  const { user, userProfile, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p className="app-loading__text">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * AppRoutes — Defines all application routes with proper guards.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public: Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginScreen />
          </PublicRoute>
        }
      />

      {/* Semi-public: Register (requires auth, but no profile) */}
      <Route
        path="/register"
        element={
          <RegisterRoute>
            <RegisterSede />
          </RegisterRoute>
        }
      />

      {/* Protected: Dashboard and sub-routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        {/* Future routes can be added here */}
        {/* <Route path="/ventas" element={<VentasArea />} /> */}
        {/* <Route path="/compras" element={<ComprasArea />} /> */}
        {/* <Route path="/conciliaciones" element={<ConciliacionesArea />} /> */}
      </Route>

      {/* Catch-all: redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * App — Root application component.
 * Wraps everything in AuthProvider → DataProvider → ToastProvider → BrowserRouter.
 */
export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
