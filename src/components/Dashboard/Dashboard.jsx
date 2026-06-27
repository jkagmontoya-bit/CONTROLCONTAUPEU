import { useState, useMemo } from 'react';
import { SEDES, AREAS, AREA_IDS } from '../../data/activitiesData';
import AreaCard from './AreaCard';
import OverallProgress from './OverallProgress';
import ActivityTable from '../ActivityTable/ActivityTable';
import KPIPanel from './KPIPanel';
import MonthClosingSummary from './MonthClosingSummary';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import MessageModal from '../common/MessageModal';
import { getDelayDays } from '../../utils/dateUtils';
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
  const { activitiesData, selectedPeriod, toggleSede, setDeadline, initializePeriod } = useData();
  const [expandedArea, setExpandedArea] = useState(null);
  const [modalData, setModalData] = useState({ isOpen: false, type: '', title: '', message: '' });
  const [showClosingSummary, setShowClosingSummary] = useState(false);

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
    // Only used for unchecking if no file provided (if needed)
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

  const handleUploadEvidence = async (areaKey, actId, sede, file) => {
    try {
      await toggleSede(selectedPeriod, areaKey, actId, sede, file);
      
      const deadline = activitiesData[areaKey]?.[actId]?.deadline;
      const completedAt = new Date();
      const delay = getDelayDays(deadline, completedAt);

      let msgType = 'success';
      let title = '¡Meta Lograda!';
      let text = '¡Excelente trabajo! Has validado la actividad a tiempo. Sigue así.';
      
      if (delay > 0 && delay <= 3) {
        msgType = 'warning';
        title = 'Actividad Validada';
        text = 'La actividad se validó con un ligero retraso. ¡Anímate a lograr la meta a tiempo el próximo mes!';
      } else if (delay >= 4) {
        msgType = 'danger';
        title = 'Llamado de Atención';
        text = 'Has validado la actividad fuera de plazo. Te exhortamos con mucho cariño a organizarte mejor y lograr las metas a tiempo.';
      }

      setModalData({ isOpen: true, type: msgType, title, message: text });
    } catch (err) {
      console.error(err);
      showToast('Error al subir evidencia. Revisa los permisos de Firebase Storage.', 'error');
    }
  };

  const handleCerrarMes = () => {
    setShowClosingSummary(true);
  };

  const handleConfirmCerrarMes = async () => {
    try {
      // Calculate next month string
      const [yearStr, monthStr] = selectedPeriod.split('-');
      let year = parseInt(yearStr, 10);
      let month = parseInt(monthStr, 10);
      
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      
      const nextMonthStr = `${year}-${String(month).padStart(2, '0')}`;
      
      // Initialize the next month in Firebase
      await initializePeriod(nextMonthStr);
      
      setShowClosingSummary(false);
      showToast(`¡Mes cerrado exitosamente! Ahora puedes trabajar en ${nextMonthStr}. Selecciona el mes en el menú para cambiar.`, 'success');
      
    } catch (err) {
      console.error(err);
      showToast('Error al cerrar mes', 'error');
    }
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

  const handleShareWhatsApp = () => {
    const text = `📊 *Resumen de Control de Actividades*\n\n` +
      `*Ventas:* ${percentages.ventas}% completado\n` +
      `*Compras:* ${percentages.compras}% completado\n` +
      `*Conciliaciones:* ${percentages.conciliaciones}% completado\n\n` +
      `🗓️ *Periodo:* ${selectedPeriod}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Panel de Control — Contabilidad General</h1>
          <p className="dashboard-subtitle">Seguimiento de actividades por área y sede</p>
        </div>
        <button className="btn-whatsapp" onClick={handleShareWhatsApp}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.029 6.988 2.895a9.82 9.82 0 012.892 6.994c-.001 5.45-4.437 9.888-9.885 9.888m8.413-18.297A11.815 11.815 0 0012.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Enviar Resumen al Grupo
        </button>
      </header>

      <div className="dashboard-layout">
        <div className="dashboard-main">
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

        <aside className="dashboard-sidebar">
          <KPIPanel 
            activitiesData={activitiesData} 
            percentages={percentages} 
            onCerrarMes={handleCerrarMes} 
          />
        </aside>
      </div>

      <MessageModal 
        isOpen={modalData.isOpen}
        type={modalData.type}
        title={modalData.title}
        message={modalData.message}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
      />

      <MonthClosingSummary
        isOpen={showClosingSummary}
        onClose={() => setShowClosingSummary(false)}
        activitiesData={activitiesData}
        selectedPeriod={selectedPeriod}
        onConfirmClose={handleConfirmCerrarMes}
      />
    </div>
  );
}

