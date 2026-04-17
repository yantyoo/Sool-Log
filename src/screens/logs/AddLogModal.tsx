import React from 'react';
import { X } from 'lucide-react';
import { drinkMasterSeed } from '../../data/drinkMasterSeed';
import { formatCurrency } from '../../lib/utils';
import { getDrinkCategoryLabel } from '../../lib/recordForms';
import DrinkListItem from '../../components/DrinkListItem';
import type { LogFormValues } from '../../types/log';
import { cn } from '../../lib/utils';

interface AddLogModalProps {
  open: boolean;
  value: LogFormValues;
  onChange: (value: LogFormValues) => void;
  onClose: () => void;
  onSave: () => void;
  onOpenDrinkSearch: () => void;
  editing: boolean;
}

export default function AddLogModal({
  open,
  value,
  onChange,
  onClose,
  onSave,
  onOpenDrinkSearch,
  editing,
}: AddLogModalProps) {
  if (!open) return null;

  const selectedDrink = drinkMasterSeed.find((item) => item.id === value.standardDrinkId);

  const update = (patch: Partial<LogFormValues>) => onChange({ ...value, ...patch });

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm">
      <div className="mx-auto max-w-md h-full bg-[#0a0b10] overflow-y-auto">
        <div className="sticky top-0 z-10 px-5 py-4 border-b border-white/10 bg-[#0a0b10]/90 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Add Record</p>
            <h2 className="text-lg font-black">{editing ? '기록 수정' : '기록 추가'}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 pb-8">
          <div className="space-y-3">
            <button onClick={onOpenDrinkSearch} className="btn-primary w-full py-4">
              표준 술 선택
            </button>
            <p className="text-xs text-white/40 leading-relaxed">
              표준 데이터를 먼저 고르면 ABV, 용량, 칼로리, 가격이 자동으로 채워집니다.
            </p>
          </div>

          {selectedDrink ? (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Selected Master Item</p>
              <DrinkListItem drink={selectedDrink} selected onSelect={() => undefined} />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-white/35">
                  표준 아이템 {formatCurrency(selectedDrink.price)} · {getDrinkCategoryLabel(selectedDrink.category)}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    update({
                      standardDrinkId: '',
                      standardDrinkName: '',
                      drinkName: '',
                      brand: '',
                      abv: '',
                      volumeMl: '',
                      price: '',
                      calories: '',
                    })
                  }
                  className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40"
                >
                  수동 입력
                </button>
              </div>
            </div>
          ) : null}

          <div className="card space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Log Fields</p>
            <label className="space-y-2 block">
              <span className="text-xs text-white/45">Consumed Datetime</span>
              <input
                type="datetime-local"
                value={value.consumedAt}
                onChange={(event) => update({ consumedAt: event.target.value })}
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="space-y-2 block">
              <span className="text-xs text-white/45">Drink Category</span>
              <select
                value={value.drinkCategory}
                onChange={(event) => update({ drinkCategory: event.target.value as LogFormValues['drinkCategory'] })}
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none"
              >
                {(['soju','beer','wine','whiskey','makgeolli','highball','traditional_liquor','other'] as const).map((category) => (
                  <option key={category} value={category}>
                    {getDrinkCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 block">
              <span className="text-xs text-white/45">Drink Name</span>
              <input
                value={value.drinkName}
                onChange={(event) => update({ drinkName: event.target.value })}
                placeholder="직접 입력 가능"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2 block">
                <span className="text-xs text-white/45">ABV</span>
                <input value={value.abv} onChange={(event) => update({ abv: event.target.value })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none" />
              </label>
              <label className="space-y-2 block">
                <span className="text-xs text-white/45">Volume ml</span>
                <input value={value.volumeMl} onChange={(event) => update({ volumeMl: event.target.value })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none" />
              </label>
              <label className="space-y-2 block">
                <span className="text-xs text-white/45">Price</span>
                <input value={value.price} onChange={(event) => update({ price: event.target.value })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none" />
              </label>
              <label className="space-y-2 block">
                <span className="text-xs text-white/45">Calories</span>
                <input value={value.calories} onChange={(event) => update({ calories: event.target.value })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none" />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs text-white/45">Food pairing / snack</span>
              <input value={value.foodPairing} onChange={(event) => update({ foodPairing: event.target.value })} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none" />
            </label>
            <label className="space-y-2 block">
              <span className="text-xs text-white/45">Memo / review</span>
              <textarea value={value.memo} onChange={(event) => update({ memo: event.target.value })} rows={3} className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none resize-none" />
            </label>
            <label className="space-y-2 block">
              <span className="text-xs text-white/45">Rating</span>
              <input value={value.rating} onChange={(event) => update({ rating: event.target.value })} placeholder="1-5" className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none" />
            </label>
          </div>

          <button onClick={onSave} className={cn('btn-primary w-full py-4')}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
