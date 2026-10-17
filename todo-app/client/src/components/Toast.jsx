import React from 'react';

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-card toast-${toast.priority || 'medium'}`}
        >
          <div className="toast-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="toast-body">
            <div className="toast-header-row">
              <span className="toast-title">{toast.title}</span>
              <span className="toast-badge">{toast.priority} priority</span>
            </div>
            <p className="toast-message">{toast.message}</p>
          </div>
          <button
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            title="Dismiss notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};
