import React from 'react';
import { ChevronRight, Beer, Wine, GlassWater, Flame, Sparkles, Milk, CupSoda } from 'lucide-react';
import { formatDateTimeLabel, formatCurrency } from '../lib/utils';
import type { DrinkingLog } from '../types/log';
import { getDrinkCategoryLabel } from '../lib/recordForms';
import { DrinkCategory } from '../types/drink';
import { motion } from 'motion/react';

interface LogCardProps {
  log: DrinkingLog;
  onClick?: () => void;
}

export const getCategoryVisuals = (category: DrinkCategory) => {
  switch (category) {
    case 'soju':
      return { icon: GlassWater, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-blue-500/20' };
    case 'beer':
      return { icon: Beer, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/20' };
    case 'wine':
      return { icon: Wine, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/20' };
    case 'whiskey':
      return { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-orange-500/20' };
    case 'makgeolli':
      return { icon: Milk, color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: 'shadow-slate-500/20' };
    case 'highball':
      return { icon: CupSoda, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/20' };
    case 'traditional_liquor':
      return { icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/20' };
    default:
      return { icon: GlassWater, color: 'text-primary-light', bg: 'bg-primary/10', border: 'border-primary/20', glow: 'shadow-primary/20' };
  }
};

export default function LogCard({ log, onClick }: LogCardProps) {
  const visuals = getCategoryVisuals(log.drinkCategory);
  const Icon = visuals.icon;

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card w-full text-left flex items-center gap-6 group relative overflow-hidden border-white/[0.03]"
    >
      {/* Background Subtle Gradient */}
      <div className={`absolute -right-4 -top-4 w-32 h-32 ${visuals.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700`} />

      <div className={`w-16 h-16 rounded-[24px] ${visuals.bg} ${visuals.border} border flex items-center justify-center shrink-0 relative shadow-2xl transition-all duration-500 group-hover:rotate-6`}>
        <div className={`absolute inset-0 rounded-[24px] ${visuals.bg} blur-xl opacity-40`} />
        <Icon size={30} className={`${visuals.color} relative z-10`} />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-black text-white text-[17px] tracking-tight truncate pr-2 font-sans">{log.drinkName}</p>
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg ${visuals.bg} ${visuals.color} border ${visuals.border} whitespace-nowrap`}>
            {getDrinkCategoryLabel(log.drinkCategory)}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
           <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">
                {formatDateTimeLabel(log.consumedAt)}
              </p>
           </div>
           <p className="text-[11px] text-white/60 font-black tracking-tight">
             {log.volumeMl}ml <span className="text-white/20 mx-1">·</span> {log.abv}% ABV
           </p>
        </div>

        <div className="flex items-center gap-3 pt-0.5">
           <div className="flex items-center gap-1 text-[11px] font-bold text-white/20 group-hover:text-primary-light transition-colors">
              <Flame size={12} className="opacity-50" />
              <span>{log.calories ?? '-'} kcal</span>
           </div>
           <div className="flex items-center gap-1 text-[11px] font-bold text-white/20 group-hover:text-primary-light transition-colors">
              <span className="opacity-50 text-[10px]">₩</span>
              <span>{log.price ? formatCurrency(log.price).replace('₩','') : '-'}</span>
           </div>
        </div>
      </div>

      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/10 group-hover:text-white group-hover:bg-white/5 transition-all">
        <ChevronRight size={22} />
      </div>
    </motion.button>
  );
}
