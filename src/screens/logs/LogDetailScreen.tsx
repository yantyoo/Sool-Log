import React from 'react';
import { Trash2, Pencil, X, Calendar, MapPin, Sparkles, GlassWater, Percent, Wallet, Flame, PenLine } from 'lucide-react';
import { formatCurrency, formatDateTimeLabel } from '../../lib/utils';
import { getDrinkCategoryLabel } from '../../lib/recordForms';
import type { DrinkingLog } from '../../types/log';
import { motion, AnimatePresence } from 'motion/react';
import { getCategoryVisuals } from '../../components/LogCard';

interface LogDetailScreenProps {
  log: DrinkingLog | null;
  open: boolean;
  onClose: () => void;
  onEdit: (log: DrinkingLog) => void;
  onDelete: (logId: string) => void;
}

export default function LogDetailScreen({ log, open, onClose, onEdit, onDelete }: LogDetailScreenProps) {
  if (!log) return null;
  
  const visuals = getCategoryVisuals(log.drinkCategory);
  const Icon = visuals.icon;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          {/* Deep Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          {/* Premium Ticket Modal */}
          <motion.div 
            initial={{ y: "100%", opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] bg-surface rounded-t-[48px] sm:rounded-[48px] flex flex-col overflow-hidden shadow-2xl border-t border-white/[0.08]"
          >
            {/* Ticket Header Section */}
            <div className="relative pt-12 pb-10 px-10 text-center space-y-6 overflow-hidden">
               {/* Decorative Glow */}
               <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${visuals.bg} rounded-full blur-[100px] opacity-60`} />
               
               <div className="relative z-10 flex flex-col items-center space-y-4">
                  <div className={`w-20 h-20 rounded-3xl ${visuals.bg} ${visuals.border} border flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                    <Icon size={40} className={visuals.color} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center gap-2">
                       <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${visuals.color}`}>{getDrinkCategoryLabel(log.drinkCategory)}</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white font-sans">{log.drinkName}</h2>
                    <p className="text-[13px] font-bold text-white/30 uppercase tracking-widest">{formatDateTimeLabel(log.consumedAt)}</p>
                  </div>
               </div>

               {/* Serrated Edge Decoration (Simplified) */}
               <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-between px-2 gap-1 overflow-hidden opacity-20">
                  {Array.from({length: 20}).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-white shrink-0 -mb-2" />
                  ))}
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-10 pb-32">
              
              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-2 gap-5">
                <DataPoint icon={Percent} label="ALCOHOL" value={`${log.abv}%`} subValue="ABV" />
                <DataPoint icon={GlassWater} label="VOLUME" value={`${log.volumeMl}`} subValue="ML" />
                <DataPoint icon={Wallet} label="PRICE" value={log.price ? formatCurrency(log.price).replace('₩','') : '-'} subValue="KRW" />
                <DataPoint icon={Flame} label="CALORIES" value={`${log.calories ?? '-'}`} subValue="KCAL" />
              </div>

              {/* Memo & Pairing Section */}
              <div className="space-y-8">
                {log.foodPairing && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                      <Sparkles size={12} className="text-primary-light" /> PAIRING FOOD
                    </p>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-[15px] font-bold text-white/80 leading-relaxed italic">
                      "{log.foodPairing}"
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                    <PenLine size={12} /> MEMO & REVIEW
                  </p>
                  <div className="p-6 rounded-[28px] bg-white/[0.02] border border-white/[0.04] text-[15px] font-medium text-white/60 leading-relaxed whitespace-pre-line">
                    {log.memo || '남겨진 메모가 없습니다.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-surface via-surface/95 to-transparent pt-16 flex items-center gap-4">
              <button 
                onClick={() => onEdit(log)} 
                className="btn-primary flex-1 h-16 rounded-[24px] text-base"
              >
                <Pencil size={18} />
                <span>기록 수정</span>
              </button>
              <button 
                onClick={() => onDelete(log.id)} 
                className="w-16 h-16 rounded-[24px] glass border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/10 active:scale-90 transition-all"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={onClose}
                className="w-16 h-16 rounded-[24px] glass border-white/10 text-white/30 flex items-center justify-center hover:bg-white/5 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DataPoint({ icon: Icon, label, value, subValue }: { icon: any, label: string, value: string, subValue: string }) {
  return (
    <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/[0.05] space-y-3 group hover:border-primary/20 transition-colors">
       <div className="flex items-center gap-2 text-white/20 group-hover:text-primary-light transition-colors">
          <Icon size={14} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
       </div>
       <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black tracking-tighter text-white font-sans">{value}</span>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{subValue}</span>
       </div>
    </div>
  );
}
