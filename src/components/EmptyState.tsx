import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="card text-center space-y-3 py-10">
      <div className="w-14 h-14 rounded-2xl mx-auto bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
        🍶
      </div>
      <div className="space-y-1">
        <p className="font-bold text-white">{title}</p>
        <p className="text-sm text-white/45 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <button onClick={onAction} className="btn-primary mx-auto">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

