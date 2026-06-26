import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';

/**
 * Header — Top navigation bar with branding, period selector slot, user info, and logout.
 */
export default function Header({ periodSelector }) {
  const { user, userProfile, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.displayName || 'Usuario';
  const email = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'contador_general';
  const roleName = isAdmin ? 'Admin' : userProfile?.sede || 'Usuario';

  // Close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="header">
      {/* Left: Brand */}
      <div className="header__brand">
        <span className="header__brand-icon" role="img" aria-label="Logo">
          📊
        </span>
        <span className="header__brand-title">Control de Actividades</span>
      </div>

      {/* Center: Period Selector (passed as prop) */}
      <div className="header__center">
        {periodSelector || null}
      </div>

      {/* Right: User Info (desktop) */}
      <div className="header__user">
        <div className="header__avatar" title={displayName}>
          {initial}
        </div>
        <div className="header__user-info">
          <span className="header__user-name" title={displayName}>
            {displayName}
          </span>
          <span
            className={`header__user-role ${
              isAdmin ? 'header__user-role--admin' : 'header__user-role--sede'
            }`}
          >
            {roleName}
          </span>
        </div>
        <button
          className="header__logout"
          onClick={handleLogout}
          title="Cerrar sesión"
          type="button"
        >
          <span className="header__logout-icon">⏻</span>
          <span>Salir</span>
        </button>
      </div>

      {/* Mobile: Hamburger Toggle */}
      <button
        className="header__menu-toggle"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label="Menú"
        type="button"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile: Dropdown Menu */}
      <div
        ref={menuRef}
        className={`header__mobile-menu${
          mobileMenuOpen ? ' header__mobile-menu--open' : ''
        }`}
      >
        <div className="header__mobile-user">
          <div className="header__avatar" title={displayName}>
            {initial}
          </div>
          <div className="header__user-info">
            <span className="header__user-name" title={displayName}>
              {displayName}
            </span>
            <span
              className={`header__user-role ${
                isAdmin ? 'header__user-role--admin' : 'header__user-role--sede'
              }`}
            >
              {roleName}
            </span>
          </div>
        </div>
        <button
          className="header__mobile-logout"
          onClick={handleLogout}
          type="button"
        >
          <span>⏻</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
