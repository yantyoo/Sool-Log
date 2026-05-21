import React, { useMemo, useState } from 'react';
import { useAppData } from '../../state/AppDataContext';
import FilterBar from '../../components/FilterBar';
import LogCard from '../../components/LogCard';
import EmptyState from '../../components/EmptyState';
import { motion, AnimatePresence } from 'motion/react';
import type { LogFilterState } from '../../types/log';
import { isAfter, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { History, Search, SlidersHorizontal, CalendarRange, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LogListScreenProps {
  onOpenAddLog: () => void;
  onOpenLogDetail: (logId: string) => void;
}

export default function LogListScreen({ onOpenAddLog, onOpenLogDetail }: LogListScreenProps) {
  const { logs } = useAppData();
  const [filters, setFilters] = useState<LogFilterState>({ category: 'all', period: 'all', search: '' });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const filteredLogs = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(1);

    return logs.filter((log) => {
      if (selectedDate) {
        const logD = new Date(log.consumedAt);
        if (!isSameDay(logD, selectedDate)) return false;
      }
      if (filters.category !== 'all' && log.drinkCategory !== filters.category) return false;
      if (filters.period === 'week' && !isAfter(new Date(log.consumedAt), weekAgo)) return false;
      if (filters.period === 'month' && !isAfter(new Date(log.consumedAt), monthAgo)) return false;
      if (!search) return true;
      const haystack = [log.drinkName, log.standardDrinkName, log.brand, log.memo, log.foodPairing].join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }, [filters, logs, selectedDate]);

  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof filteredLogs> = {};
    filteredLogs.forEach((log) => {
      const date = new Date(log.consumedAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      let key = '';
      if (date.toDateString() === today.toDateString()) {
        key = '오늘';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = '어제';
      } else {
        key = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(log);
    });
    return Object.entries(groups);
  }, [filteredLogs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0, 0, 1] } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 px-1"
    >
      {/* Editorial Header Section */}
      <motion.div variants={itemVariants} className="space-y-2 px-2 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
             <History size={20} className="text-primary-light" />
          </div>
          <div className="space-y-0.5">
             <p className="text-[10px] font-black uppercase tracking-widest text-primary-light/80">아카이브 리포트</p>
             <h2 className="text-2xl font-black tracking-tight uppercase leading-none">음주 기록 내역</h2>
          </div>
        </div>
      </motion.div>

      {/* Calendar Card */}
      <motion.div variants={itemVariants} className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-primary-light border-white/5">
              <CalendarRange size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">캘린더 필터</p>
              <h3 className="font-extrabold text-sm text-white">이달의 음주 달력</h3>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/5 rounded-full p-1 border border-white/5">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-black tracking-widest min-w-[70px] text-center">{format(currentDate, 'yyyy. MM')}</span>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} 
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 pt-2">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="text-center text-[9px] font-black uppercase tracking-widest text-white/35 pb-2">{day}</div>
          ))}
          {calendarDays.map((day, i) => {
            const dayLogs = logs.filter(l => isSameDay(new Date(l.consumedAt), day));
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <button
                key={i}
                onClick={() => {
                  if (selectedDate && isSameDay(day, selectedDate)) {
                    setSelectedDate(null);
                  } else {
                    setSelectedDate(day);
                  }
                }}
                className={cn(
                  "h-11 flex flex-col items-center justify-center rounded-xl relative transition-all duration-300 cursor-pointer hover:bg-white/5",
                  !isCurrentMonth && "opacity-10",
                  isSelected && "bg-primary text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]",
                  !isSelected && isToday && "border border-primary text-primary-light",
                  !isSelected && !isToday && dayLogs.length > 0 && "bg-white/5 border border-white/10"
                )}
              >
                <span className={cn(
                  "text-xs font-extrabold z-10", 
                  isSelected ? "text-white" : (isToday ? "text-primary-light" : (isCurrentMonth ? "text-white/80" : "text-white/40"))
                )}>
                  {format(day, 'd')}
                </span>
                
                {dayLogs.length > 0 && !isSelected && (
                  <div className="absolute bottom-1 flex justify-center w-full">
                    <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Premium Search & Filter Bar */}
      <motion.div variants={itemVariants} className="space-y-4">
         {selectedDate && (
           <div className="flex items-center justify-between px-5 py-3.5 bg-primary/10 border border-primary/20 rounded-2xl text-xs font-bold text-primary-light mx-1">
             <span className="flex items-center gap-1.5">
               📅 {format(selectedDate, 'yyyy년 MM월 dd일')} 기록만 필터링 중
             </span>
             <button 
               onClick={() => setSelectedDate(null)}
               className="flex items-center gap-1 hover:text-white active:scale-95 transition-all text-white/50"
             >
               필터 해제 <X size={14} />
             </button>
           </div>
         )}

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
            <div className="flex-none p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/40">
               <SlidersHorizontal size={16} />
            </div>
            <FilterBar value={filters} onChange={setFilters} />
         </div>
      </motion.div>

      {/* Timeline List */}
      <div className="space-y-8 px-1 relative">
        <AnimatePresence mode="popLayout">
          {groupedLogs.length > 0 ? (
            groupedLogs.map(([groupName, groupItems]) => (
              <div key={groupName} className="space-y-4">
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-light shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
                  <h3 className="text-xs font-black text-white/50 tracking-wider">{groupName}</h3>
                  <span className="text-[10px] text-white/20 font-bold">({groupItems.length}건)</span>
                </div>
                
                {/* Visual Timeline Connector Line */}
                <div className="space-y-4 pl-4 border-l border-white/5 ml-3">
                  {groupItems.map((log) => (
                    <motion.div 
                      key={log.id} 
                      variants={itemVariants}
                      layout
                      className="relative z-10"
                    >
                      <LogCard log={log} onClick={() => onOpenLogDetail(log.id)} />
                    </motion.div>
                  ))}
                </div>
              </div>
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
