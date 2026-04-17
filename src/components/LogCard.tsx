import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatDateTimeLabel, formatCurrency } from '../lib/utils';
import type { DrinkingLog } from '../types/log';
import { getDrinkCategoryLabel } from '../lib/recordForms';

interface LogCardProps {
  log: DrinkingLog;
  onClick?: () => void;
}

export default function LogCard({ log, onClick }: LogCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card w-full text-left flex items-center gap-4 active:scale-[0.99] transition-transform"
    >
      <div className="w-12 h-12 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center text-lg">
        🍺
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-white truncate">{log.drinkName}</p>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            {getDrinkCategoryLabel(log.drinkCategory)}
          </span>
        </div>
        <p className="text-xs text-white/40 truncate">{formatDateTimeLabel(log.consumedAt)}</p>
        <p className="text-xs text-white/50 truncate">
          {log.standardDrinkName || '사용자 입력'} · {log.calories ?? '-'} kcal · {log.price ? formatCurrency(log.price) : '-'}
        </p>
      </div>
      <ChevronRight size={16} className="text-white/25" />
    </button>
  );
}

