import { SEDES } from '../../data/activitiesData';
import SedeCell from './SedeCell';
import ProgressBar from '../common/ProgressBar';

const AREA_COLORS = {
  ventas: '#4f8cff',
  compras: '#7c5cff',
  conciliaciones: '#00d4ff',
};

export default function ActivityRow({
  activity,
  index,
  areaKey,
  sedesStatus = {},
  deadline = null,
  userProfile = {},
  isAdmin = false,
  selectedCells = [],
  onSelectSede,
  onToggleSede,
  onSetDeadline,
  onUploadEvidence,
}) {
  const actId = activity.id || `${areaKey}-${index}`;
  const color = AREA_COLORS[areaKey] || '#4f8cff';

  /* Compute progress */
  const completedCount = SEDES.filter((s) => sedesStatus[s]?.completed).length;
  const pct = Math.round((completedCount / SEDES.length) * 100);

  /* Deadline helpers */
  const isOverdue = deadline && new Date(deadline) < new Date();

  const canEditSede = (sede) => {
    if (isAdmin) return true;
    const isSameArea = userProfile?.area === areaKey || !userProfile?.area;
    const hasSede = Array.isArray(userProfile?.sedes) && userProfile.sedes.includes(sede);
    return isSameArea && hasSede;
  };

  const handleDeadlineChange = (e) => {
    onSetDeadline?.(actId, e.target.value);
  };

  const formatDeadline = (dl) => {
    if (!dl) return null;
    try {
      return new Date(dl).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dl;
    }
  };

  return (
    <tr>
      {/* # */}
      <td>{index + 1}</td>

      {/* Actividad */}
      <td>{activity.name || activity.nombre || `Actividad ${index + 1}`}</td>

      {/* Fecha Límite */}
      <td>
        {isAdmin ? (
          <input
            type="date"
            className="activity-row-deadline-input"
            value={deadline ? deadline.slice(0, 10) : ''}
            onChange={handleDeadlineChange}
          />
        ) : deadline ? (
          <span
            className={`activity-row-deadline-text ${isOverdue ? 'overdue' : 'on-time'}`}
          >
            {formatDeadline(deadline)}
          </span>
        ) : (
          <span className="activity-row-deadline-text no-deadline">Sin fecha</span>
        )}
      </td>

      {/* 9 Sede cells */}
      {SEDES.map((sede) => {
        const status = sedesStatus[sede] || {};
        const isSelected = selectedCells.some(
          (c) => c.areaKey === areaKey && c.actId === actId && c.sede === sede
        );
        return (
          <td key={sede}>
            <SedeCell
              completed={!!status.completed}
              completedAt={status.completedAt}
              completedBy={status.completedBy}
              evidenceUrl={status.evidenceUrl}
              deadline={deadline}
              canEdit={canEditSede(sede)}
              isSelected={isSelected}
              sede={sede}
              activityName={activity.name || activity.nombre || ''}
              onToggle={() => onToggleSede?.(actId, sede)}
              onSelect={() => onSelectSede?.(areaKey, actId, sede, deadline)}
            />
          </td>
        );
      })}

      {/* Progreso */}
      <td className="activity-row-progress-cell">
        <div className="activity-row-progress-info">{completedCount}/{SEDES.length}</div>
        <ProgressBar percentage={pct} color={color} height={6} />
      </td>
    </tr>
  );
}
