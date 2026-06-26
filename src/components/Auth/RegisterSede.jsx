import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SEDES } from '../../data/activitiesData';
import logo from '../../assets/logo1.png';
import './RegisterSede.css';

const AREAS = [
  'Ventas',
  'Compras',
  'Conciliaciones'
];

/**
 * RegisterSede — Registration screen for new users to select their sedes and area.
 */
export default function RegisterSede() {
  const { user, registerSede } = useContext(AuthContext);
  const [selectedSedes, setSelectedSedes] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const displayName = user?.displayName || 'Usuario';
  const email = user?.email || '';

  const handleToggleSede = (sede) => {
    setSelectedSedes((prev) =>
      prev.includes(sede)
        ? prev.filter((s) => s !== sede)
        : [...prev, sede]
    );
  };

  const handleConfirm = async () => {
    if (selectedSedes.length === 0 || !selectedArea) return;

    setLoading(true);
    setError(null);

    try {
      await registerSede(selectedSedes, selectedArea);
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
          <img src={logo} alt="Logo" className="register-welcome__img" />
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

        {/* Sede Selection (Multiple) */}
        <label className="register-label" style={{ marginTop: 'var(--space-lg)' }}>Selecciona tus sedes:</label>
        <div className="register-grid">
          {SEDES.map((sede) => (
            <button
              key={sede}
              type="button"
              className={`register-sede-btn${
                selectedSedes.includes(sede) ? ' register-sede-btn--selected' : ''
              }`}
              onClick={() => handleToggleSede(sede)}
            >
              {sede}
            </button>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          className="register-btn-confirm"
          onClick={handleConfirm}
          disabled={selectedSedes.length === 0 || !selectedArea || loading}
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
