import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './RegisterSede.css';

/**
 * List of all sedes available for registration.
 */
const SEDES = [
  'Lima',
  'Juliaca',
  'Tarapoto',
  'Moyobamba',
  'Cusco',
  'Arequipa',
  'Trujillo',
  'Huancayo',
  'Iquitos',
];

const AREAS = [
  'Ventas',
  'Compras',
  'Conciliaciones'
];

/**
 * RegisterSede — Registration screen for new users to select their sede and area.
 */
export default function RegisterSede() {
  const { user, registerSede } = useContext(AuthContext);
  const [selectedSede, setSelectedSede] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const displayName = user?.displayName || 'Usuario';
  const email = user?.email || '';

  const handleConfirm = async () => {
    if (!selectedSede || !selectedArea) return;

    setLoading(true);
    setError(null);

    try {
      await registerSede(selectedSede, selectedArea);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err?.message || 'Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-screen">
      <div className="register-card">
        {/* Welcome */}
        <div className="register-welcome">
          <div className="register-welcome__icon" role="img" aria-label="Bienvenido">
            👋
          </div>
          <h1 className="register-welcome__greeting">
            ¡Bienvenido, {displayName.split(' ')[0]}!
          </h1>
          <p className="register-welcome__email">{email}</p>
        </div>

        {/* Area Selection */}
        <label className="register-label">Selecciona tu área de responsabilidad:</label>
        <div className="register-grid register-grid--areas">
          {AREAS.map((area) => (
            <button
              key={area}
              type="button"
              className={`register-sede-btn${
                selectedArea === area ? ' register-sede-btn--selected' : ''
              }`}
              onClick={() => setSelectedArea(area)}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Sede Selection */}
        <label className="register-label" style={{ marginTop: 'var(--space-lg)' }}>Selecciona tu sede:</label>
        <div className="register-grid">
          {SEDES.map((sede) => (
            <button
              key={sede}
              type="button"
              className={`register-sede-btn${
                selectedSede === sede ? ' register-sede-btn--selected' : ''
              }`}
              onClick={() => setSelectedSede(sede)}
            >
              {sede}
            </button>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          className="register-btn-confirm"
          onClick={handleConfirm}
          disabled={!selectedSede || !selectedArea || loading}
          type="button"
        >
          {loading && <span className="register-spinner" aria-label="Cargando" />}
          {loading ? 'Registrando...' : 'Confirmar'}
        </button>

        {/* Error */}
        {error && (
          <div className="register-error" role="alert">
            {error}
          </div>
        )}

        {/* Note */}
        <p className="register-note">
          El Contador General asignará tu acceso definitivo
        </p>
      </div>
    </div>
  );
}
