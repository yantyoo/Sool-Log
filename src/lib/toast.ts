export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastPayload {
  id?: string;
  tone?: ToastTone;
  title: string;
  description?: string;
  durationMs?: number;
  action?: ToastAction;
}

const TOAST_EVENT = 'soollog:toast';

export function emitToast(payload: ToastPayload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

export function toastEventName() {
  return TOAST_EVENT;
}
