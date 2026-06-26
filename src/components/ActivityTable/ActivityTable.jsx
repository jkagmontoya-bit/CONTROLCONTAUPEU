import ActivityRow from './ActivityRow';
import { SEDES } from '../../data/activitiesData';
import './ActivityTable.css';

const AREA_COLORS = {
  ventas: '#4f8cff',
  compras: '#7c5cff',
  conciliaciones: '#00d4ff',
};

export default function ActivityTable({
  areaKey,
  areaData = [],
  activitiesStatus = {},
  deadlines = {},
  userProfile = {},
  isAdmin = false,
  onToggleSede,
  onSetDeadline,
  onUploadEvidence,
}) {
  const color = AREA_COLORS[areaKey] || '#4f8cff';

  const headerGradient = {
    background: `linear-gradient(135deg, ${color}22, ${color}0a)`,
  };

  return (
    <div className="activity-table-container">
      <div className="activity-table-scroll">
        <table className="activity-table">
          <thead>
            <tr style={headerGradient}>
              <th>#</th>
              <th>Actividad</th>
              <th>Fecha Límite</th>
              {SEDES.map((sede) => (
                <th key={sede}>{sede}</th>
              ))}
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            {areaData.map((activity, idx) => {
              const actId = activity.id || `${areaKey}-${idx}`;
              return (
                <ActivityRow
                  key={actId}
                  activity={activity}
                  index={idx}
                  areaKey={areaKey}
                  sedesStatus={activitiesStatus[actId] || {}}
                  deadline={deadlines[actId] || null}
                  userProfile={userProfile}
                  isAdmin={isAdmin}
                  onToggleSede={onToggleSede}
                  onSetDeadline={onSetDeadline}
                  onUploadEvidence={onUploadEvidence}
                />
              );
            })}
            {areaData.length === 0 && (
              <tr>
                <td
                  colSpan={3 + SEDES.length + 1}
                  style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}
                >
                  No hay actividades registradas para este período
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
