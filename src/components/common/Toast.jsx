import { createContext, useContext, useState, useCallback, useRef } from 'react';
import './Toast.css';

/* ── Context ── */
const ToastContext = createContext(null);

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const TITLES = {
  success: 'Éxito',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Información',
};

let toastId = 0;

/* ── Single toast item ── */
function ToastItem({ toast, onRemove }) {
  const handleClose = () => onRemove(toast.id);

  return (
    <div className={`toast-item toast-${toast.type}`}>
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <div className="toast-body">
        <p className="toast-title">{TITLES[toast.type]}</p>
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Cerrar">
        ×
      </button>
      <div className="toast-progress" />
    </div>
  );
}

/* ── Provider ── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++toastId;

      setToasts((prev) => [...prev, { id, message, type }]);

      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    [removeToast],
  );

  const toast = useCallback(
    (message, type = 'info') => addToast(message, type),
    [addToast],
  );
  toast.success = (msg) => addToast(msg, 'success');
  toast.error = (msg) => addToast(msg, 'error');
  toast.warning = (msg) => addToast(msg, 'warning');
  toast.info = (msg) => addToast(msg, 'info');

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Hook ── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

export default ToastProvider;
