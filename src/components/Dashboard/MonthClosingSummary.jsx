import React, { useMemo } from 'react';
import { SEDES, AREAS, AREA_IDS } from '../../data/activitiesData';
import { getDelayDays } from '../../utils/dateUtils';
import './MonthClosingSummary.css';

export default function MonthClosingSummary({ isOpen, onClose, activitiesData, selectedPeriod, onConfirmClose }) {
  const metrics = useMemo(() => {
    if (!isOpen) return null;

    let totalCompleted = 0;
    let onTime = 0;
    let delayed = 0;
    let late = 0;

    // Track sedes
    const sedeStats = {};
    SEDES.forEach((s) => {
      sedeStats[s] = { count: 0, onTime: 0, delayed: 0, late: 0 };
    });

    // Track areas
    const areaStats = {};
    AREA_IDS.forEach((key) => {
      areaStats[key] = { name: AREAS[key].name, count: 0, onTime: 0 };
    });

    AREA_IDS.forEach((areaKey) => {
      const areaActivities = AREAS[areaKey].activities;
      const actData = activitiesData[areaKey] || {};

      areaActivities.forEach((act) => {
        const sedesData = actData[act.id]?.sedes || {};
        const deadline = actData[act.id]?.deadline;
        
        SEDES.forEach((sede) => {
          if (sedesData[sede]?.completed) {
            totalCompleted++;
            sedeStats[sede].count++;
            areaStats[areaKey].count++;

            const completedAt = sedesData[sede].completedAt;
            const delay = getDelayDays(deadline, completedAt);

            if (delay <= 0) {
              onTime++;
              sedeStats[sede].onTime++;
              areaStats[areaKey].onTime++;
            } else if (delay > 0 && delay <= 3) {
              delayed++;
              sedeStats[sede].delayed++;
            } else {
              late++;
              sedeStats[sede].late++;
            }
          }
        });
      });
    });

    const punctualityPct = totalCompleted > 0 ? Math.round((onTime / totalCompleted) * 100) : 0;

    // Full ranking of sedes
    const ranking = Object.keys(sedeStats)
      .map((sede) => ({ sede, ...sedeStats[sede] }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.onTime - a.onTime; // Tie-breaker: who has more on-time
      });

    // Best and worst areas by punctuality
    const areasArr = Object.values(areaStats).map(a => ({
      ...a,
      punctuality: a.count > 0 ? Math.round((a.onTime / a.count) * 100) : 0
    })).sort((a, b) => b.punctuality - a.punctuality);

    const bestArea = areasArr[0];
    const worstArea = areasArr[areasArr.length - 1];

    return { totalCompleted, onTime, delayed, late, punctualityPct, ranking, bestArea, worstArea, areasArr };
  }, [activitiesData, isOpen]);

  if (!isOpen || !metrics) return null;

  const handleShareWhatsApp = () => {
    let text = `🏆 *Reporte de Cierre de Mes: ${selectedPeriod}* 🏆\n\n`;
    text += `*Desempeño Global:*\n`;
    text += `✅ Actividades Completadas: ${metrics.totalCompleted}\n`;
    text += `🎯 Puntualidad General: ${metrics.punctualityPct}%\n\n`;
    
    text += `*Detalle de Tiempos:*\n`;
    text += `🟢 A Tiempo: ${metrics.onTime}\n`;
    text += `🟡 Retraso Leve: ${metrics.delayed}\n`;
    text += `🔴 Fuera de Plazo: ${metrics.late}\n\n`;

    text += `*Rendimiento por Área:*\n`;
    text += `🥇 Mejor Área: ${metrics.bestArea.name} (${metrics.bestArea.punctuality}% puntual)\n`;
    text += `⚠️ Oportunidad de Mejora: ${metrics.worstArea.name} (${metrics.worstArea.punctuality}% puntual)\n\n`;

    text += `*Top 3 Sedes (Puntualidad):*\n`;
    metrics.ranking.slice(0, 3).forEach((r, idx) => {
      text += `${idx + 1}. ${r.sede} - ${r.onTime} a tiempo\n`;
    });

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="closing-modal-overlay">
      <div className="closing-modal-content">
        <button className="closing-modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        
        {/* Printable Area Starts */}
        <div className="closing-printable-area">
          <div className="closing-header">
            <h2>Reporte Ejecutivo de Cierre</h2>
            <div className="closing-period">{selectedPeriod}</div>
          </div>

          <div className="closing-grid">
            <div className="closing-card summary">
              <h3>Desempeño Global</h3>
              <div className="closing-big-stat">
                <span className="closing-big-value">{metrics.punctualityPct}%</span>
                <span className="closing-big-label">Puntualidad General</span>
              </div>
              <div className="closing-stats-row">
                <div className="closing-stat">
                  <span className="dot success"></span>
                  <strong>{metrics.onTime}</strong> A Tiempo
                </div>
                <div className="closing-stat">
                  <span className="dot warning"></span>
                  <strong>{metrics.delayed}</strong> Tardes
                </div>
                <div className="closing-stat">
                  <span className="dot danger"></span>
                  <strong>{metrics.late}</strong> Atrasadas
                </div>
              </div>
            </div>

            <div className="closing-card areas">
              <h3>Rendimiento por Área</h3>
              <div className="closing-area-item best">
                <div className="closing-area-icon">🥇</div>
                <div className="closing-area-info">
                  <span className="closing-area-name">{metrics.bestArea.name}</span>
                  <span className="closing-area-pct">{metrics.bestArea.punctuality}% puntualidad</span>
                </div>
              </div>
              <div className="closing-area-item worst">
                <div className="closing-area-icon">⚠️</div>
                <div className="closing-area-info">
                  <span className="closing-area-name">{metrics.worstArea.name}</span>
                  <span className="closing-area-pct">{metrics.worstArea.punctuality}% puntualidad</span>
                </div>
              </div>
            </div>

            <div className="closing-card ranking">
              <h3>Ranking Completo de Sedes</h3>
              <div className="closing-ranking-list">
                <div className="closing-ranking-header">
                  <span>Sede</span>
                  <span>A Tiempo</span>
                  <span>Total</span>
                </div>
                {metrics.ranking.map((item, idx) => (
                  <div className="closing-ranking-row" key={item.sede}>
                    <span className="closing-ranking-pos">{idx + 1}. {item.sede}</span>
                    <span className="closing-ranking-ontime success">{item.onTime}</span>
                    <span className="closing-ranking-total">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Printable Area Ends */}

        <div className="closing-actions">
          <button className="btn-secondary" onClick={handlePrint}>
            📄 Descargar PDF
          </button>
          <button className="btn-secondary btn-wa" onClick={handleShareWhatsApp}>
            💬 Compartir
          </button>
          <button className="btn-primary" onClick={onConfirmClose}>
            Aperturar Siguiente Mes ➡️
          </button>
        </div>
      </div>
    </div>
  );
}
