import { useMemo } from 'react';
import { SEDES, AREAS, AREA_IDS } from '../../data/activitiesData';
import { getDelayDays } from '../../utils/dateUtils';
import './KPIPanel.css';

export default function KPIPanel({ activitiesData, percentages, onCerrarMes }) {
  const kpis = useMemo(() => {
    let totalCompleted = 0;
    let onTime = 0;
    let late = 0;
    const sedeCounts = {};
    SEDES.forEach((s) => (sedeCounts[s] = 0));

    let totalActivitiesCount = 0;
    AREA_IDS.forEach((areaKey) => {
      const areaActivities = AREAS[areaKey].activities;
      totalActivitiesCount += areaActivities.length * SEDES.length;

      const actData = activitiesData[areaKey] || {};
      areaActivities.forEach((act) => {
        const sedesData = actData[act.id]?.sedes || {};
        const deadline = actData[act.id]?.deadline;
        
        SEDES.forEach((sede) => {
          if (sedesData[sede]?.completed) {
            totalCompleted++;
            sedeCounts[sede]++;
            const completedAt = sedesData[sede].completedAt;
            const delay = getDelayDays(deadline, completedAt);
            if (delay <= 0) {
              onTime++;
            } else {
              late++;
            }
          }
        });
      });
    });

    const totalPending = totalActivitiesCount - totalCompleted;
    const ranking = Object.keys(sedeCounts)
      .map((sede) => ({ sede, count: sedeCounts[sede] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Top 3

    return { totalCompleted, totalPending, onTime, late, ranking, totalActivitiesCount };
  }, [activitiesData]);

  const overallProgress = Math.round((percentages.ventas + percentages.compras + percentages.conciliaciones) / 3);
  const isMonthComplete = overallProgress === 100;

  return (
    <div className="kpi-panel">
      <h2 className="kpi-title">Métricas del Mes</h2>

      {isMonthComplete && (
        <div className="kpi-cierre">
          <div className="kpi-cierre-icon">🏆</div>
          <p>¡Mes completado al 100%!</p>
          <button className="kpi-cierre-btn" onClick={onCerrarMes}>
            Cerrar Mes y Generar Siguiente
          </button>
        </div>
      )}

      <div className="kpi-card">
        <h3>Avance Total</h3>
        <div className="kpi-stat">
          <div className="kpi-stat-value success">{kpis.totalCompleted}</div>
          <div className="kpi-stat-label">Completadas</div>
        </div>
        <div className="kpi-stat">
          <div className="kpi-stat-value warning">{kpis.totalPending}</div>
          <div className="kpi-stat-label">Pendientes</div>
        </div>
        <div className="kpi-progress">
          <div className="kpi-progress-bar" style={{ width: `${(kpis.totalCompleted / kpis.totalActivitiesCount) * 100}%` }} />
        </div>
      </div>

      <div className="kpi-card">
        <h3>Puntualidad</h3>
        <div className="kpi-punctuality">
          <div className="kpi-punc-item">
            <span className="dot success" />
            <span>A Tiempo ({kpis.onTime})</span>
          </div>
          <div className="kpi-punc-item">
            <span className="dot danger" />
            <span>Atrasadas ({kpis.late})</span>
          </div>
        </div>
      </div>

      <div className="kpi-card">
        <h3>Top Sedes</h3>
        <ul className="kpi-ranking">
          {kpis.ranking.map((item, idx) => (
            <li key={item.sede}>
              <span className="kpi-rank-pos">{idx + 1}</span>
              <span className="kpi-rank-name">{item.sede}</span>
              <span className="kpi-rank-count">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
