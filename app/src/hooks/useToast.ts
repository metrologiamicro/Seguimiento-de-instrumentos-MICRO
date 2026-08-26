import { useState, useCallback } from "react";
import type { ToastMessage, ToastType } from "../components/ToastNotification";

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, type: ToastType = "info", duration = 3000, explicitId?: string) => {
      const id = explicitId || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => {
        const existingIdx = prev.findIndex((t) => t.id === id);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = { id, type, text, duration };
          return next;
        }
        return [...prev, { id, type, text, duration }];
      });
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
  };
}
