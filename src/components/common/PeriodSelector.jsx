import { useMemo } from 'react';
import './PeriodSelector.css';

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function buildPeriods() {
  const now = new Date();
  const periods = [];

  for (let offset = -12; offset <= 3; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
    const isCurrent = offset === 0;
    periods.push({ key, label, isCurrent });
  }

  return periods;
}

export default function PeriodSelector({
  currentPeriod,
  onChange,
  disabled = false,
}) {
  const periods = useMemo(buildPeriods, []);

  return (
    <div className="period-selector-wrapper">
      <label className="period-selector-label">Período</label>
      <select
        className="period-selector-select"
        value={currentPeriod}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {periods.map((p) => (
          <option
            key={p.key}
            value={p.key}
            className={p.isCurrent ? 'period-current' : ''}
          >
            {p.label}{p.isCurrent ? ' (actual)' : ''}
          </option>
        ))}
      </select>
      <svg
        className="period-selector-arrow"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
