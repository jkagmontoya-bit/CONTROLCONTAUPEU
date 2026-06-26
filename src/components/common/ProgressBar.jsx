import './ProgressBar.css';

export default function ProgressBar({
  percentage = 0,
  color = '#4f8cff',
  height = 8,
  showLabel = false,
  animated = true,
}) {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  const fillStyle = {
    width: `${clampedPct}%`,
    height: `${height}px`,
    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
    boxShadow: `0 0 12px ${color}55`,
  };

  const trackStyle = {
    height: `${height}px`,
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-track" style={trackStyle}>
        <div
          className={`progress-bar-fill${animated ? ' animated' : ''}`}
          style={fillStyle}
        />
      </div>
      {showLabel && (
        <span className="progress-bar-label">{Math.round(clampedPct)}%</span>
      )}
    </div>
  );
}
