import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, LogOut, ChevronLeft, ChevronRight, Award, History, X, User as UserIcon, Bell, Database, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn, formatCurrency } from '../lib/utils';

export default function MyPage() {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<any[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'logs'), orderBy('consumedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/logs`);
    });
    return unsubscribe;
  }, [user]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const totalSpend = logs.reduce((acc, l) => acc + (l.price || 0), 0);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="space-y-10 pb-32"
      >
        {/* Header Area */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-black mb-1">PROFILE</p>
            <h2 className="text-2xl font-black uppercase tracking-tighter">마이페이지</h2>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-12 h-12 rounded-full glass flex items-center justify-center text-white/70 hover:text-white active:scale-90 transition-all cursor-pointer z-50"
          >
            <Settings size={22} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="card p-8 flex flex-col items-center space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-700" />
          
          <div className="w-28 h-28 rounded-[40px] glass p-1.5 shadow-2xl relative z-10">
             <div className="w-full h-full rounded-[32px] overflow-hidden bg-white/5 flex items-center justify-center">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <Award size={40} className="text-white/20" />
               )}
             </div>
          </div>
          <div className="text-center relative z-10 space-y-1">
              <h3 className="text-3xl font-black tracking-tight">{user?.displayName || 'User'}</h3>
              <p className="text-[11px] text-white/50 font-bold tracking-widest">{user?.email}</p>
              <div className="pt-2">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  SOOL-LOG ROOKIE
                </span>
              </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-6 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-white/[0.05] to-transparent">
             <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] text-center">TOTAL RECORDS</div>
             <p className="text-2xl font-black text-white">{logs.length}<span className="text-sm font-bold text-white/40 ml-1">회</span></p>
          </div>
          <div className="card p-6 flex flex-col items-center justify-center space-y-2 bg-gradient-to-bl from-white/[0.05] to-transparent">
             <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] text-center">TOTAL COST</div>
             <p className="text-2xl font-black text-white">{formatCurrency(totalSpend).replace('₩','')}<span className="text-sm font-bold text-white/40 ml-1">KRW</span></p>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary">
                <History size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">HISTORY</p>
                <h3 className="font-black text-lg">기록 달력</h3>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 rounded-full p-1 border border-white/5">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"><ChevronLeft size={18} /></button>
              <span className="text-xs font-black uppercase tracking-widest min-w-[80px] text-center">{format(currentDate, 'yyyy . MM')}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center text-[8px] font-black uppercase tracking-widest text-white/30 pb-3">{day}</div>
            ))}
            {calendarDays.map((day, i) => {
              const dayLogs = logs.filter(l => isSameDay(new Date(l.consumedAt), day));
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, monthStart);
              
              return (
                <div
                  key={i}
                  className={cn(
                    "h-12 flex flex-col items-center justify-center rounded-[14px] relative transition-all duration-300",
                    !isCurrentMonth && "opacity-10",
                    isToday && "bg-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]",
                    !isToday && dayLogs.length > 0 && "bg-white/5 border border-white/10"
                  )}
                >
                  <span className={cn(
                    "text-[13px] font-bold z-10", 
                    isToday ? "text-white" : (isCurrentMonth ? "text-white/80" : "text-white/40")
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  {dayLogs.length > 0 && !isToday && (
                    <div className="absolute bottom-1.5 flex justify-center w-full">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Settings Modal (Half Sheet) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-surface rounded-t-[40px] flex flex-col overflow-hidden border border-white/10 shadow-2xl pb-safe"
            >
              <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-xl font-black">설정</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all cursor-pointer z-50">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-3 overflow-y-auto max-h-[70vh]">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-2 pb-1">ACCOUNT</p>
                <SettingsButton icon={UserIcon} label="내 프로필 수정" />
                <SettingsButton icon={Bell} label="푸시 알림 설정" />
                
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-2 pb-1 pt-4">DATA & PRIVACY</p>
                <SettingsButton icon={Database} label="데이터 백업 및 내보내기" />
                <SettingsButton icon={Trash2} label="모든 기록 초기화" danger />
                
                <div className="pt-6">
                  <button onClick={logout} className="w-full h-14 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500 font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                    <LogOut size={18} /> 로그아웃
                  </button>
                </div>
                
                <div className="pt-8 pb-4 text-center">
                  <p className="text-[10px] font-bold text-white/20 tracking-widest uppercase">SOOL-LOG v1.1.0</p>
                  <p className="text-[9px] font-medium text-white/10 mt-1">Design with Google Stitch MCP</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function SettingsButton({ icon: Icon, label, danger = false }: { icon: any, label: string, danger?: boolean }) {
  return (
    <button className="w-full h-16 px-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.06] active:scale-[0.99] transition-all group">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", danger ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/60 group-hover:text-primary group-hover:bg-primary/10 transition-colors")}>
          <Icon size={18} />
        </div>
        <span className={cn("font-bold text-[15px]", danger ? "text-red-400" : "text-white/80")}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-white/20 group-hover:text-white/40 transition-colors" />
    </button>
  );
}
