import React, { useEffect, useState, useMemo } from 'react';
import { Flame, Wallet, Plus, ChevronRight, Activity, TrendingUp, Sparkles, BarChart2, Heart, Award } from 'lucide-react';
import { formatCurrency, formatTime } from '../../lib/utils';
import { useAppData } from '../../state/AppDataContext';
import LogCard from '../../components/LogCard';
import EmptyState from '../../components/EmptyState';
import { motion, AnimatePresence } from 'motion/react';
import type { LogFormValues } from '../../types/log';

interface HomeScreenProps {
  onOpenAddLog: () => void;
  onOpenLogDetail: (logId: string) => void;
  onQuickLog?: (form: LogFormValues) => void;
}

const quickPresets = [
  { label: '🍶 소주 1병', category: 'soju', name: '소주', abv: '16.5', volume: '360', price: '5000', calories: '400' },
  { label: '🍺 생맥주 500', category: 'beer', name: '생맥주', abv: '4.5', volume: '500', price: '4500', calories: '185' },
  { label: '🍹 하이볼 1잔', category: 'highball', name: '하이볼', abv: '7.0', volume: '350', price: '8000', calories: '150' },
  { label: '🍷 와인 1잔', category: 'wine', name: '레드 와인', abv: '13.0', volume: '150', price: '9000', calories: '125' },
];

export default function HomeScreen({ onOpenAddLog, onOpenLogDetail, onQuickLog }: HomeScreenProps) {
  const { logs, healthProfile } = useAppData();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const latestLog = logs[0];
  const latestDate = latestLog ? new Date(latestLog.consumedAt).getTime() : null;
  const soberSeconds = latestDate ? Math.max(0, Math.floor((Date.now() - latestDate) / 1000)) : 0;

  // Personalized Alcohol Metabolism (Widmark Formula variables)
  const genderFactor = healthProfile?.gender === 'female' ? 6.0 : 7.5;
  const personalizedFactor = healthProfile?.weight 
    ? (healthProfile.weight * (healthProfile.gender === 'female' ? 0.085 : 0.1)) 
    : genderFactor;

  const abvVal = latestLog?.abv ?? 0;
  const volVal = latestLog?.volumeMl ?? 0;
  const alcoholGrams = volVal * (abvVal / 100) * 0.789;
  const personalizedRecoveryHours = alcoholGrams / personalizedFactor;
  const isFullySober = soberSeconds >= personalizedRecoveryHours * 3600;

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(1);

  const weeklyLogs = logs.filter((log) => new Date(log.consumedAt) >= weekAgo);
  const monthlyLogs = logs.filter((log) => new Date(log.consumedAt) >= monthAgo);
  const monthlySpend = monthlyLogs.reduce((sum, log) => sum + (log.price ?? 0), 0);
  const monthlyCalories = monthlyLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0);

  // Sober Milestone calculation
  const getMilestoneInfo = (seconds: number) => {
    if (seconds < 12 * 3600) return { target: 12 * 3600, label: '12시간 해독 (혈중 알코올 분해)' };
    if (seconds < 24 * 3600) return { target: 24 * 3600, label: '24시간 해독 (위장기관 기능 보호)' };
    if (seconds < 72 * 3600) return { target: 72 * 3600, label: '72시간 해독 (간 세포 정상 재생)' };
    return { target: 168 * 3600, label: '7일 해독 (전신 피로 회복)' };
  };

  const milestone = getMilestoneInfo(soberSeconds);
  
  const progressPercent = useMemo(() => {
    if (!latestLog) return 0;
    if (!isFullySober && personalizedRecoveryHours > 0) {
      return Math.min(100, (soberSeconds / (personalizedRecoveryHours * 3600)) * 100);
    }
    return Math.min(100, (soberSeconds / milestone.target) * 100);
  }, [latestLog, soberSeconds, isFullySober, personalizedRecoveryHours, milestone.target]);
  
  // Calculate sober streak in days
  const getSoberStreak = () => {
    if (logs.length === 0) return 0;
    const lastLogDate = new Date(logs[0].consumedAt);
    lastLogDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = today.getTime() - lastLogDate.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };
  const streak = getSoberStreak();

  const handlePresetClick = (preset: typeof quickPresets[0]) => {
    if (!onQuickLog) return;
    
    // Create pre-filled LogFormValues
    const localISOString = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const form: LogFormValues = {
      drinkCategory: preset.category as any,
      consumedAt: localISOString,
      drinkName: preset.name,
      standardDrinkId: '',
      standardDrinkName: '',
      brand: '',
      abv: preset.abv,
      volumeMl: preset.volume,
      price: preset.price,
      calories: preset.calories,
      foodPairing: '',
      memo: '',
      rating: '3',
    };
    onQuickLog(form);
  };

  // Circular progress dimensions
  const radius = 85;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0, 0, 1] } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-24 px-1 overflow-x-hidden"
    >
      {/* Sober Status Radial Ring Dashboard */}
      <motion.div variants={itemVariants} className="relative pt-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[90px] pointer-events-none animate-pulse-glow" />
        
        <div className="card relative z-10 flex flex-col items-center p-10 space-y-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/[0.04] bg-white/[0.02]">
            <Sparkles size={13} className="text-primary-light animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">배터리 및 해독 상태</span>
          </div>

          {/* Radial Sober Ring */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <defs>
                <linearGradient id="soberGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <circle
                stroke="rgba(255, 255, 255, 0.03)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={112}
                cy={112}
              />
              <motion.circle
                stroke="url(#soberGlowGradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={112}
                cy={112}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
                        {/* Center Digital Clock */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1.5 pt-2">
              <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">마지막 음주 이후 경과</span>
              <motion.p 
                key={soberSeconds}
                className="text-4xl font-extrabold tracking-tighter text-white tabular-nums glow-primary font-sans"
              >
                {latestLog ? formatTime(soberSeconds) : '00:00:00'}
              </motion.p>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/20 text-primary-light font-black">
                {latestLog ? (isFullySober ? `완전 해독 완료 🔋` : `알코올 해독 중 (${Math.round(progressPercent)}%) ⚡`) : '대기 중'}
              </span>
            </div>
          </div>

          <div className="text-center space-y-1 px-4">
            <p className="text-[13px] text-white/40 font-semibold tracking-tight">
              {latestLog ? (
                isFullySober 
                  ? `🟢 신체 리필 완료! 안전하고 즐겁게 즐길 준비 완료! 🍻` 
                  : `⚠️ 알코올 분해 중 (완전 해독까지 약 ${Math.max(0, parseFloat((personalizedRecoveryHours - soberSeconds/3600).toFixed(1)))}시간 소요)`
              ) : '음주 기록을 추가하고 안전하게 즐겨 보세요! 🎉'}
            </p>
          </div>

          <div className="w-full h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />

          <div className="w-full grid grid-cols-2 gap-10 text-center">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">이번 주 음주</p>
              <p className="text-lg font-black text-white">{weeklyLogs.length}회 기록</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">맑은 정신 유지</p>
              <p className="text-lg font-black text-primary-light flex items-center justify-center gap-1">
                <Award size={16} className="text-primary-light" />
                <span>{streak}일째 맑음</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Log Presets Section */}
      {onQuickLog && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-light glow-primary" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40">간편 퀵 기록</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quickPresets.map((preset) => (
              <motion.button
                key={preset.label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePresetClick(preset)}
                className="h-16 rounded-2xl glass border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.04] flex items-center justify-center gap-2.5 px-4 text-xs font-bold text-white/80 active:scale-95 transition-all text-left"
              >
                <span className="text-base leading-none">{preset.label.split(' ')[0]}</span>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white">{preset.label.split(' ').slice(1).join(' ')}</span>
                  <span className="text-[9px] text-white/30 font-medium">{preset.volume}ml · {preset.abv}%</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <motion.div variants={itemVariants} className="card !p-4 sm:!p-6 flex items-center justify-between group relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shrink-0">
              <Wallet size={18} className="text-primary-light sm:hidden" />
              <Wallet size={22} className="text-primary-light hidden sm:block" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-white/30 truncate">월간 누적 지출액</p>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-lg sm:text-2xl font-black tracking-tight">{formatCurrency(monthlySpend).replace('₩', '')}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase">KRW</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </motion.div>

        <motion.div variants={itemVariants} className="card !p-4 sm:!p-6 flex items-center justify-between group relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shrink-0">
              <Flame size={18} className="text-primary-light sm:hidden" />
              <Flame size={22} className="text-primary-light hidden sm:block" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-white/30 truncate">월간 섭취 칼로리</p>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-lg sm:text-2xl font-black tracking-tight">{monthlyCalories}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase">KCAL</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </motion.div>
      </div>

      {/* Latest Activity Feed */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-light glow-primary" />
            <h2 className="text-xl font-extrabold tracking-tight">최근 음주 기록</h2>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {latestLog ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="hover:translate-y-[-4px] transition-transform duration-300"
              >
                <LogCard log={latestLog} onClick={() => onOpenLogDetail(latestLog.id)} />
              </motion.div>
            ) : (
              <EmptyState
                title="기록된 데이터가 없습니다"
                description="오늘의 첫 번째 한 잔을 기록하고 스마트하게 관리해보세요."
                actionLabel="지금 기록하기"
                onAction={onOpenAddLog}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Premium Insight Banner */}
      <motion.div 
        variants={itemVariants} 
        className="card p-6 bg-linear-to-br from-primary/10 to-transparent border-primary/20 flex items-center justify-between group relative overflow-hidden"
      >
        <div className="space-y-2 relative z-10 pr-4">
          <div className="flex items-center gap-2 text-primary-light">
            <TrendingUp size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">주간 에디토리얼</span>
          </div>
          <div className="space-y-0.5">
            <p className="text-[16px] font-extrabold text-white leading-snug">
              이번 주 {weeklyLogs.length}회 기록 중입니다.
            </p>
            <p className="text-white/40 text-xs font-medium">
              꾸준한 기록은 안전하고 즐거운 음주 문화를 만드는 첫걸음입니다.
            </p>
          </div>
        </div>
        <div className="relative z-10 shrink-0">
          <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-primary-light font-black text-xs border-white/10 shadow-2xl">
            {Math.min(100, Math.round((weeklyLogs.length / 5) * 100))}%
          </div>
        </div>
        <BarChart2 size={100} className="absolute -right-6 -bottom-6 text-primary/5 group-hover:text-primary/10 transition-all duration-700 -rotate-12 group-hover:-rotate-6" />
      </motion.div>
    </motion.div>
  );
}
