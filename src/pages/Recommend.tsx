import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Utensils, GlassWater, ChevronRight } from 'lucide-react';
import { getPairingRecommendation } from '../lib/gemini';
import { cn } from '../lib/utils';

export default function Recommend() {
  const [selectedType, setSelectedType] = useState('소주');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const drinkTypes = [
    { id: '소주', icon: '🍶' },
    { id: '맥주', icon: '🍺' },
    { id: '와인', icon: '🍷' },
    { id: '위스키', icon: '🥃' },
    { id: '막걸리', icon: '🥣' },
  ];

  const handleRecommend = async (type: string) => {
    setSelectedType(type);
    setLoading(true);
    const results = await getPairingRecommendation('', type);
    setRecommendations(results);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-8 pb-24">
      <div className="space-y-2">
        <h2 className="text-3xl font-black font-serif italic tracking-tighter">안주 페어링 추천</h2>
        <p className="text-slate-500 font-medium">주종별 찰떡 안주를 추천해 드려요</p>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
        {drinkTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleRecommend(type.id)}
            className={cn(
              "flex-shrink-0 w-20 h-28 rounded-[32px] flex flex-col items-center justify-center space-y-3 transition-all",
              selectedType === type.id ? "bg-primary text-black scale-105 shadow-xl shadow-primary/30" : "bg-white/5 text-white/40 border border-white/5"
            )}
          >
            <span className="text-3xl">{type.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{type.id}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{selectedType}와(과) 잘 어울리는 안주</h3>
          <Utensils size={20} className="text-primary" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">AI가 분석 중...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((food, i) => (
              <motion.div
                key={food}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card !p-5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all bg-gradient-to-r from-primary/10 to-transparent"
              >
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 bg-primary text-black rounded-2xl flex items-center justify-center text-3xl shadow-lg ring-4 ring-white/5">
                    {i === 0 ? '🍱' : '🍴'}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">{food}</p>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">유저 선호도 {98 - i * 5}%</p>
                  </div>
                </div>
                <ChevronRight className="text-white/20 group-hover:text-primary transition-colors" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-20 space-y-6 bg-white/5 border-dashed border-2 border-white/10">
            <GlassWater size={60} className="mx-auto text-white/10" />
            <p className="text-white/40 font-bold uppercase tracking-widest">주종을 선택하여 추천받으세요</p>
          </div>
        )}
      </div>

      <div className="card bg-black/40 border border-white/5 p-8 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
            <h4 className="text-xl font-black text-primary uppercase italic tracking-tighter">술로그 메시지</h4>
            <p className="text-sm text-white/60 leading-relaxed font-medium">
              "현재 유저 85%가 {selectedType}와(과) 함께 즐거운 시간을 보내고 있습니다. 당신의 기록도 남겨보세요!"
            </p>
        </div>
        <div className="absolute -bottom-8 -right-8 opacity-5">
            <Utensils size={160} />
        </div>
      </div>
    </div>
  );
}
