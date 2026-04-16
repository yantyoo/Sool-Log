import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'logs'),
      where('isPublic', '==', true),
      orderBy('consumedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'logs');
    });

    return unsubscribe;
  }, [user]);

  const handleCheers = async (logId: string, currentLikes: string[] = []) => {
    if (!user) return;
    const logRef = doc(db, 'logs', logId);
    if (currentLikes.includes(user.uid)) {
      await updateDoc(logRef, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(logRef, { likes: arrayUnion(user.uid) });
    }
  };

  return (
    <div className="space-y-6 p-10 pb-32">
      {posts.map((post) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="card overflow-hidden !p-0"
        >
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                {post.authorName?.[0] || 'U'}
              </div>
              <div>
                <p className="text-sm font-bold">{post.authorName || '술로그 유저'}</p>
                <p className="text-[10px] text-white/40 font-medium">
                  {formatDistanceToNow(new Date(post.consumedAt), { addSuffix: true, locale: ko })}
                </p>
              </div>
            </div>
          </div>

          <div className="aspect-[4/3] bg-black/40 relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-primary text-black px-2 py-0.5 rounded-md text-[9px] font-black uppercase">{post.drinkType}</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">{post.drinkName}</h3>
                <p className="text-xs text-white/60 mt-0.5">안주: {post.anju || '없음'}</p>
             </div>
             <div className={cn(
               "w-full h-full opacity-20",
               post.drinkType === '소주' ? "bg-green-500" : 
               post.drinkType === '와인' ? "bg-red-500" :
               post.drinkType === '맥주' ? "bg-yellow-500" : "bg-blue-500"
             )}></div>
             <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40">
                {post.drinkType === '소주' ? '🍶' : post.drinkType === '맥주' ? '🍺' : post.drinkType === '와인' ? '🍷' : '🥃'}
             </div>
          </div>

          <div className="p-4 space-y-4">
             <p className="text-sm text-white/80 leading-relaxed font-medium">
               {post.review || "이번 주말, 좋은 사람들과 즐거운 술자리였어요."}
             </p>

             <div className="flex items-center space-x-6 pt-2">
                <button 
                  onClick={() => handleCheers(post.id, post.likes)}
                  className={cn(
                    "flex items-center space-x-1.5 transition-colors",
                    post.likes?.includes(user?.uid) ? "text-primary" : "text-white/20"
                  )}
                >
                  <Heart size={18} fill={post.likes?.includes(user?.uid) ? "currentColor" : "none"} />
                  <span className="text-xs font-black">{post.likes?.length || 0}</span>
                </button>
                <button className="flex items-center space-x-1.5 text-white/20">
                  <MessageCircle size={18} />
                  <span className="text-xs font-black">0</span>
                </button>
                <button className="flex items-center space-x-1.5 text-white/20 ml-auto">
                  <Share2 size={18} />
                </button>
             </div>
          </div>
        </motion.div>
      ))}
      
      {posts.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <p className="text-slate-400">아직 공개된 기록이 없어요.</p>
          <p className="text-xs text-slate-300">첫 번째로 멋진 술을 기록해보세요!</p>
        </div>
      )}
    </div>
  );
}

// Need to fix a small detail: I used query(collection(db, 'logs'), where('isPublic', '==', true)) but didn't import 'where'.
