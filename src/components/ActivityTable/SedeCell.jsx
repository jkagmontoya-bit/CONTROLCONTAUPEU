import { useState } from 'react';
import { getSedeCompletionColor } from '../../utils/dateUtils';
import './SedeCell.css';

export default function SedeCell({
  completed = false,
  completedAt = null,
  completedBy = null,
  evidenceText = null,
  deadline = null,
  canEdit = false,
  onToggle,
  onUploadEvidence,
  sede = '',
  activityName = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleClick = () => {
    if (!canEdit || isUploading) return;
    if (completed) {
      if (evidenceText) {
        // Just uncheck it if it's already checked and they click it? Or do nothing?
        // Let's allow unchecking for now, or you can just return to prevent unchecking.
        onToggle?.();
      } else {
        onToggle?.();
      }
      return;
    }
    // If not completed, open the custom prompt modal
    setShowPrompt(true);
  };

  const handleConfirmText = async () => {
    if (!inputText.trim()) return;
    setShowPrompt(false);
    setIsUploading(true);
    try {
      await onUploadEvidence?.(inputText.trim());
      setInputText('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelText = () => {
    setShowPrompt(false);
    setInputText('');
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
    <>
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

        {showTooltip && completed && (
          <div className="sede-cell-tooltip">
            <p><strong>Completado por:</strong> {completedBy || 'N/A'}</p>
            <p><strong>Fecha:</strong> {formatDateLong(completedAt)}</p>
            {evidenceText && <p><strong>Correo:</strong> {evidenceText}</p>}
          </div>
        )}
      </div>

      {showPrompt && (
        <div className="sede-cell-modal-overlay" onClick={handleCancelText}>
          <div className="sede-cell-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmar Actividad</h3>
            <p>Ingresa el correo al que informaste (o confirmación) para validar esta actividad:</p>
            <input
              type="text"
              placeholder="Ej: micorreo@upeu.edu.pe"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirmText();
                if (e.key === 'Escape') handleCancelText();
              }}
            />
            <div className="sede-cell-modal-actions">
              <button className="btn-cancel" onClick={handleCancelText}>Cancelar</button>
              <button className="btn-confirm" onClick={handleConfirmText} disabled={!inputText.trim()}>Validar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
