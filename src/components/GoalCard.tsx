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
  const rawProgress = goal.targetValue === 0 ? 0 : (currentValue / goal.targetValue) * 100;
  const progress = Math.min(100, rawProgress);
  
  const isLimitationGoal = goal.goalType !== 'sober_days';
  const isExceeded = isLimitationGoal && rawProgress >= 100;
  const isWarning = isLimitationGoal && rawProgress >= goal.warningThresholdPercent && rawProgress < 100;
  const isAchieved = !isLimitationGoal && rawProgress >= 100;

  return (
    <div 
      className={cn(
        'card space-y-4 transition-all duration-300', 
        isExceeded && 'border-red-500/40 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]',
        isWarning && 'border-amber-500/40 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
        isAchieved && 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-bold text-white flex items-center gap-2">
            <span>{goal.title}</span>
            {isExceeded && <span className="text-[9px] px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 font-extrabold">초과</span>}
            {isWarning && <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-extrabold">경고</span>}
            {isAchieved && <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold">성공</span>}
          </p>
          <p className="text-xs text-white/40">
            {goal.period === 'weekly' ? '주간' : '월간'} · 목표 {goal.targetValue}
            {goal.unit} · 경고 {goal.warningThresholdPercent}%
          </p>
        </div>
        <button onClick={onToggle} className="text-xs font-black uppercase tracking-[0.16em] text-primary-light active:scale-95 transition-all">
          {goal.enabled ? '활성' : '비활성'}
        </button>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-1000',
              isExceeded ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
              isWarning ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
              isAchieved ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
              'bg-primary'
            )} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex items-center justify-between text-xs text-white/45 font-bold">
          <span>{currentValue} / {goal.targetValue}{goal.unit}</span>
          <span>{formatPercent(rawProgress)}</span>
        </div>
      </div>
      
      {isExceeded && <p className="text-xs font-bold text-red-400 flex items-center gap-1">⚠️ 목표 한도를 초과했습니다! (절제 필요)</p>}
      {isWarning && <p className="text-xs font-bold text-amber-400 flex items-center gap-1">⚠️ 주의: 목표 한도에 가까워지고 있습니다.</p>}
      {isAchieved && <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">🎉 축하합니다! 금주 목표를 완수했습니다.</p>}
    </div>
  );
}

