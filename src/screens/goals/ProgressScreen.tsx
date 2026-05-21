import React, { useState, useEffect } from 'react';
import SectionHeader from '../../components/SectionHeader';
import GoalCard from '../../components/GoalCard';
import EmptyState from '../../components/EmptyState';
import { useAppData } from '../../state/AppDataContext';
import type { GoalFormValues, HabitGoal } from '../../types/goal';
import { ChevronRight, Plus, X, Sparkles, Goal, CalendarRange, BellRing, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConfettiCelebration from '../../components/ConfettiCelebration';

const emptyGoalForm: GoalFormValues = {
  title: '',
  goalType: 'frequency',
  period: 'weekly',
  targetValue: '3',
  unit: '회',
  warningThresholdPercent: '80',
};

const GOAL_PRESETS = [
  { title: '주 2회 이하 음주', goalType: 'frequency', period: 'weekly', targetValue: '2', unit: '회', warningThresholdPercent: '80' },
  { title: '월 주류 지출 10만원', goalType: 'spending', period: 'monthly', targetValue: '100000', unit: '원', warningThresholdPercent: '80' },
  { title: '일 칼로리 400kcal', goalType: 'calorie', period: 'weekly', targetValue: '400', unit: 'kcal', warningThresholdPercent: '90' },
  { title: '5일 연속 맑은 정신 유지', goalType: 'sober_days', period: 'weekly', targetValue: '5', unit: '일', warningThresholdPercent: '100' },
];

export default function ProgressScreen() {
  const { goals, logs, saveGoal, toggleGoalEnabled } = useAppData();
  const [form, setForm] = useState<GoalFormValues>(emptyGoalForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const getGoalCurrentValue = (goal: HabitGoal) => {
    const isWeekly = goal.period === 'weekly';
    
    if (goal.goalType === 'sober_days') {
      if (logs.length === 0) return 0;
      const lastLogDate = new Date(logs[0].consumedAt);
      lastLogDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = today.getTime() - lastLogDate.getTime();
      return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }

    const periodLogs = logs.filter((log) => {
      const logDate = new Date(log.consumedAt);
      if (isWeekly) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      } else {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        return logDate >= monthStart;
      }
    });

    if (goal.goalType === 'frequency') {
      return periodLogs.length;
    }
    if (goal.goalType === 'spending') {
      return periodLogs.reduce((sum, log) => sum + (log.price ?? 0), 0);
    }
    if (goal.goalType === 'calorie') {
      return periodLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0);
    }
    return 0;
  };

  useEffect(() => {
    const hasAchieved = goals.some((goal) => {
      if (!goal.enabled) return false;
      const current = getGoalCurrentValue(goal);
      return goal.goalType === 'sober_days' && current >= goal.targetValue;
    });

    if (hasAchieved) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [goals, logs]);

  const handleApplyPreset = (preset: typeof GOAL_PRESETS[0]) => {
    setForm(preset as GoalFormValues);
  };

  const handleGoalTypeChange = (type: GoalFormValues['goalType']) => {
    let unit: GoalFormValues['unit'] = '회';
    let target = '3';
    
    if (type === 'spending') {
      unit = '원';
      target = '100000';
    } else if (type === 'calorie') {
      unit = 'kcal';
      target = '500';
    } else if (type === 'sober_days') {
      unit = '일';
      target = '7';
    }
    
    setForm(prev => ({
      ...prev,
      goalType: type,
      unit,
      targetValue: target
    }));
  };

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await saveGoal(form);
      setForm(emptyGoalForm);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to save goal', error);
    } finally {
      setSaving(false);
    }
  };

  const achievedGoalsList = goals.filter((goal) => {
    if (!goal.enabled) return false;
    const current = getGoalCurrentValue(goal);
    return goal.goalType === 'sober_days' && current >= goal.targetValue;
  });

  return (
    <div className="space-y-6 pb-20 px-1">
      {showConfetti && <ConfettiCelebration />}

      {achievedGoalsList.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 bg-gradient-to-r from-amber-500/20 via-primary/20 to-transparent border-amber-500/30 flex items-center gap-4 relative overflow-hidden group shadow-lg shadow-amber-500/5 animate-pulse"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <Trophy size={24} />
          </div>
          <div className="space-y-0.5 flex-1">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Goal Completed!</span>
            <h3 className="text-sm font-black text-white leading-tight">절주 목표를 멋지게 달성했습니다! 🏆</h3>
            <p className="text-[10px] text-white/50">맑은 정신 유지 목표를 끝까지 완수하여 신체 밸런스를 지켜냈습니다.</p>
          </div>
          <button 
            onClick={() => {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 5000);
            }} 
            className="px-3.5 py-2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors active:scale-95 shrink-0"
          >
            축하받기 🎉
          </button>
        </motion.div>
      )}
      {/* Header and Toggle Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Goal size={20} className="text-primary-light" />
            <span>목표 및 진행 상황</span>
          </h2>
          <p className="text-xs text-white/40">나만의 주량 페이스와 안전 목표를 관리합니다.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
            showAddForm 
              ? 'bg-white/5 border-white/10 text-white/50' 
              : 'btn-primary'
          }`}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="card p-6 space-y-5 border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-2 text-primary-light">
                <Sparkles size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">새 목표 등록</span>
              </div>

              {/* Goal Presets */}
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold text-white/30 tracking-widest uppercase">목표 프리셋 적용</p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-2 rounded-xl glass border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.05] text-[11px] font-bold text-white/70 active:scale-95 transition-all"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/5" />

              <div className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest ml-1">목표 이름</span>
                  <input 
                    value={form.title} 
                    onChange={(event) => setForm({ ...form, title: event.target.value })} 
                    className="input-field h-14" 
                    placeholder="예: 주말에만 마시기, 주 2회 이하" 
                  />
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest ml-1">목표 유형</span>
                    <div className="relative">
                      <select 
                        value={form.goalType} 
                        onChange={(event) => handleGoalTypeChange(event.target.value as any)} 
                        className="select-field h-14"
                      >
                        <option value="frequency">음주 빈도</option>
                        <option value="spending">주류 지출</option>
                        <option value="calorie">칼로리 소모</option>
                        <option value="sober_days">맑은 정신(해독) 유지 일수</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" size={16} />
                    </div>
                  </label>
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest ml-1">주기</span>
                    <div className="relative">
                      <select 
                        value={form.period} 
                        onChange={(event) => setForm({ ...form, period: event.target.value as any })} 
                        className="select-field h-14"
                      >
                        <option value="weekly">주간</option>
                        <option value="monthly">월간</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" size={16} />
                    </div>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest ml-1">목표 값</span>
                    <input 
                      type="number" 
                      value={form.targetValue} 
                      onChange={(event) => setForm({ ...form, targetValue: event.target.value })} 
                      className="input-field h-14 text-center font-bold" 
                    />
                  </label>
                  <label className="space-y-2 block">
                    <span className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest ml-1">단위</span>
                    <div className="relative">
                      <select 
                        value={form.unit} 
                        onChange={(event) => setForm({ ...form, unit: event.target.value as any })} 
                        className="select-field h-14"
                      >
                        <option value="회">회</option>
                        <option value="원">원</option>
                        <option value="kcal">kcal</option>
                        <option value="일">일</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" size={16} />
                    </div>
                  </label>
                </div>
                
                <label className="space-y-2 block">
                  <span className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <BellRing size={12} className="text-amber-400" />
                    <span>경고 알림 임계치 (%)</span>
                  </span>
                  <input 
                    type="number" 
                    value={form.warningThresholdPercent} 
                    onChange={(event) => setForm({ ...form, warningThresholdPercent: event.target.value })} 
                    className="input-field h-14 text-center font-bold" 
                  />
                </label>
                
                <button 
                  onClick={submit} 
                  disabled={saving || !form.title.trim()}
                  className="btn-primary w-full h-14 text-sm"
                >
                  {saving ? '목표 저장 중...' : '목표 등록 및 시작'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Cards List */}
      <div className="space-y-4">
        {goals.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <CalendarRange size={14} className="text-white/35" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35">현재 진행 중인 안전 목표</p>
            </div>
            
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                currentValue={getGoalCurrentValue(goal)}
                onToggle={() => toggleGoalEnabled(goal.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="활성화된 목표가 없습니다" 
            description="상단의 [+] 버튼을 클릭하거나 퀵 프리셋을 사용하여 자신만의 첫 번째 안전 목표를 세워보세요." 
            actionLabel="목표 생성하기"
            onAction={() => setShowAddForm(true)}
          />
        )}
      </div>
    </div>
  );
}
