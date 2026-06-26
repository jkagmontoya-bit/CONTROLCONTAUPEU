import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './LoginScreen.css';

/**
 * LoginScreen — Full-screen login page with Email/Password.
 */
export default function LoginScreen() {
  const { login, register, error: contextError, loading: contextLoading } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
       // Error is handled in context, but we can set local if needed.
       console.error("Auth action failed");
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || contextError;

  return (
    <div className="login-screen">
      {/* Extra animated floating shape */}
      <div className="login-screen__shape" aria-hidden="true" />

      <div className="login-card">
        {/* Logo area */}
        <div className="login-logo">
          <div className="login-logo__icon" role="img" aria-label="Gráfico contable">
            📊
          </div>
          <h1 className="login-logo__title">Control de Actividades</h1>
          <p className="login-logo__subtitle">Contabilidad General</p>
        </div>

        {/* University name */}
        <p className="login-university">Universidad Peruana Unión</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label htmlFor="email">Correo Institucional</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@upeu.edu.pe"
              required
            />
          </div>
          
          <div className="login-input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="6"
            />
          </div>

          <button
            className="login-btn-submit"
            type="submit"
            disabled={loading || contextLoading}
          >
            {loading || contextLoading ? (
              <div className="login-spinner" aria-label="Cargando" />
            ) : (
              <span>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</span>
            )}
          </button>
        </form>

        <div className="login-toggle">
          <button 
            type="button" 
            className="login-toggle-btn" 
            onClick={() => { setIsRegistering(!isRegistering); setLocalError(''); }}
          >
            {isRegistering 
              ? '¿Ya tienes cuenta? Inicia sesión' 
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        {/* Error message */}
        {displayError && (
          <div className="login-error" role="alert">
            {displayError}
          </div>
        )}

        {/* Footer */}
        <p className="login-footer">
          Solo correos <span className="login-footer__domain">@upeu.edu.pe</span>
        </p>
      </div>
    </div>
  );
}
