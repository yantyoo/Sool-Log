import React from 'react';
import { Trash2, Pencil, X } from 'lucide-react';
import { formatCurrency, formatDateTimeLabel } from '../../lib/utils';
import { getDrinkCategoryLabel } from '../../lib/recordForms';
import type { DrinkingLog } from '../../types/log';

interface LogDetailScreenProps {
  log: DrinkingLog | null;
  open: boolean;
  onClose: () => void;
  onEdit: (log: DrinkingLog) => void;
  onDelete: (logId: string) => void;
}

export default function LogDetailScreen({ log, open, onClose, onEdit, onDelete }: LogDetailScreenProps) {
  if (!open || !log) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm">
      <div className="mx-auto max-w-md h-full bg-[#0a0b10] overflow-y-auto">
        <div className="sticky top-0 z-10 px-5 py-4 border-b border-white/10 bg-[#0a0b10]/90 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Log Detail</p>
            <h2 className="text-lg font-black">기록 상세</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 pb-8">
          <div className="card space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                  {getDrinkCategoryLabel(log.drinkCategory)}
                </p>
                <h3 className="text-xl font-black">{log.drinkName}</h3>
                <p className="text-xs text-white/40">{formatDateTimeLabel(log.consumedAt)}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">🥂</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Standard</p>
                <p className="mt-1 font-semibold">{log.standardDrinkName || '없음'}</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Price</p>
                <p className="mt-1 font-semibold">{log.price ? formatCurrency(log.price) : '-'}</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Volume</p>
                <p className="mt-1 font-semibold">{log.volumeMl ? `${log.volumeMl} ml` : '-'}</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Calories</p>
                <p className="mt-1 font-semibold">{log.calories ? `${log.calories} kcal` : '-'}</p>
              </div>
            </div>
          </div>

          <div className="card space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Memo</p>
            <p className="text-sm leading-relaxed text-white/75 whitespace-pre-line">{log.memo || '메모가 없습니다.'}</p>
            <p className="text-xs text-white/40">안주: {log.foodPairing || '없음'} · 평점: {log.rating ?? '-'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onEdit(log)} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
              <Pencil size={16} />
              수정
            </button>
            <button onClick={() => onDelete(log.id)} className="w-full rounded-2xl border border-red-400/30 bg-red-400/10 text-red-200 font-bold flex items-center justify-center gap-2">
              <Trash2 size={16} />
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

