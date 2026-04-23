import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toastEventName, type ToastPayload, type ToastTone } from '../lib/toast';

interface ToastItem extends Required<Pick<ToastPayload, 'title'>> {
  id: string;
  tone: ToastTone;
  description: string;
  durationMs: number;
  action?: ToastPayload['action'];
}

interface ToastContextValue {
  showToast: (toast: ToastPayload) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function createToastItem(payload: ToastPayload): ToastItem {
  return {
    id: payload.id ?? crypto.randomUUID(),
    tone: payload.tone ?? 'info',
    title: payload.title,
    description: payload.description ?? '',
    durationMs: payload.durationMs ?? (payload.tone === 'error' ? 5000 : payload.tone === 'warning' ? 4000 : 2500),
    action: payload.action,
  };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useMemo(() => {
    return (id: string) => setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useMemo(() => {
    return (payload: ToastPayload) => {
      const item = createToastItem(payload);
      setToasts((current) => [...current.filter((toast) => toast.id !== item.id), item]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== item.id));
      }, item.durationMs);
    };
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<ToastPayload>;
      if (customEvent.detail) {
        showToast(customEvent.detail);
      }
    };

    window.addEventListener(toastEventName(), handler);
    return () => window.removeEventListener(toastEventName(), handler);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-5 left-0 right-0 z-[120] pointer-events-none px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const toneClass =
    toast.tone === 'success'
      ? 'border-emerald-400/25 bg-emerald-400/12 text-emerald-50'
      : toast.tone === 'warning'
        ? 'border-amber-400/25 bg-amber-400/12 text-amber-50'
        : toast.tone === 'error'
          ? 'border-red-400/25 bg-red-400/12 text-red-50'
          : 'border-white/10 bg-white/8 text-white';

  const toneDot =
    toast.tone === 'success'
      ? 'bg-emerald-400'
      : toast.tone === 'warning'
        ? 'bg-amber-300'
        : toast.tone === 'error'
          ? 'bg-red-400'
          : 'bg-primary';

  return (
    <div className={`pointer-events-auto rounded-[24px] border backdrop-blur-2xl px-4 py-3 shadow-2xl ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1 h-2.5 w-2.5 rounded-full ${toneDot}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-tight">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-xs leading-relaxed opacity-80">{toast.description}</p> : null}
        </div>
        <button type="button" onClick={onDismiss} className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100">
          닫기
        </button>
      </div>
      {toast.action ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onDismiss();
            }}
            className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            {toast.action.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}
