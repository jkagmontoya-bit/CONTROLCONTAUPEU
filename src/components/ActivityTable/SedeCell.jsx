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
  isSelected = false,
  onToggle,
  onSelect,
  sede = '',
  activityName = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isUploading = false; // Kept for class compatibility if needed later

  const handleClick = () => {
    if (!canEdit) return;
    if (completed) {
      // Uncheck if completed
      onToggle?.();
      return;
    }
    // If not completed, toggle selection for bulk approve
    onSelect?.();
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
    isSelected && 'selected',
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
        <span className="sede-cell-date">{formatDateShort(completedAt)}</span>
      ) : (
        <div className="sede-cell-checkbox">
          {isSelected && <span className="sede-cell-checkmark">✓</span>}
        </div>
      )}

      {showTooltip && completed && (
        <div className="sede-cell-tooltip">
          <p><strong>Completado por:</strong> {completedBy || 'N/A'}</p>
          <p><strong>Fecha:</strong> {formatDateLong(completedAt)}</p>
          {evidenceText && <p><strong>Correo:</strong> {evidenceText}</p>}
        </div>
      )}
    </div>
  );
}
