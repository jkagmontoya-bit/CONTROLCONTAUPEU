import { useState, useRef } from 'react';
import { getSedeCompletionColor } from '../../utils/dateUtils';
import './SedeCell.css';

export default function SedeCell({
  completed = false,
  completedAt = null,
  completedBy = null,
  evidenceUrl = null,
  deadline = null,
  canEdit = false,
  onToggle,
  onUploadEvidence,
  sede = '',
  activityName = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef(null);

  const handleClick = () => {
    if (!canEdit || isUploading) return;
    if (completed) {
      if (evidenceUrl) {
        window.open(evidenceUrl, '_blank');
      } else {
        // Allow unchecking if somehow completed without evidence
        onToggle?.();
      }
      return;
    }
    // If not completed, force file upload
    fileRef.current?.click();
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (isUploading) return;
    fileRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await onUploadEvidence?.(file);
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const formatDateLong = (dateStr) => {
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

  const colorStatus = completed ? getSedeCompletionColor(deadline, completedAt) : null;
  const colorClass = colorStatus ? `completed-${colorStatus}` : '';

  const cellClasses = [
    'sede-cell',
    completed ? 'completed' : 'incomplete',
    colorClass,
    canEdit && 'editable',
    canEdit && !completed && 'pending-action',
    !canEdit && !completed && 'disabled',
    isUploading && 'uploading',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cellClasses}
      onClick={handleClick}
      onMouseEnter={() => completed && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title=""
    >
      {isUploading ? (
        <div className="sede-cell-spinner" />
      ) : completed ? (
        <span className="sede-cell-date">{formatDateShort(completedAt)}</span>
      ) : (
        <div className="sede-cell-checkbox" />
      )}

      {!completed && canEdit && !isUploading && (
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
          <p><strong>Fecha:</strong> {formatDateLong(completedAt)}</p>
          {evidenceUrl && <p><strong>Evidencia:</strong> Adjunta ✓</p>}
        </div>
      )}
    </div>
  );
}
