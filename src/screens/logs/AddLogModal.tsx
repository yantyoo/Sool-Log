import React from 'react';
import { X, Search, ChevronRight, Sparkles, Calendar, GlassWater, Percent, Wallet, Flame, PenLine } from 'lucide-react';
import { drinkMasterSeed } from '../../data/drinkMasterSeed';
import { getDrinkCategoryLabel } from '../../lib/recordForms';
import DrinkListItem from '../../components/DrinkListItem';
import type { LogFormValues } from '../../types/log';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AddLogModalProps {
  open: boolean;
  value: LogFormValues;
  onChange: (value: LogFormValues) => void;
  onClose: () => void;
  onSave: () => void;
  onOpenDrinkSearch: () => void;
  editing: boolean;
  saving?: boolean;
}

export default function AddLogModal({
  open,
  value,
  onChange,
  onClose,
  onSave,
  onOpenDrinkSearch,
  editing,
  saving = false,
}: AddLogModalProps) {
  const selectedDrink = drinkMasterSeed.find((item) => item.id === value.standardDrinkId);
  const update = (patch: Partial<LogFormValues>) => onChange({ ...value, ...patch });
  const canSave = (Boolean(value.drinkName?.trim()) || Boolean(value.standardDrinkId?.trim())) && Boolean(value.consumedAt?.trim()) && !saving;

  const labelClasses = "text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/30 ml-1 flex items-center gap-1.5 mb-2.5";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          {/* Premium Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Nocturne Modal Container */}
          <motion.div 
            initial={{ y: "100%", opacity: 0.5 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="relative w-full max-w-lg h-[92vh] sm:h-[85vh] bg-surface rounded-t-[48px] sm:rounded-[48px] flex flex-col overflow-hidden shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)] border-t border-white/[0.08]"
          >
            {/* Editorial Header */}
            <div className="flex-none px-8 py-7 border-b border-white/[0.05] bg-surface/40 backdrop-blur-3xl flex items-center justify-between z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-light glow-primary animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.35em] text-primary-light font-black">RECORDING</p>
                </div>
                <h2 className="text-2xl font-black tracking-tight">{editing ? '기록 수정하기' : '새로운 음주 기록'}</h2>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-[20px] glass flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all border-white/10">
                <X size={20} className="text-white/60" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 pb-40 scroll-smooth">
              
              {/* Premium Search Trigger */}
              <div className="space-y-4">
                <button 
                  onClick={onOpenDrinkSearch} 
                  className="w-full h-20 rounded-[28px] bg-white/[0.03] border border-white/[0.08] flex items-center gap-5 px-7 text-white/40 hover:bg-white/[0.06] hover:border-primary-light/40 transition-all group active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search size={20} className="text-primary-light" />
                  </div>
                  <div className="text-left">
                    <span className="block font-extrabold text-[15px] text-white/80">데이터베이스에서 찾기</span>
                    <span className="block text-xs font-medium text-white/30">브랜드와 정확한 도수를 불러올 수 있어요</span>
                  </div>
                </button>
              </div>

              {selectedDrink && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <p className={labelClasses}><Sparkles size={12} className="text-primary-light" /> 선택된 제품</p>
                  <div className="p-1 glass rounded-[26px] border-primary/20">
                    <DrinkListItem drink={selectedDrink} selected onSelect={() => undefined} />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => update({ standardDrinkId: '', standardDrinkName: '', drinkName: '', brand: '', abv: '', volumeMl: '', price: '', calories: '' })}
                      className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-primary-light transition-colors px-2 py-1"
                    >
                      기록 초기화 후 직접 입력
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Form Fields - Layered Sections */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <label className={labelClasses}><Calendar size={12} /> 기록 시간</label>
                    <input
                      type="datetime-local"
                      value={value.consumedAt}
                      onChange={(e) => update({ consumedAt: e.target.value })}
                      className="input-field h-16 text-lg font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-6 bg-white/[0.02] p-6 rounded-[32px] border border-white/[0.03]">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className={labelClasses}><GlassWater size={12} /> 카테고리</label>
                      <div className="relative">
                        <select
                          value={value.drinkCategory}
                          onChange={(e) => update({ drinkCategory: e.target.value as LogFormValues['drinkCategory'] })}
                          className="select-field h-16 font-bold"
                        >
                          {(['soju','beer','wine','whiskey','makgeolli','highball','traditional_liquor','other'] as const).map((cat) => (
                            <option key={cat} value={cat} className="bg-[#1a1a1c] text-white">{getDrinkCategoryLabel(cat)}</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className={labelClasses}><Sparkles size={12} /> 제품명</label>
                      <input
                        value={value.drinkName}
                        onChange={(e) => update({ drinkName: e.target.value })}
                        placeholder="이름 입력"
                        className="input-field h-16 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className={labelClasses}><Percent size={12} /> 도수 (%)</label>
                      <input type="number" step="0.1" value={value.abv} onChange={(e) => update({ abv: e.target.value })} placeholder="0.0" className="input-field h-16 font-bold text-center" />
                    </div>
                    <div className="space-y-3">
                      <label className={labelClasses}><GlassWater size={12} /> 용량 (ml)</label>
                      <input type="number" value={value.volumeMl} onChange={(e) => update({ volumeMl: e.target.value })} placeholder="0" className="input-field h-16 font-bold text-center" />
                    </div>
                    <div className="space-y-3 col-span-2">
                      <label className={labelClasses}><Wallet size={12} /> 가격 (원)</label>
                      <input type="number" value={value.price} onChange={(e) => update({ price: e.target.value })} placeholder="0" className="input-field h-16 font-bold text-center" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={labelClasses}><Sparkles size={12} /> 함께 먹은 안주</label>
                  <input value={value.foodPairing} onChange={(e) => update({ foodPairing: e.target.value })} placeholder="페어링 푸드" className="input-field h-16" />
                </div>

                <div className="space-y-3">
                  <label className={labelClasses}><PenLine size={12} /> 메모 & 리뷰</label>
                  <textarea 
                    value={value.memo} 
                    onChange={(e) => update({ memo: e.target.value })} 
                    placeholder="오늘의 분위기, 맛에 대한 솔직한 평가를 남겨보세요" 
                    className="input-field h-auto py-5 min-h-[160px] resize-none leading-relaxed" 
                  />
                </div>
              </div>
            </div>

            {/* Premium Floating Action Area */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-surface via-surface/95 to-transparent pt-20 pointer-events-none">
              <button 
                onClick={onSave} 
                disabled={!canSave} 
                className={cn('btn-primary w-full h-18 text-lg tracking-tight pointer-events-auto', !canSave && 'opacity-30 grayscale cursor-not-allowed shadow-none')}
              >
                {saving ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>저장 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="animate-pulse" />
                    <span>음주 기록 저장하기</span>
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

