import React, { useMemo, useState } from 'react';
import { ArrowLeft, PlusCircle, Search, Sparkles, Beer, Wine, GlassWater, Flame, Milk, CupSoda, Zap } from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';
import DrinkSearchInput from '../../components/DrinkSearchInput';
import DrinkListItem from '../../components/DrinkListItem';
import EmptyState from '../../components/EmptyState';
import type { DrinkMasterItem } from '../../types/drink';
import { motion, AnimatePresence } from 'motion/react';
import { getDrinkCategoryLabel } from '../../lib/recordForms';

interface DrinkSearchScreenProps {
  open: boolean;
  onClose: () => void;
  onSelectDrink: (drink: DrinkMasterItem) => void;
  onManualEntry: () => void;
}

export default function DrinkSearchScreen({ open, onClose, onSelectDrink, onManualEntry }: DrinkSearchScreenProps) {
  const { drinkMaster } = useAppData();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: '전체', icon: Zap },
    { id: 'soju', label: '소주', icon: GlassWater },
    { id: 'beer', label: '맥주', icon: Beer },
    { id: 'wine', label: '와인', icon: Wine },
    { id: 'whiskey', label: '위스키', icon: Flame },
    { id: 'makgeolli', label: '막걸리', icon: Milk },
    { id: 'highball', label: '하이볼', icon: CupSoda },
  ];

  const filteredDrinks = useMemo(() => {
    const search = query.trim().toLowerCase();
    
    return drinkMaster.filter((drink) => {
      const matchQuery = !search || [drink.name, drink.brand, drink.category, ...drink.aliases].join(' ').toLowerCase().includes(search);
      const matchCategory = selectedCategory === 'all' || drink.category === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [drinkMaster, query, selectedCategory]);

  if (!open) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 z-[70] bg-background flex flex-col"
    >
      {/* Editorial Header */}
      <div className="flex-none px-6 pt-10 pb-6 space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="w-12 h-12 rounded-[20px] glass flex items-center justify-center text-white/50 active:scale-90 transition-all">
            <ArrowLeft size={22} />
          </button>
          <div className="text-center space-y-1">
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary-light font-black">Database</p>
            <h2 className="text-xl font-black tracking-tight uppercase">Search Master</h2>
          </div>
          <button onClick={onManualEntry} className="w-12 h-12 rounded-[20px] glass flex items-center justify-center text-primary-light border-primary/20 active:scale-90 transition-all">
            <PlusCircle size={22} />
          </button>
        </div>

        {/* Premium Search Input */}
        <div className="relative group">
           <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search size={20} className="text-white/20 group-focus-within:text-primary-light transition-colors" />
           </div>
           <input 
             type="text" 
             placeholder="브랜드 또는 술 이름 검색" 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             className="w-full h-18 bg-white/[0.03] border border-white/[0.06] rounded-[28px] pl-16 pr-6 text-base font-bold text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.06] focus:border-primary/40 focus:ring-8 focus:ring-primary/5 transition-all shadow-2xl shadow-black/20" 
           />
        </div>

        {/* Category Quick Select */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border transition-all duration-300 whitespace-nowrap ${
                  isActive 
                  ? 'bg-primary border-primary shadow-[0_10px_20px_-5px_rgba(99,102,241,0.4)] text-white' 
                  : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-white/20'} />
                <span className="text-xs font-black tracking-widest uppercase">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Timeline */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 pb-12">
        <div className="flex items-center gap-3 px-2 mb-6">
           <div className="w-1.5 h-1.5 rounded-full bg-primary-light glow-primary" />
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Search Results ({filteredDrinks.length})</p>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredDrinks.length > 0 ? (
            <div className="space-y-4">
              {filteredDrinks.map((drink) => (
                <motion.div
                  key={drink.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <DrinkListItem drink={drink} onSelect={onSelectDrink} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20">
              <EmptyState
                title="일치하는 항목이 없습니다"
                description="데이터베이스에 없는 술은 수동 입력으로 자유롭게 기록할 수 있습니다."
                actionLabel="직접 수동 입력하기"
                onAction={onManualEntry}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
