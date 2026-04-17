import React from 'react';
import { formatPercent } from '../lib/utils';
import type { HabitGoal } from '../types/goal';
import { cn } from '../lib/utils';

interface GoalCardProps {
  goal: HabitGoal;
  currentValue: number;
  onToggle?: () => void;
}

export default function GoalCard({ goal, currentValue, onToggle }: GoalCardProps) {
  const progress = goal.targetValue === 0 ? 0 : Math.min(100, (currentValue / goal.targetValue) * 100);
  const isWarning = progress >= goal.warningThresholdPercent;

  return (
    <div className={cn('card space-y-4', isWarning && 'border-amber-400/40 bg-amber-400/10')}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-bold text-white">{goal.title}</p>
          <p className="text-xs text-white/40">
            {goal.period === 'weekly' ? '주간' : '월간'} · 목표 {goal.targetValue}
            {goal.unit} · 경고 {goal.warningThresholdPercent}%
          </p>
        </div>
        <button onClick={onToggle} className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          {goal.enabled ? '활성' : '비활성'}
        </button>
      </div>
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-white/45">
          <span>{currentValue}{goal.unit}</span>
          <span>{formatPercent(progress)}</span>
        </div>
      </div>
      {isWarning ? <p className="text-xs font-bold text-amber-300">경고 상태입니다. 목표를 초과할 수 있습니다.</p> : null}
    </div>
  );
}

