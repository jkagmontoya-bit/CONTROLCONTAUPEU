import React from 'react';
import './MessageModal.css';

export default function MessageModal({ isOpen, onClose, type, message, title }) {
  if (!isOpen) return null;

  return (
    <div className="message-modal-overlay" onClick={onClose}>
      <div className={`message-modal-content ${type}`} onClick={(e) => e.stopPropagation()}>
        <button className="message-modal-close" onClick={onClose}>&times;</button>
        <div className="message-modal-icon">
          {type === 'success' && '🏆'}
          {type === 'warning' && '💪'}
          {type === 'danger' && '⚠️'}
        </div>
        <h2 className="message-modal-title">{title}</h2>
        <p className="message-modal-text">{message}</p>
        <div className="message-modal-signature">
          <p>Atte.</p>
          <p><strong>Contador General</strong></p>
        </div>
        <button className="message-modal-btn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}
