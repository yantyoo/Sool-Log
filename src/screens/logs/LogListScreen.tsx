import React, { useMemo, useState } from 'react';
import { useAppData } from '../../state/AppDataContext';
import FilterBar from '../../components/FilterBar';
import LogCard from '../../components/LogCard';
import EmptyState from '../../components/EmptyState';
import SectionHeader from '../../components/SectionHeader';
import type { LogFilterState } from '../../types/log';
import { isAfter } from 'date-fns';

interface LogListScreenProps {
  onOpenAddLog: () => void;
  onOpenLogDetail: (logId: string) => void;
}

export default function LogListScreen({ onOpenAddLog, onOpenLogDetail }: LogListScreenProps) {
  const { logs } = useAppData();
  const [filters, setFilters] = useState<LogFilterState>({ category: 'all', period: 'all', search: '' });

  const filteredLogs = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(1);

    return logs.filter((log) => {
      if (filters.category !== 'all' && log.drinkCategory !== filters.category) return false;
      if (filters.period === 'week' && !isAfter(new Date(log.consumedAt), weekAgo)) return false;
      if (filters.period === 'month' && !isAfter(new Date(log.consumedAt), monthAgo)) return false;
      if (!search) return true;
      const haystack = [log.drinkName, log.standardDrinkName, log.brand, log.memo, log.foodPairing].join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }, [filters, logs]);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Log History"
        description="기록 검색, 수정, 삭제가 가능한 개인 기록 목록입니다."
        actionLabel="기록 추가"
        onAction={onOpenAddLog}
      />
      <FilterBar value={filters} onChange={setFilters} />

      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => <LogCard key={log.id} log={log} onClick={() => onOpenLogDetail(log.id)} />)
        ) : (
          <EmptyState
            title="기록이 없습니다"
            description="필터 조건에 맞는 기록이 없습니다. 새 음주 기록을 추가해 보세요."
            actionLabel="기록 추가"
            onAction={onOpenAddLog}
          />
        )}
      </div>
    </div>
  );
}

