import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import type { DrinkMasterItem } from '../types/drink';
import { getDrinkCategoryLabel } from '../lib/recordForms';
import { getCategoryVisuals } from './LogCard';
import { motion } from 'motion/react';

interface DrinkListItemProps {
  drink: DrinkMasterItem;
  selected?: boolean;
  onSelect: (drink: DrinkMasterItem) => void;
}

export default function DrinkListItem({ drink, selected, onSelect }: DrinkListItemProps) {
  const visuals = getCategoryVisuals(drink.category);
  const Icon = visuals.icon;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={() => onSelect(drink)}
      className={`w-full text-left rounded-3xl border p-4.5 transition-all flex items-center gap-5 ${
        selected 
          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
          : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10'
      }`}
    >
      <div className={`w-12 h-12 rounded-[18px] ${visuals.bg} ${visuals.border} border flex items-center justify-center shrink-0`}>
        <Icon size={22} className={visuals.color} />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-black text-white text-[15px] truncate">{drink.name}</p>
          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${visuals.bg} ${visuals.color} border ${visuals.border}`}>
            {getDrinkCategoryLabel(drink.category)}
          </span>
        </div>
        <p className="text-[11px] text-white/30 font-bold uppercase tracking-tight">{drink.brand}</p>
        <div className="flex items-center gap-2 text-[11px] font-black text-white/50">
          <span>{drink.abv}%</span>
          <div className="w-0.5 h-0.5 rounded-full bg-white/10" />
          <span>{drink.volume_ml}ml</span>
          <div className="w-0.5 h-0.5 rounded-full bg-white/10" />
          <span className="text-primary/80">{formatCurrency(drink.price)}</span>
        </div>
      </div>

      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selected ? 'bg-primary text-white' : 'text-white/10'}`}>
        <ChevronRight size={18} />
      </div>
    </motion.button>
  );
}
