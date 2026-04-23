import React from 'react';
import type { DrinkCategory } from '../types/drink';
import type { LogFilterState } from '../types/log';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const categories: Array<{ value: DrinkCategory | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'soju', label: '소주' },
  { value: 'beer', label: '맥주' },
  { value: 'wine', label: '와인' },
  { value: 'whiskey', label: '위스키' },
  { value: 'makgeolli', label: '막걸리' },
  { value: 'highball', label: '하이볼' },
  { value: 'traditional_liquor', label: '전통주' },
  { value: 'other', label: '기타' },
];

const periods: Array<{ value: LogFilterState['period']; label: string }> = [
  { value: 'all', label: '전체 기간' },
  { value: 'month', label: '이번 달' },
  { value: 'week', label: '이번 주' },
];

interface FilterBarProps {
  value: LogFilterState;
  onChange: (value: LogFilterState) => void;
}

export default function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-6">
      {/* Categories (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange({ ...value, category: item.value })}
            className={cn(
              'shrink-0 px-6 py-3 rounded-2xl text-[13px] font-extrabold transition-all duration-300 border relative overflow-hidden',
              value.category === item.value
                ? 'bg-primary border-primary text-white shadow-[0_10px_20px_-5px_rgba(99,102,241,0.4)]'
                : 'bg-white/[0.03] border-white/[0.05] text-white/30 hover:bg-white/5 hover:text-white/60',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-white/5 shrink-0" />

      {/* Period Toggles */}
      <div className="flex gap-2 bg-white/[0.03] border border-white/[0.05] p-1.5 rounded-2xl shrink-0">
        {periods.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange({ ...value, period: item.value })}
            className={cn(
              'px-5 py-2.5 rounded-[12px] text-[11px] font-black tracking-tight transition-all duration-300 relative whitespace-nowrap',
              value.period === item.value
                ? 'text-white'
                : 'text-white/20 hover:text-white/40',
            )}
          >
            {value.period === item.value && (
              <motion.div 
                layoutId="activePeriodTab"
                className="absolute inset-0 bg-white/5 border border-white/10 rounded-[12px] shadow-sm" 
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
