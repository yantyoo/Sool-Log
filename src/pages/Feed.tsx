import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Feed() {
  const { user, dbUser } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'logs'), orderBy('consumedAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setLogs(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/logs`);
      },
    );

    return unsubscribe;
  }, [user]);

  return (
    <div className="space-y-6 p-10 pb-32">
      {logs.map((log) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="card overflow-hidden !p-0"
        >
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                {(dbUser?.displayName || user?.displayName || 'U').slice(0, 1)}
              </div>
              <div>
                <p className="text-sm font-bold">{dbUser?.displayName || user?.displayName || '술로그 유저'}</p>
                <p className="text-[10px] text-white/40 font-medium">
                  {formatDistanceToNow(new Date(log.consumedAt), { addSuffix: true, locale: ko })}
                </p>
              </div>
            </div>
          </div>

          <div className="aspect-[4/3] bg-black/40 relative group overflow-hidden">
            <div
              className={cn(
                'w-full h-full opacity-20',
                log.drinkCategory === 'soju'
                  ? 'bg-green-500'
                  : log.drinkCategory === 'wine'
                    ? 'bg-red-500'
                    : log.drinkCategory === 'beer'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500',
              )}
            />
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40">
              {log.drinkCategory === 'soju' ? '🍶' : log.drinkCategory === 'beer' ? '🍺' : log.drinkCategory === 'wine' ? '🍷' : '🥃'}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-primary text-black px-2 py-0.5 rounded-md text-[9px] font-black uppercase">{log.drinkCategory}</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">{log.drinkName}</h3>
              <p className="text-xs text-white/60 mt-0.5">{log.foodPairing ? `안주: ${log.foodPairing}` : '안주: 없음'}</p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-sm text-white/80 leading-relaxed font-medium">
              {log.memo || '이번 기록에는 메모가 없습니다.'}
            </p>
            <div className="flex items-center justify-between text-xs text-white/35">
              <span>평점 {log.rating ?? '-'} / 5</span>
              <span>{new Date(log.consumedAt).toLocaleString('ko-KR')}</span>
            </div>
          </div>
        </motion.div>
      ))}

      {logs.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <p className="text-slate-400">아직 기록이 없어요.</p>
          <p className="text-xs text-slate-300">첫 번째 기록을 남겨보세요.</p>
        </div>
      )}
    </div>
  );
}
