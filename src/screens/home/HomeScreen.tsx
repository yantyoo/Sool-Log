import React, { useEffect, useState } from 'react';
import { Clock3, Flame, Wallet } from 'lucide-react';
import { formatCurrency, formatTime } from '../../lib/utils';
import { useAppData } from '../../state/AppDataContext';
import SummaryCard from '../../components/SummaryCard';
import SectionHeader from '../../components/SectionHeader';
import LogCard from '../../components/LogCard';
import EmptyState from '../../components/EmptyState';

export default function HomeScreen({ onOpenAddLog, onOpenLogDetail }: { onOpenAddLog: () => void; onOpenLogDetail: (logId: string) => void; }) {
  const { logs } = useAppData();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const latestLog = logs[0];
  const latestDate = latestLog ? new Date(latestLog.consumedAt).getTime() : null;
  const soberSeconds = latestDate ? Math.max(0, Math.floor((Date.now() - latestDate) / 1000)) : 0;

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(1);

  const weeklyLogs = logs.filter((log) => new Date(log.consumedAt) >= weekAgo);
  const monthlyLogs = logs.filter((log) => new Date(log.consumedAt) >= monthAgo);
  const monthlySpend = monthlyLogs.reduce((sum, log) => sum + (log.price ?? 0), 0);
  const monthlyCalories = monthlyLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Home Dashboard"
        description="최근 기록, 금주 시간, 월간 요약을 빠르게 확인합니다."
        actionLabel="기록 추가"
        onAction={onOpenAddLog}
      />

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          title="현재 금주 시간"
          value={latestLog ? formatTime(soberSeconds) : '0초'}
          description={latestLog ? latestLog.drinkName : '기록이 없으면 시작 시간이 표시됩니다.'}
        />
        <SummaryCard
          title="이번 달 지출"
          value={formatCurrency(monthlySpend)}
          description={`${monthlyLogs.length}건 기록 기준`}
          tone="accent"
        />
        <SummaryCard
          title="이번 주 기록"
          value={`${weeklyLogs.length}건`}
          description="주간 빈도 확인"
        />
        <SummaryCard
          title="이번 달 칼로리"
          value={`${monthlyCalories.toLocaleString()} kcal`}
          description="월간 누적 섭취 추정치"
          tone="warning"
        />
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-3 text-white/60">
          <Clock3 size={18} className="text-primary" />
          <p className="text-sm font-semibold">Sober Timer</p>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-black tracking-tight">{latestLog ? formatTime(soberSeconds) : '0초'}</p>
          <p className="text-xs text-white/40">가장 최근 음주 시점 기준으로 자동 계산됩니다.</p>
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeader title="Latest Record" description="가장 최근에 저장된 한 건을 보여줍니다." />
        {latestLog ? (
          <LogCard log={latestLog} onClick={() => onOpenLogDetail(latestLog.id)} />
        ) : (
          <EmptyState
            title="기록이 없습니다"
            description="첫 음주 기록을 추가하면 요약과 분석이 활성화됩니다."
            actionLabel="기록 추가"
            onAction={onOpenAddLog}
          />
        )}
      </div>
    </div>
  );
}
