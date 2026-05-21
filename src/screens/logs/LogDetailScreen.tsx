import React from 'react';
import { Trash2, Pencil, X, Sparkles, GlassWater, Percent, Wallet, Flame, PenLine, Heart, ShieldAlert, Timer, Share2 } from 'lucide-react';
import { formatCurrency, formatDateTimeLabel } from '../../lib/utils';
import { getDrinkCategoryLabel } from '../../lib/recordForms';
import type { DrinkingLog } from '../../types/log';
import { motion, AnimatePresence } from 'motion/react';
import { getCategoryVisuals } from '../../components/LogCard';
import { useAppData } from '../../state/AppDataContext';

interface LogDetailScreenProps {
  log: DrinkingLog | null;
  open: boolean;
  onClose: () => void;
  onEdit: (log: DrinkingLog) => void;
  onDelete: (logId: string) => void;
}

export default function LogDetailScreen({ log, open, onClose, onEdit, onDelete }: LogDetailScreenProps) {
  if (!log) return null;
  
  const { healthProfile } = useAppData();
  const visuals = getCategoryVisuals(log.drinkCategory);
  const Icon = visuals.icon;

  const abvVal = log.abv ?? 0;
  const volVal = log.volumeMl ?? 0;
  const alcoholGrams = parseFloat((volVal * (abvVal / 100) * 0.789).toFixed(1));

  // Personalized Alcohol Metabolism (Widmark Formula variables)
  const genderFactor = healthProfile?.gender === 'female' ? 6.0 : 7.5;
  const personalizedFactor = healthProfile?.weight 
    ? (healthProfile.weight * (healthProfile.gender === 'female' ? 0.085 : 0.1)) 
    : genderFactor;
  const recoveryTimeHours = parseFloat((alcoholGrams / personalizedFactor).toFixed(1));

  const handleShareReceipt = async () => {
    const dateLabel = formatDateTimeLabel(log.consumedAt);
    const categoryLabel = getDrinkCategoryLabel(log.drinkCategory);
    const barcodeText = `SOOL-LOG-${log.id.slice(0, 8).toUpperCase()}`;
    
    const shareText = `🧾 [술로그] 음주 영수증
──────────────────
🍶 종류: ${categoryLabel} (${log.drinkName})
📅 일시: ${dateLabel}
📊 정보: ${log.abv}% | ${log.volumeMl}ml
🧪 알코올: ${alcoholGrams}g (소주 약 ${(alcoholGrams / 6.5).toFixed(1)}잔)
⏱️ 간 해독: 약 ${recoveryTimeHours}시간 소요 예상
──────────────────
   |||| ||| |||| |
   ${barcodeText}
──────────────────`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '술로그 음주 영수증',
          text: shareText,
        });
      } catch (err) {
        console.warn("Share failed, copying to clipboard instead:", err);
        await copyToClipboard(shareText);
      }
    } else {
      await copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("영수증 텍스트가 클립보드에 복사되었습니다! SNS나 단톡방에 붙여넣어 보세요.");
    } catch (err) {
      alert("클립보드 복사에 실패했습니다.");
    }
  };

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
            className="relative w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[88vh] bg-surface rounded-t-[48px] sm:rounded-[48px] flex flex-col overflow-hidden shadow-2xl border-t border-white/[0.08]"
          >
            {/* Ticket Header Section */}
            <div className="relative pt-12 pb-10 px-10 text-center space-y-6 overflow-hidden">
               {/* Decorative Glow */}
               <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${visuals.bg} rounded-full blur-[100px] opacity-60`} />
               
               <div className="relative z-10 flex flex-col items-center space-y-4">
                  <div className={`w-20 h-20 rounded-3xl ${visuals.bg} ${visuals.border} border flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                    <Icon size={40} className={visuals.color} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${visuals.color}`}>{getDrinkCategoryLabel(log.drinkCategory)}</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white font-sans">{log.drinkName}</h2>
                    <p className="text-[11px] font-bold text-white/30 tracking-widest">{formatDateTimeLabel(log.consumedAt)}</p>
                  </div>
               </div>

               {/* Serrated Edge Decoration */}
               <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-between px-2 gap-1 overflow-hidden opacity-10">
                  {Array.from({length: 24}).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-white shrink-0 -mb-1.5" />
                  ))}
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 pb-36">
              
              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <DataPoint icon={Percent} label="알코올 도수" value={`${log.abv}%`} subValue="ABV" />
                <DataPoint icon={GlassWater} label="음용량" value={`${log.volumeMl}`} subValue="ML" />
                <DataPoint icon={Wallet} label="지출 금액" value={log.price ? formatCurrency(log.price).replace('₩','') : '-'} subValue="KRW" />
                <DataPoint icon={Flame} label="칼로리" value={`${log.calories ?? '-'}`} subValue="KCAL" />
              </div>

              {/* Health insight section */}
              {alcoholGrams > 0 && (
                <div className="p-5 rounded-[28px] bg-primary/5 border border-primary/20 space-y-4">
                  <div className="flex items-center gap-2 text-primary-light">
                    <Heart size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">헬스 리포트 & 건강 분석</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-extrabold text-white/30 uppercase">순수 알코올 함량</p>
                      <p className="text-xl font-black text-white">{alcoholGrams}g</p>
                      <p className="text-[9px] font-medium text-white/40">소주 약 {(alcoholGrams / 6.5).toFixed(1)}잔 분량</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-extrabold text-white/30 uppercase">간 해독 예상 시간</p>
                      <p className="text-xl font-black text-white flex items-center gap-1">
                        <Timer size={16} className="text-primary-light" />
                        <span>{recoveryTimeHours}시간</span>
                      </p>
                      <p className="text-[9px] font-medium text-white/40">완전 분해 기준</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Memo & Pairing Section */}
              <div className="space-y-6">
                {log.foodPairing && (
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-primary-light" /> 함께 먹은 안주
                    </p>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-sm font-semibold text-white/80 leading-relaxed italic">
                      "{log.foodPairing}"
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1.5">
                    <PenLine size={12} /> 테이스팅 노트 & 메모
                  </p>
                  <div className="p-6 rounded-[28px] bg-white/[0.01] border border-white/[0.03] text-sm font-medium text-white/60 leading-relaxed whitespace-pre-line">
                    {log.memo || '남겨진 메모가 없습니다.'}
                  </div>
                </div>
              </div>

              {/* Receipt Barcode Graphic */}
              <div className="space-y-2 pt-6 flex flex-col items-center">
                <div className="w-full h-10 barcode-pattern opacity-40 rounded-sm" />
                <p className="text-[9px] font-mono tracking-[0.3em] text-white/20 uppercase">SOOL-LOG-{log.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-surface via-surface/95 to-transparent pt-12 flex items-center gap-4">
              <button 
                onClick={() => onEdit(log)} 
                className="btn-primary flex-1 h-16 rounded-[24px] text-base"
              >
                <Pencil size={18} />
                <span>기록 수정</span>
              </button>
              <button 
                onClick={handleShareReceipt} 
                className="w-16 h-16 rounded-[24px] glass border-primary/20 text-primary-light flex items-center justify-center hover:bg-primary/10 active:scale-90 transition-all"
                title="영수증 공유"
              >
                <Share2 size={20} />
              </button>
              <button 
                onClick={() => onDelete(log.id)} 
                className="w-16 h-16 rounded-[24px] glass border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/10 active:scale-90 transition-all"
                title="기록 삭제"
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
    <div className="p-5 rounded-[28px] bg-white/[0.02] border border-white/[0.04] space-y-2 group hover:border-primary/20 transition-colors">
       <div className="flex items-center gap-1.5 text-white/20 group-hover:text-primary-light transition-colors">
          <Icon size={13} />
          <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
       </div>
       <div className="flex items-baseline gap-1">
          <span className="text-xl font-black tracking-tight text-white font-sans">{value}</span>
          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{subValue}</span>
       </div>
    </div>
  );
}
