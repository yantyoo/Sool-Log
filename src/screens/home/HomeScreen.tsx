import React, { useEffect, useState } from 'react';
import { Clock3, Flame, Wallet, Plus, ChevronRight, Activity, TrendingUp, Sparkles, BarChart2 } from 'lucide-react';
import { formatCurrency, formatTime } from '../../lib/utils';
import { useAppData } from '../../state/AppDataContext';
import LogCard from '../../components/LogCard';
import EmptyState from '../../components/EmptyState';
import { motion, AnimatePresence } from 'motion/react';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0, 0, 1] as const } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-24 px-1 overflow-x-hidden"
    >
      {/* Hero Section: Sober Status */}
      <motion.div variants={itemVariants} className="relative pt-6">
        {/* Dynamic Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" />
        
        <div className="card relative z-10 flex flex-col items-center text-center p-12 space-y-8">
          <div className="flex items-center gap-2.5 px-5 py-2 rounded-full glass border-white/[0.04] bg-white/[0.02]">
            <Sparkles size={14} className="text-primary-light animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/50">SOBER STATUS</span>
          </div>

          <div className="space-y-4">
            <motion.p 
              key={soberSeconds}
              initial={{ scale: 1.05, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-extrabold tracking-tighter text-white tabular-nums glow-primary"
            >
              {latestLog ? formatTime(soberSeconds) : '00:00:00'}
            </motion.p>
            <p className="text-[15px] text-white/40 font-semibold tracking-tight">
              마지막 기록으로부터 이만큼 정화되었어요
            </p>
          </div>

          <div className="w-full h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />

          <div className="w-full grid grid-cols-2 gap-10">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">THIS WEEK</p>
              <p className="text-xl font-extrabold text-white/90">{weeklyLogs.length}회 기록</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">STREAK</p>
              <p className="text-xl font-extrabold text-primary-light">0일 연속</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <motion.div variants={itemVariants} className="card p-7 space-y-5 group relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Wallet size={22} className="text-primary-light" />
          </div>
          <div className="space-y-1 relative z-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-white/30">월간 누적 지출액</p>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-black">{formatCurrency(monthlySpend).replace('₩', '')}</span>
               <span className="text-[10px] font-bold text-white/20 uppercase">KRW</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </motion.div>

        {/* You could add a different stat here or leave it empty/full-width. For now, let's keep it clean. */}
      </div>

      {/* Latest Activity Feed */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-primary-light glow-primary" />
             <h2 className="text-xl font-extrabold tracking-tight">최근 음주 기록</h2>
          </div>
          <button className="text-[11px] font-extrabold text-white/30 hover:text-white transition-colors flex items-center gap-1.5 tracking-wider uppercase">
            전체 보기 <ChevronRight size={14} />
          </button>
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
        className="card p-8 bg-linear-to-br from-primary/15 to-transparent border-primary/20 flex items-center justify-between group relative overflow-hidden"
      >
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-primary-light">
            <TrendingUp size={18} />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em]">WEEKLY INSIGHT</span>
          </div>
          <div className="space-y-1">
            <p className="text-[17px] font-extrabold text-white leading-snug">
               이번 주 {weeklyLogs.length}회 기록 중입니다.
            </p>
            <p className="text-white/40 text-sm font-medium">
               지난 주 대비 소비량이 20% 감소했어요. 잘하고 계시네요!
            </p>
          </div>
        </div>
        <div className="relative z-10">
           <div className="w-16 h-16 rounded-[22px] glass flex items-center justify-center text-primary-light font-black text-sm border-white/10 shadow-2xl">
             {Math.min(100, Math.round((weeklyLogs.length / 5) * 100))}%
           </div>
        </div>
        {/* Background Decorative Icon */}
        <BarChart2 size={140} className="absolute -right-8 -bottom-8 text-primary/5 group-hover:text-primary/10 transition-all duration-700 -rotate-12 group-hover:-rotate-6" />
      </motion.div>
    </motion.div>
  );
}
