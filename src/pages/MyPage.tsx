import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, LogOut, ChevronLeft, ChevronRight, Award, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function MyPage() {
  const { user, dbUser, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'logs'), where('userUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'logs');
    });
    return unsubscribe;
  }, [user]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const stats = [
    { label: '누적 기록', value: logs.length + '회' },
    { label: '누적 지출', value: '₩' + logs.reduce((acc, l) => acc + (l.cost || 0), 0).toLocaleString() },
    { label: '보유 배지', value: '3개' },
  ];

  return (
    <div className="p-10 space-y-10 pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tighter">프로필</h2>
        <div className="flex space-x-3">
            <button className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white transition-colors"><Settings size={20} /></button>
            <button onClick={logout} className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 hover:bg-red-500/20 transition-colors"><LogOut size={20} /></button>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-5">
        <div className="w-28 h-28 rounded-[48px] glass border-4 border-white/5 shadow-2xl overflow-hidden p-1">
           <div className="w-full h-full rounded-[40px] overflow-hidden bg-white/5 border border-white/10">
             {user?.photoURL ? (
               <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-white/20">
                 <Award size={48} />
               </div>
             )}
           </div>
        </div>
        <div className="text-center">
            <h3 className="text-2xl font-black">{user?.displayName || 'User'}</h3>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1.5 flex items-center justify-center">
               <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
               술로그 루키
            </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-4 flex flex-col items-center justify-center space-y-2 !bg-black/20">
             <div className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none text-center">{s.label}</div>
             <p className="text-lg font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card space-y-8 !bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History size={20} className="text-primary" />
            <h3 className="font-bold uppercase tracking-widest text-sm">기록 달력</h3>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1 hover:bg-white/5 rounded-lg"><ChevronLeft size={20} /></button>
            <span className="text-xs font-black uppercase tracking-widest min-w-[100px] text-center">{format(currentDate, 'yyyy . MM')}</span>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1 hover:bg-white/5 rounded-lg"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="text-center text-[9px] font-black text-white/20 py-2">{day}</div>
          ))}
          {calendarDays.map((day, i) => {
            const dayLogs = logs.filter(l => isSameDay(new Date(l.consumedAt), day));
            return (
              <div
                key={i}
                className={cn(
                  "h-14 flex flex-col items-center justify-center rounded-2xl relative transition-all",
                  !isSameMonth(day, monthStart) && "opacity-10",
                  isSameDay(day, new Date()) && "bg-primary text-black"
                )}
              >
                <span className={cn("text-xs font-black", isSameDay(day, new Date()) ? "text-black" : "text-white/60")}>
                  {format(day, 'd')}
                </span>
                {dayLogs.length > 0 && !isSameDay(day, new Date()) && (
                  <div className="absolute bottom-2 flex -space-x-1">
                    {dayLogs.slice(0, 3).map((l, idx) => (
                      <div key={idx} className="w-1.5 h-1.5 bg-primary rounded-full border border-black/40"></div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
