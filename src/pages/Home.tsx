import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingDown, Wallet, Zap, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatTime, formatCurrency } from '../lib/utils';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function Home() {
  const { user, dbUser } = useAuth();
  const [lastLog, setLastLog] = useState<any>(null);
  const [secondsSinceLastDrink, setSecondsSinceLastDrink] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'logs'),
      orderBy('consumedAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLastLog(snapshot.docs[0].data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/logs`);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastLog) {
        const last = new Date(lastLog.consumedAt).getTime();
        const diff = Math.max(0, Math.floor((Date.now() - last) / 1000));
        setSecondsSinceLastDrink(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastLog]);

  // Savings calculation (simulated logic based on 온보딩)
  const avgCost = dbUser?.avgConsumptionCost || 30000;
  const avgFrequencyDays = 3; // Every 3 days
  const daysSober = Math.floor(secondsSinceLastDrink / (3600 * 24));
  const estimatedSavings = Math.floor((daysSober / avgFrequencyDays) * avgCost);
  const estimatedCals = Math.floor((daysSober / avgFrequencyDays) * 500);

  return (
    <div className="p-10 space-y-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">금주 시작한 지</p>
          <h2 className="text-5xl font-black tracking-tighter">
            {formatTime(secondsSinceLastDrink)}
          </h2>
          <div className="flex items-center justify-center space-y-1">
             <p className="text-sm text-primary font-bold">현재까지 건강 상태: 매우 쾌적 ✨</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
            <div className="flex flex-col text-left space-y-1">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">절약한 금액</span>
              <p className="text-xl font-black text-white">{formatCurrency(estimatedSavings)}</p>
            </div>
          </div>
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
            <div className="flex flex-col text-left space-y-1">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">아낀 칼로리</span>
              <p className="text-xl font-black text-white">{estimatedCals} kcal</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">최근 나의 기록</h3>
          <button className="text-primary font-bold text-xs uppercase tracking-widest">전체보기 &gt;</button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
            {lastLog ? (
                <div className="card !p-4 flex items-center space-x-4 bg-white/5 border border-white/10">
                    <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-2xl">
                        {lastLog.drinkCategory === 'soju' ? '🍶' : lastLog.drinkCategory === 'beer' ? '🍺' : lastLog.drinkCategory === 'wine' ? '🍷' : '🥃'}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-lg">{lastLog.drinkName}</p>
                        <p className="text-xs text-white/40">안주: {lastLog.foodPairing || '없음'}</p>
                    </div>
                    <div className="bg-primary text-black text-[10px] font-black px-2 py-1 rounded-md uppercase">
                        {lastLog.drinkCategory}
                    </div>
                </div>
            ) : (
                <div className="card flex flex-col items-center justify-center py-10 text-white/20 border-dashed border-2">
                    <p className="text-sm font-bold uppercase tracking-widest">기록이 없습니다</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
