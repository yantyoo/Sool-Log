import React from 'react';
import SectionHeader from '../../components/SectionHeader';
import GoalCard from '../../components/GoalCard';
import EmptyState from '../../components/EmptyState';
import { useAppData } from '../../state/AppDataContext';

export default function ProgressScreen() {
  const { goals, logs } = useAppData();

  const monthSpend = logs
    .filter((log) => new Date(log.consumedAt).getMonth() === new Date().getMonth())
    .reduce((sum, log) => sum + (log.price ?? 0), 0);

  const monthCalories = logs
    .filter((log) => new Date(log.consumedAt).getMonth() === new Date().getMonth())
    .reduce((sum, log) => sum + (log.calories ?? 0), 0);

  const weekCount = logs.filter((log) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(log.consumedAt) >= weekAgo;
  }).length;

  return (
    <div className="space-y-5">
      <SectionHeader title="Progress" description="목표 대비 현재 상태를 한눈에 확인합니다." />
      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              currentValue={goal.goalType === 'frequency' ? weekCount : goal.goalType === 'spending' ? monthSpend : goal.goalType === 'calorie' ? monthCalories : 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="진행할 목표가 없습니다" description="목표를 먼저 등록하면 프로그레스가 활성화됩니다." />
      )}
    </div>
  );
}

