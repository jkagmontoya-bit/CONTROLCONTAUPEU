import './ProgressRing.css';

export default function ProgressRing({
  percentage = 0,
  color = '#4f8cff',
  size = 120,
  strokeWidth = 8,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clamped / 100) * circumference;
  const isComplete = clamped === 100;

  const valueFontSize = size * 0.26;
  const percentFontSize = size * 0.14;

  return (
    <div
      className="progress-ring-wrapper"
      style={{ width: size, height: size, '--ring-color': color }}
    >
      <svg
        className={`progress-ring-svg${isComplete ? ' complete' : ''}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <filter id={`glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <circle
          className={`progress-ring-fg${isComplete ? ' complete' : ''}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#glow-${color.replace('#', '')})`}
        />
      </svg>

      <div className="progress-ring-label">
        <span className="progress-ring-value" style={{ fontSize: valueFontSize }}>
          {Math.round(clamped)}
        </span>
        <span className="progress-ring-percent" style={{ fontSize: percentFontSize }}>
          %
        </span>
      </div>
    </div>
  );
}
