import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value);
}

export function formatTime(seconds: number) {
  const days = Math.floor(seconds / (3600 * 24));
  const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) return `${days}일 ${hrs}시간 ${mins}분`;
  return `${hrs}시간 ${mins}분 ${secs}초`;
}

export function toDateTimeLocalValue(date: string | Date = new Date()) {
  const normalized = typeof date === 'string' ? new Date(date) : date;
  const local = new Date(normalized.getTime() - normalized.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function formatDateTimeLabel(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateLabel(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}
