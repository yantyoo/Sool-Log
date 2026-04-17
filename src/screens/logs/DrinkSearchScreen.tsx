import React, { useMemo, useState } from 'react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import DrinkSearchInput from '../../components/DrinkSearchInput';
import DrinkListItem from '../../components/DrinkListItem';
import EmptyState from '../../components/EmptyState';
import type { DrinkMasterItem } from '../../types/drink';

interface DrinkSearchScreenProps {
  open: boolean;
  onClose: () => void;
  onSelectDrink: (drink: DrinkMasterItem) => void;
  onManualEntry: () => void;
}

export default function DrinkSearchScreen({ open, onClose, onSelectDrink, onManualEntry }: DrinkSearchScreenProps) {
  const { drinkMaster } = useAppData();
  const [query, setQuery] = useState('');

  const filteredDrinks = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return drinkMaster;

    return drinkMaster.filter((drink) => {
      const haystack = [drink.name, drink.brand, drink.category, ...drink.aliases].join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }, [drinkMaster, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[#0a0b10]">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        <div className="sticky top-0 z-10 px-5 py-4 border-b border-white/10 bg-[#0a0b10]/90 backdrop-blur-xl flex items-center justify-between">
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Master DB</p>
            <h2 className="text-sm font-black">표준 술 검색</h2>
          </div>
          <button onClick={onManualEntry} className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <PlusCircle size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 flex-1 overflow-y-auto">
          <DrinkSearchInput value={query} onChange={setQuery} />

          {filteredDrinks.length > 0 ? (
            <div className="space-y-2">
              {filteredDrinks.map((drink) => (
                <DrinkListItem key={drink.id} drink={drink} onSelect={onSelectDrink} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="검색 결과가 없습니다"
              description="표준 항목이 없으면 수동 입력으로 기록할 수 있습니다."
              actionLabel="수동 입력"
              onAction={onManualEntry}
            />
          )}
        </div>
      </div>
    </div>
  );
}
