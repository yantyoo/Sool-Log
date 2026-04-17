import React from 'react';
import { cn } from '../lib/utils';

interface SummaryCardProps {
  title: string;
  value: string;
  description?: string;
  tone?: 'default' | 'accent' | 'warning';
}

export default function SummaryCard({ title, value, description, tone = 'default' }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'card space-y-2',
        tone === 'accent' && 'border-primary/30 bg-primary/10',
        tone === 'warning' && 'border-amber-400/30 bg-amber-400/10',
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{title}</p>
      <p className="text-2xl font-black tracking-tight text-white">{value}</p>
      {description ? <p className="text-xs text-white/50 leading-relaxed">{description}</p> : null}
    </div>
  );
}

