import { useState, useMemo } from 'react';
import AreaCard from './AreaCard';
import OverallProgress from './OverallProgress';
import ActivityTable from '../ActivityTable/ActivityTable';
import './Dashboard.css';

const SEDES = ['LIMA', 'PU', 'IU', 'CU', 'JULIACA', 'TARAPOTO', 'CAT', 'ISTAT', 'CUT'];
const AREA_KEYS = ['ventas', 'compras', 'conciliaciones'];

function calcAreaPct(areaData, activitiesStatus, areaKey) {
  let comp = 0;
  let tot = 0;
  (areaData || []).forEach((activity, idx) => {
    const actId = activity.id || `${areaKey}-${idx}`;
    const actStatus = activitiesStatus[actId] || {};
    SEDES.forEach((sede) => {
      tot++;
      if (actStatus[sede]?.completed) comp++;
    });
  });
  return tot === 0 ? 0 : Math.round((comp / tot) * 100);
}

export default function Dashboard({
  activitiesData = {},
  activitiesStatus = {},
  deadlines = {},
  userProfile = {},
  isAdmin = false,
  onToggleSede,
  onSetDeadline,
  onUploadEvidence,
}) {
  const [expandedArea, setExpandedArea] = useState(null);

  const handleToggle = (areaKey) => {
    setExpandedArea((prev) => (prev === areaKey ? null : areaKey));
  };

  const percentages = useMemo(() => {
    const pcts = {};
    AREA_KEYS.forEach((key) => {
      pcts[key] = calcAreaPct(activitiesData[key], activitiesStatus, key);
    });
    return pcts;
  }, [activitiesData, activitiesStatus]);

  /* Build grid items: cards + expanded table injected after the right card */
  const gridItems = [];
  AREA_KEYS.forEach((key) => {
    gridItems.push(
      <AreaCard
        key={key}
        areaKey={key}
        areaData={activitiesData[key] || []}
        activitiesStatus={activitiesStatus}
        deadlines={deadlines}
        isExpanded={expandedArea === key}
        onToggle={() => handleToggle(key)}
      />,
    );

    if (expandedArea === key) {
      gridItems.push(
        <div className="dashboard-expanded-area" key={`table-${key}`}>
          <ActivityTable
            areaKey={key}
            areaData={activitiesData[key] || []}
            activitiesStatus={activitiesStatus}
            deadlines={deadlines}
            userProfile={userProfile}
            isAdmin={isAdmin}
            onToggleSede={onToggleSede}
            onSetDeadline={onSetDeadline}
            onUploadEvidence={onUploadEvidence}
          />
        </div>,
      );
    }
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Panel de Control — Contabilidad General</h1>
        <p className="dashboard-subtitle">Seguimiento de actividades por área y sede</p>
      </header>

      <div className="dashboard-cards-grid">
        {gridItems}
      </div>

      <div className="dashboard-overall">
        <OverallProgress
          ventasPct={percentages.ventas}
          comprasPct={percentages.compras}
          conciliacionesPct={percentages.conciliaciones}
        />
      </div>
    </div>
  );
}
