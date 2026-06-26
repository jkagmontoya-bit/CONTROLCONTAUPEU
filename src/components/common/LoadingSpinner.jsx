import './LoadingSpinner.css';

export default function LoadingSpinner({
  fullScreen = false,
  message = '',
}) {
  const wrapperClass = fullScreen ? 'spinner-overlay' : 'spinner-inline';

  return (
    <div className={wrapperClass}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-glow" />
        <div className="spinner-ring" />
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}
