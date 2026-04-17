import React, { useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import GoalCard from '../../components/GoalCard';
import EmptyState from '../../components/EmptyState';
import { useAppData } from '../../state/AppDataContext';
import type { GoalFormValues } from '../../types/goal';

interface GoalSettingScreenProps {
  onOpenProgress: () => void;
}

const emptyGoalForm: GoalFormValues = {
  title: '',
  goalType: 'frequency',
  period: 'weekly',
  targetValue: '3',
  unit: '회',
  warningThresholdPercent: '80',
};

export default function GoalSettingScreen({ onOpenProgress }: GoalSettingScreenProps) {
  const { goals, logs, saveGoal, toggleGoalEnabled } = useAppData();
  const [form, setForm] = useState<GoalFormValues>(emptyGoalForm);

  const currentWeekCount = logs.filter((log) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(log.consumedAt) >= weekAgo;
  }).length;
  const currentMonthSpend = logs
    .filter((log) => new Date(log.consumedAt).getMonth() === new Date().getMonth())
    .reduce((sum, log) => sum + (log.price ?? 0), 0);
  const currentMonthCalories = logs
    .filter((log) => new Date(log.consumedAt).getMonth() === new Date().getMonth())
    .reduce((sum, log) => sum + (log.calories ?? 0), 0);

  const submit = () => {
    if (!form.title.trim()) return;
    saveGoal(form);
    setForm(emptyGoalForm);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Habit Management"
        description="주간 빈도, 지출, 칼로리, 금주 기간 같은 핵심 목표를 관리합니다."
        actionLabel="Progress"
        onAction={onOpenProgress}
      />

      <div className="card space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Goal Setting</p>
        <label className="space-y-2 block">
          <span className="text-xs text-white/45">목표 이름</span>
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none" placeholder="예: 주 3회 이하" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-2 block">
            <span className="text-xs text-white/45">목표 유형</span>
            <select value={form.goalType} onChange={(event) => setForm({ ...form, goalType: event.target.value as GoalFormValues['goalType'] })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none">
              <option value="frequency">Frequency</option>
              <option value="spending">Spending</option>
              <option value="calorie">Calorie</option>
              <option value="sober_days">Sober Days</option>
            </select>
          </label>
          <label className="space-y-2 block">
            <span className="text-xs text-white/45">주기</span>
            <select value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value as GoalFormValues['period'] })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-2 block">
            <span className="text-xs text-white/45">목표 값</span>
            <input value={form.targetValue} onChange={(event) => setForm({ ...form, targetValue: event.target.value })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none" />
          </label>
          <label className="space-y-2 block">
            <span className="text-xs text-white/45">단위</span>
            <select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value as GoalFormValues['unit'] })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none">
              <option value="회">회</option>
              <option value="원">원</option>
              <option value="kcal">kcal</option>
              <option value="일">일</option>
            </select>
          </label>
        </div>
        <label className="space-y-2 block">
          <span className="text-xs text-white/45">경고 임계치(%)</span>
          <input value={form.warningThresholdPercent} onChange={(event) => setForm({ ...form, warningThresholdPercent: event.target.value })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none" />
        </label>
        <button onClick={submit} className="btn-primary w-full py-4">저장</button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {goals.length > 0 ? goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            currentValue={goal.goalType === 'frequency' ? currentWeekCount : goal.goalType === 'spending' ? currentMonthSpend : goal.goalType === 'calorie' ? currentMonthCalories : 0}
            onToggle={() => toggleGoalEnabled(goal.id)}
          />
        )) : (
          <EmptyState title="목표가 없습니다" description="목표를 만들면 진행 상태와 경고 상태를 확인할 수 있습니다." />
        )}
      </div>
    </div>
  );
}

