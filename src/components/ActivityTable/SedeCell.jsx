import { useState, useRef } from 'react';
import './SedeCell.css';

export default function SedeCell({
  completed = false,
  completedAt = null,
  completedBy = null,
  evidenceUrl = null,
  canEdit = false,
  onToggle,
  onUploadEvidence,
  sede = '',
  activityName = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const fileRef = useRef(null);

  const handleClick = () => {
    if (!canEdit) return;
    if (completed && evidenceUrl) {
      window.open(evidenceUrl, '_blank');
      return;
    }
    onToggle?.();
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    fileRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadEvidence?.(file);
      e.target.value = '';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const cellClasses = [
    'sede-cell',
    completed ? 'completed' : 'incomplete',
    canEdit && 'editable',
    !canEdit && !completed && 'disabled',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cellClasses}
      onClick={handleClick}
      onMouseEnter={() => completed && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title=""
    >
      {completed ? (
        <span className="sede-cell-check">✅</span>
      ) : (
        <div className="sede-cell-checkbox" />
      )}

      {!completed && canEdit && (
        <button
          className="sede-cell-upload"
          onClick={handleUploadClick}
          aria-label={`Subir evidencia para ${sede}`}
        >
          📎
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        className="sede-cell-file-input"
        accept="image/*,.pdf"
        onChange={handleFileChange}
      />

      {showTooltip && completed && (
        <div className="sede-cell-tooltip">
          <p><strong>Completado por:</strong> {completedBy || 'N/A'}</p>
          <p><strong>Fecha:</strong> {formatDate(completedAt)}</p>
          {evidenceUrl && <p><strong>Evidencia:</strong> Adjunta ✓</p>}
        </div>
      )}
    </div>
  );
}
