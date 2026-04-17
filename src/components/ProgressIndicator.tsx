import React from 'react';
import { cn, formatPercent } from '../lib/utils';

interface ProgressIndicatorProps {
  label: string;
  value: number;
  max: number;
  subtitle?: string;
}

export default function ProgressIndicator({ label, value, max, subtitle }: ProgressIndicatorProps) {
  const progress = max === 0 ? 0 : Math.min(100, (value / max) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-white/70">{label}</span>
        <span className="text-white/40">{formatPercent(progress)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={cn('h-full rounded-full bg-primary')} style={{ width: `${progress}%` }} />
      </div>
      {subtitle ? <p className="text-[11px] text-white/35">{subtitle}</p> : null}
    </div>
  );
}

