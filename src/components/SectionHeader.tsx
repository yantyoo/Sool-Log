import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, description, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-lg font-black tracking-tight text-white">{title}</h2>
        {description ? <p className="text-xs text-white/40 leading-relaxed">{description}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <button onClick={onAction} className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

