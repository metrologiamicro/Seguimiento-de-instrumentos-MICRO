import React, { useEffect, useState } from "react";
import "../styles/toast.css";

export type ToastType = "success" | "warn" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
  duration?: number;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-container-bottom-left">
      {toasts.map((t) => (
        <SingleToast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const SingleToast: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const duration = toast.duration ?? 3000;
  const fadeDuration = Math.min(300, duration);

  useEffect(() => {
    setIsExiting(false);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(0, duration - fadeDuration));

    const dismissTimer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast.id, toast.text, toast.type, duration, fadeDuration, onDismiss]);

  return (
    <div className={`toast-item ${toast.type} ${isExiting ? "exiting" : "entering"}`}>
      <span className="toast-text mono">{toast.text}</span>
      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        title="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};
