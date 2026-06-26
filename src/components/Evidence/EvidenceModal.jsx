import { useEffect, useCallback } from 'react';
import './EvidenceModal.css';

function isImageUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('.png') ||
    lower.includes('.jpg') ||
    lower.includes('.jpeg') ||
    lower.includes('.gif') ||
    lower.includes('.webp') ||
    lower.includes('.svg') ||
    lower.includes('image')
  );
}

export default function EvidenceModal({
  isOpen = false,
  onClose,
  evidenceUrl = '',
  sede = '',
  activityName = '',
  completedBy = '',
  completedAt = '',
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const showImage = isImageUrl(evidenceUrl);

  return (
    <div className="evidence-overlay" onClick={handleOverlayClick}>
      <div className="evidence-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="evidence-header">
          <div className="evidence-header-text">
            <h2>Evidencia — {activityName}</h2>
            <p>{sede}</p>
          </div>
          <button className="evidence-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="evidence-body">
          {evidenceUrl ? (
            <>
              {showImage ? (
                <div className="evidence-preview">
                  <img src={evidenceUrl} alt={`Evidencia de ${activityName}`} loading="lazy" />
                </div>
              ) : (
                <a
                  className="evidence-download-link"
                  href={evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Descargar archivo adjunto
                </a>
              )}
            </>
          ) : (
            <div className="evidence-no-preview">
              <span className="evidence-no-preview-icon">📭</span>
              No hay evidencia adjunta
            </div>
          )}

          {/* Info */}
          <div className="evidence-info">
            <div className="evidence-info-row">
              <span className="evidence-info-label">Subido por:</span>
              <span className="evidence-info-value">{completedBy || 'N/A'}</span>
            </div>
            <div className="evidence-info-row">
              <span className="evidence-info-label">Fecha:</span>
              <span className="evidence-info-value">{formatDate(completedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
