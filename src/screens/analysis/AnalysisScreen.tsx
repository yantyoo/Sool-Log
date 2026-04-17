import React from 'react';
import { formatCurrency } from '../../lib/utils';
import { useAppData } from '../../state/AppDataContext';
import SectionHeader from '../../components/SectionHeader';
import SummaryCard from '../../components/SummaryCard';
import ProgressIndicator from '../../components/ProgressIndicator';
import EmptyState from '../../components/EmptyState';

export default function AnalysisScreen() {
  const { logs } = useAppData();

  if (logs.length === 0) {
    return (
      <div className="space-y-5">
        <SectionHeader title="Analysis" description="기록이 쌓이면 소비 패턴이 보입니다." />
        <EmptyState title="분석할 기록이 없습니다" description="기록이 누적되면 지출, 칼로리, 음주 패턴을 확인할 수 있습니다." />
      </div>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyLogs = logs.filter((log) => new Date(log.consumedAt) >= monthStart);
  const totalSpend = monthlyLogs.reduce((sum, log) => sum + (log.price ?? 0), 0);
  const totalCalories = monthlyLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0);

  const categoryCount = monthlyLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.drinkCategory] = (acc[log.drinkCategory] ?? 0) + 1;
    return acc;
  }, {});

  const weekdayCount = monthlyLogs.reduce<Record<number, number>>((acc, log) => {
    const day = new Date(log.consumedAt).getDay();
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});

  const categories = Object.entries(categoryCount) as Array<[string, number]>;
  categories.sort((a, b) => b[1] - a[1]);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'].map((label, index) => ({
    label,
    value: weekdayCount[index] ?? 0,
  }));
  const maxWeekday = Math.max(1, ...weekdays.map((item) => item.value));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Analysis"
        description="지출, 칼로리, 종류 비율, 요일 패턴을 가볍게 읽을 수 있게 구성합니다."
      />

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard title="월간 지출" value={formatCurrency(totalSpend)} />
        <SummaryCard title="월간 칼로리" value={`${totalCalories.toLocaleString()} kcal`} />
      </div>

      <div className="card space-y-4">
        <p className="text-sm font-bold">Drink Type Ratio</p>
        <div className="space-y-3">
          {categories.length > 0 ? categories.map(([category, count]) => {
            const percent = (count / monthlyLogs.length) * 100;
            return (
              <ProgressIndicator
                key={category}
                label={category}
                value={count}
                max={monthlyLogs.length}
                subtitle={`${count}건 · ${Math.round(percent)}%`}
              />
            );
          }) : <p className="text-sm text-white/40">이번 달 기록이 없습니다.</p>}
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-sm font-bold">Weekday Pattern</p>
        <div className="space-y-3">
          {weekdays.map((item) => (
            <ProgressIndicator
              key={item.label}
              label={item.label}
              value={item.value}
              max={maxWeekday}
              subtitle={`${item.value}건`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
