import './OverallProgress.css';

const AREA_LABELS = {
  ventas: 'Ventas',
  compras: 'Compras',
  conciliaciones: 'Conciliaciones',
};

export default function OverallProgress({
  ventasPct = 0,
  comprasPct = 0,
  conciliacionesPct = 0,
  colors = {
    ventas: '#4f8cff',
    compras: '#7c5cff',
    conciliaciones: '#00d4ff',
  },
}) {
  const totalPct = Math.round((ventasPct + comprasPct + conciliacionesPct) / 3);

  const segments = [
    { key: 'ventas', pct: ventasPct, color: colors.ventas },
    { key: 'compras', pct: comprasPct, color: colors.compras },
    { key: 'conciliaciones', pct: conciliacionesPct, color: colors.conciliaciones },
  ];

  return (
    <div className="overall-progress">
      <div className="overall-progress-header">
        <h3 className="overall-progress-title">Progreso General</h3>
        <span className="overall-progress-total">{totalPct}%</span>
      </div>

      <div className="overall-progress-labels">
        {segments.map((s) => (
          <div className="overall-progress-label" key={s.key}>
            <span className="overall-progress-dot" style={{ background: s.color }} />
            {AREA_LABELS[s.key]}
            <span className="overall-progress-label-pct">{Math.round(s.pct)}%</span>
          </div>
        ))}
      </div>

      <div className="overall-progress-bar-track">
        {segments.map((s) => (
          <div
            key={s.key}
            className="overall-progress-segment"
            style={{
              width: `${s.pct / 3}%`,
              background: `linear-gradient(90deg, ${s.color}, ${s.color}bb)`,
              boxShadow: `0 0 10px ${s.color}44`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
