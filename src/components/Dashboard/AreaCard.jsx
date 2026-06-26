import { useMemo } from 'react';
import ProgressRing from './ProgressRing';
import './AreaCard.css';

const AREA_META = {
  ventas: { label: 'Ventas', icon: '📊', color: '#4f8cff' },
  compras: { label: 'Compras', icon: '🛒', color: '#7c5cff' },
  conciliaciones: { label: 'Conciliaciones', icon: '🔄', color: '#00d4ff' },
};

const SEDES = ['LIMA', 'PU', 'IU', 'CU', 'JULIACA', 'TARAPOTO', 'CAT', 'ISTAT', 'CUT'];

function getStatusColor(percentage, deadline) {
  if (percentage < 100) return AREA_META[Object.keys(AREA_META)[0]]?.color || '#4f8cff';
  if (!deadline) return '#00e676';

  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = now - dl;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 0) return '#00e676';      // on time
  if (diffDays <= 3) return '#ffd600';       // within 3 days late
  return '#ff1744';                           // more than 3 days late
}

export default function AreaCard({
  areaKey,
  areaData = [],
  activitiesStatus = {},
  deadlines = {},
  isExpanded = false,
  onToggle,
}) {
  const meta = AREA_META[areaKey] || { label: areaKey, icon: '📋', color: '#4f8cff' };

  const { completed, total, percentage, latestDeadline } = useMemo(() => {
    let comp = 0;
    let tot = 0;
    let latest = null;

    areaData.forEach((activity, idx) => {
      const actId = activity.id || `${areaKey}-${idx}`;
      const actStatus = activitiesStatus[actId] || {};

      SEDES.forEach((sede) => {
        tot++;
        if (actStatus[sede]?.completed) comp++;
      });

      const dl = deadlines[actId];
      if (dl && (!latest || new Date(dl) > new Date(latest))) {
        latest = dl;
      }
    });

    return {
      completed: comp,
      total: tot,
      percentage: tot === 0 ? 0 : Math.round((comp / tot) * 100),
      latestDeadline: latest,
    };
  }, [areaData, activitiesStatus, deadlines, areaKey]);

  const ringColor = percentage === 100
    ? getStatusColor(percentage, latestDeadline)
    : meta.color;

  const isComplete = percentage === 100;
  const glowColor = isComplete ? `${ringColor}40` : 'transparent';

  const cardClasses = [
    'area-card',
    isExpanded && 'expanded',
    isComplete && 'complete',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onToggle}
      style={{
        '--area-glow-color': glowColor,
      }}
    >
      <div style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}66)` }} className="area-card-accent-bar" />
      <style>{`
        .area-card:nth-child(1)::before { background: linear-gradient(90deg, ${meta.color}, ${meta.color}66); }
      `}</style>
      <div className="area-card-top">
        <div className="area-card-info">
          <span className="area-card-icon">{meta.icon}</span>
          <h3 className="area-card-name">{meta.label}</h3>
          <p className="area-card-subtitle">
            {completed} de {total} actividades completadas
          </p>
        </div>

        <div className="area-card-ring">
          <ProgressRing
            percentage={percentage}
            color={ringColor}
            size={100}
            strokeWidth={7}
          />
        </div>
      </div>

      <div className="area-card-chevron">
        ▼
      </div>
    </div>
  );
}
