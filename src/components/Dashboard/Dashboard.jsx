import { useState, useMemo } from 'react';
import { SEDES, AREAS, AREA_IDS } from '../../data/activitiesData';
import AreaCard from './AreaCard';
import OverallProgress from './OverallProgress';
import ActivityTable from '../ActivityTable/ActivityTable';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import './Dashboard.css';

function calcAreaPct(areaActivities, activitiesDataArea, areaKey) {
  let comp = 0;
  let tot = 0;
  (areaActivities || []).forEach((activity) => {
    const actId = activity.id;
    const actStatus = activitiesDataArea?.[actId]?.sedes || {};
    SEDES.forEach((sede) => {
      tot++;
      if (actStatus[sede]?.completed) comp++;
    });
  });
  return tot === 0 ? 0 : Math.round((comp / tot) * 100);
}

export default function Dashboard() {
  const { userProfile, isAdmin } = useAuth();
  const { activitiesData, selectedPeriod, toggleSede, setDeadline, uploadEvidenceFile } = useData();
  const [expandedArea, setExpandedArea] = useState(null);

  const handleToggle = (areaKey) => {
    setExpandedArea((prev) => (prev === areaKey ? null : areaKey));
  };

  const getActivitiesStatus = (areaKey) => {
    const areaStatus = activitiesData[areaKey] || {};
    const statusMap = {};
    Object.keys(areaStatus).forEach(actId => {
      statusMap[actId] = areaStatus[actId].sedes || {};
    });
    return statusMap;
  };

  const getDeadlinesForArea = (areaKey) => {
    const deadlines = {};
    const areaStatus = activitiesData[areaKey] || {};
    Object.keys(areaStatus).forEach(actId => {
      if (areaStatus[actId]?.deadline) {
        deadlines[actId] = areaStatus[actId].deadline;
      }
    });
    return deadlines;
  };

  const percentages = useMemo(() => {
    const pcts = {};
    AREA_IDS.forEach((key) => {
      pcts[key] = calcAreaPct(AREAS[key].activities, activitiesData[key], key);
    });
    return pcts;
  }, [activitiesData]);

  const handleToggleSede = (areaKey, actId, sede) => {
    toggleSede(selectedPeriod, areaKey, actId, sede);
  };

  const { showToast } = useToast();

  const handleSetDeadline = async (areaKey, actId, deadlineStr) => {
    if (!deadlineStr) return; // Ignore clears for now
    try {
      const dateObj = new Date(`${deadlineStr}T12:00:00`); 
      await setDeadline(selectedPeriod, areaKey, actId, dateObj);
      showToast('Fecha límite guardada', 'success');
    } catch (err) {
      showToast('Error al guardar fecha', 'error');
    }
  };

  const handleUploadEvidence = (areaKey, actId, sede, file) => {
    // toggleSede will upload the file and mark as completed
    toggleSede(selectedPeriod, areaKey, actId, sede, file);
  };

  const gridItems = [];
  AREA_IDS.forEach((key) => {
    gridItems.push(
      <AreaCard
        key={key}
        areaKey={key}
        areaData={AREAS[key].activities}
        activitiesStatus={getActivitiesStatus(key)}
        deadlines={getDeadlinesForArea(key)}
        isExpanded={expandedArea === key}
        onToggle={() => handleToggle(key)}
      />,
    );

    if (expandedArea === key) {
      gridItems.push(
        <div className="dashboard-expanded-area" key={`table-${key}`}>
          <ActivityTable
            areaKey={key}
            areaData={AREAS[key].activities}
            activitiesStatus={getActivitiesStatus(key)}
            deadlines={getDeadlinesForArea(key)}
            userProfile={userProfile}
            isAdmin={isAdmin}
            onToggleSede={(actId, sede) => handleToggleSede(key, actId, sede)}
            onSetDeadline={(actId, deadline) => handleSetDeadline(key, actId, deadline)}
            onUploadEvidence={(actId, sede, file) => handleUploadEvidence(key, actId, sede, file)}
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
