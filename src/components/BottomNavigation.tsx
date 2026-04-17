import React from 'react';
import { BarChart3, ClipboardList, Home, Plus, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import type { BottomTab } from '../types/navigation';

interface BottomNavigationProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
  onOpenAddLog: () => void;
}

export default function BottomNavigation({ activeTab, onTabChange, onOpenAddLog }: BottomNavigationProps) {
  const tabs: Array<{ id: BottomTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'logs', label: '기록', icon: ClipboardList },
    { id: 'analysis', label: '분석', icon: BarChart3 },
    { id: 'goals', label: '목표', icon: Target },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0b10]/92 backdrop-blur-xl">
      <div className="mx-auto max-w-md h-20 px-5 flex items-end justify-between">
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 pb-3 text-[10px] font-bold uppercase tracking-[0.16em]',
                activeTab === tab.id ? 'text-primary' : 'text-white/40',
              )}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenAddLog}
          className="w-14 h-14 -mt-8 rounded-full bg-primary text-black shadow-xl shadow-primary/20 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={30} strokeWidth={3} />
        </button>

        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 pb-3 text-[10px] font-bold uppercase tracking-[0.16em]',
                activeTab === tab.id ? 'text-primary' : 'text-white/40',
              )}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

