import React, { useState, useRef } from 'react';
import { X, Camera, Search, ChevronRight, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { analyzeAlcoholLabel } from '../lib/gemini';
import { emitToast } from '../lib/toast';
import { cn } from '../lib/utils';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecordModal({ isOpen, onClose }: RecordModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Select method, 2: Info entry
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    drinkName: '',
    drinkType: 'Beer',
    abv: 0,
    rating: 5,
    anju: '',
    anjuCategory: 'Snack',
    review: '',
    isPublic: true
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const aiResult = await analyzeAlcoholLabel(base64);
      
      setFormData(prev => ({
        ...prev,
        drinkName: aiResult.name,
        drinkType: aiResult.type,
        abv: aiResult.abv
      }));
      setLoading(false);
      setStep(2);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (!formData.drinkName.trim()) {
        emitToast({
          tone: 'warning',
          title: '제품명을 입력해주세요.',
          description: '기록 저장을 위해 술 이름이 필요합니다.',
        });
        return;
      }

      const logId = crypto.randomUUID();
      await setDoc(doc(db, 'users', user.uid, 'logs', logId), {
        id: logId,
        userId: user.uid,
        drinkCategory: mapDrinkTypeToCategory(formData.drinkType),
        consumedAt: new Date().toISOString(),
        drinkName: formData.drinkName,
        standardDrinkId: null,
        standardDrinkName: null,
        brand: null,
        abv: Number(formData.abv) || null,
        volumeMl: null,
        price: null,
        calories: null,
        foodPairing: formData.anju,
        memo: formData.review,
        rating: Number(formData.rating) || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      emitToast({
        tone: 'success',
        title: '기록을 저장했습니다.',
        description: '홈과 분석 화면이 즉시 갱신됩니다.',
      });
      onClose();
    } catch (err) {
      console.error(err);
      emitToast({
        tone: 'error',
        title: '기록 저장에 실패했습니다.',
        description: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  function mapDrinkTypeToCategory(drinkType: string) {
    const normalized = drinkType.trim().toLowerCase();

    switch (normalized) {
      case 'soju':
      case '소주':
        return 'soju';
      case 'beer':
      case '맥주':
        return 'beer';
      case 'wine':
      case '와인':
        return 'wine';
      case 'whiskey':
      case '위스키':
        return 'whiskey';
      case 'makgeolli':
      case '막걸리':
        return 'makgeolli';
      default:
        return 'other';
    }
  }

  const canSubmit = Boolean(formData.drinkName.trim()) && !loading;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-6">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="bg-[#0a0b10] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] border-t sm:border border-white/10"
        >
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-black/20">
            <h2 className="text-xl font-black uppercase tracking-tighter">주류 기록</h2>
            <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto flex-1 space-y-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                </div>
                <p className="text-white/40 font-black uppercase tracking-[0.2em] text-xs">AI 라벨 스캔 중...</p>
              </div>
            ) : step === 1 ? (
              <div className="space-y-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center p-6 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 transition-all"
                >
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <Camera size={28} />
                  </div>
                  <div className="ml-5 text-left flex-1">
                    <h3 className="font-black text-white uppercase tracking-tight">AI 라벨 스캔</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">제미나이 자동 입력</p>
                  </div>
                  <ChevronRight className="text-white/10" />
                  <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileUpload} />
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="w-full flex items-center p-6 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 transition-all"
                >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 shadow-sm group-hover:scale-110 transition-transform border border-white/10">
                    <Search size={28} />
                  </div>
                  <div className="ml-5 text-left flex-1">
                    <h3 className="font-black text-white uppercase tracking-tight">수동 기록</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">직접 입력하기</p>
                  </div>
                  <ChevronRight className="text-white/10" />
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">제품명</label>
                  <input
                    type="text"
                    value={formData.drinkName}
                    onChange={(e) => setFormData({ ...formData, drinkName: e.target.value })}
                    className="input-field"
                    placeholder="예: 맥캘란 12년"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">카테고리</label>
                    <div className="relative">
                        <select
                        value={formData.drinkType}
                        onChange={(e) => setFormData({ ...formData, drinkType: e.target.value })}
                        className="select-field"
                        >
                        {["소주", "맥주", "와인", "위스키", "막걸리", "기타"].map(type => (
                            <option key={type} value={type} className="bg-[#0a0b10]">{type}</option>
                        ))}
                        </select>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">도수 (%)</label>
                    <input
                      type="number"
                      value={formData.abv}
                      onChange={(e) => setFormData({ ...formData, abv: parseFloat(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">함께한 안주</label>
                  <input
                    type="text"
                    value={formData.anju}
                    onChange={(e) => setFormData({ ...formData, anju: e.target.value })}
                    className="input-field"
                    placeholder="예: 스테이크"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">평점</label>
                  <div className="flex items-center space-x-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
                          formData.rating >= star ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10" : "bg-white/5 border-white/5 text-white/10"
                        )}
                      >
                        <Star size={24} fill={formData.rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full py-5 bg-primary text-black rounded-3xl font-black shadow-xl shadow-primary/20 disabled:opacity-30 disabled:grayscale transition-all uppercase tracking-widest text-sm"
                >
                  {loading ? '저장 중...' : '기록 저장'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
