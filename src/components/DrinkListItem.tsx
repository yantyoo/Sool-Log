import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import type { DrinkMasterItem } from '../types/drink';
import { getDrinkCategoryLabel } from '../lib/recordForms';

interface DrinkListItemProps {
  drink: DrinkMasterItem;
  selected?: boolean;
  onSelect: (drink: DrinkMasterItem) => void;
}

export default function DrinkListItem({ drink, selected, onSelect }: DrinkListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(drink)}
      className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors flex items-center gap-4 ${
        selected ? 'border-primary/60 bg-primary/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="w-11 h-11 rounded-2xl bg-black/30 flex items-center justify-center text-lg shrink-0">🥃</div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white truncate">{drink.name}</p>
          <span className="text-[10px] uppercase tracking-[0.16em] text-primary font-bold">
            {getDrinkCategoryLabel(drink.category)}
          </span>
        </div>
        <p className="text-xs text-white/40 truncate">{drink.brand}</p>
        <p className="text-xs text-white/50 truncate">
          {drink.abv}% · {drink.volume_ml}ml · {drink.calories}kcal · {formatCurrency(drink.price)}
        </p>
      </div>
      <ChevronRight size={16} className="text-white/25" />
    </button>
  );
}

