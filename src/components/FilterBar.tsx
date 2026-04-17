import React from 'react';
import type { DrinkCategory } from '../types/drink';
import type { LogFilterState } from '../types/log';
import { cn } from '../lib/utils';

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
  { value: 'all', label: '전체' },
  { value: 'week', label: '7일' },
  { value: 'month', label: '30일' },
];

interface FilterBarProps {
  value: LogFilterState;
  onChange: (value: LogFilterState) => void;
}

export default function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="space-y-3">
      <input
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        placeholder="기록 검색"
        className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none"
      />
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange({ ...value, category: item.value })}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold border',
              value.category === item.value
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-white/10 bg-white/5 text-white/55',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {periods.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange({ ...value, period: item.value })}
            className={cn(
              'flex-1 px-3 py-2 rounded-2xl text-xs font-bold border',
              value.period === item.value
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-white/10 bg-white/5 text-white/55',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

