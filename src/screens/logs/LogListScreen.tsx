import React, { useMemo, useState } from 'react';
import { useAppData } from '../../state/AppDataContext';
import FilterBar from '../../components/FilterBar';
import LogCard from '../../components/LogCard';
import EmptyState from '../../components/EmptyState';
import { motion, AnimatePresence } from 'motion/react';
import type { LogFilterState } from '../../types/log';
import { isAfter } from 'date-fns';
import { Sparkles, History, Search, SlidersHorizontal } from 'lucide-react';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0, 0, 1] as const } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20 px-1"
    >
      {/* Editorial Header Section */}
      <motion.div variants={itemVariants} className="space-y-3 px-2 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
             <History size={20} className="text-primary-light" />
          </div>
          <div className="space-y-0.5">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-light/80">Archived Rituals</p>
             <h2 className="text-3xl font-extrabold tracking-tighter uppercase leading-none">History</h2>
          </div>
        </div>
      </motion.div>

      {/* Premium Search & Filter Bar */}
      <motion.div variants={itemVariants} className="space-y-6">
         <div className="relative group px-1">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
               <Search size={18} className="text-white/20 group-focus-within:text-primary-light transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="기록 검색 (이름, 메모, 안주...)" 
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full h-16 bg-white/[0.03] border border-white/[0.05] rounded-[24px] pl-16 pr-6 text-sm font-bold text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.06] focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all" 
            />
         </div>
         
         <div className="flex items-center gap-3 overflow-x-auto pb-2 px-1 no-scrollbar">
            <div className="flex-none p-3 rounded-xl bg-white/5 border border-white/10 text-white/40">
               <SlidersHorizontal size={16} />
            </div>
            <FilterBar value={filters} onChange={setFilters} />
         </div>
      </motion.div>

      {/* Timeline List */}
      <div className="space-y-5 px-1 relative">
        {/* Decorative Timeline Line */}
        <div className="absolute left-9 top-0 bottom-0 w-px bg-linear-to-b from-primary/20 via-white/5 to-transparent pointer-events-none z-0" />

        <AnimatePresence mode="popLayout">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <motion.div 
                key={log.id} 
                variants={itemVariants}
                layout
                className="relative z-10"
              >
                <LogCard log={log} onClick={() => onOpenLogDetail(log.id)} />
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="py-20 relative z-10">
              <EmptyState
                title="기록을 찾을 수 없습니다"
                description="검색 조건에 맞는 데이터가 없습니다. 필터를 초기화하거나 새로운 기록을 남겨보세요."
                actionLabel="기록 추가하기"
                onAction={onOpenAddLog}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
