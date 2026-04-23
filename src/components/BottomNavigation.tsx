import React from 'react';
import { BarChart3, ClipboardList, Home, Plus, User, Zap, LayoutGrid, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import type { BottomTab } from '../types/navigation';
import { motion } from 'motion/react';

interface BottomNavigationProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
  onOpenAddLog: () => void;
}

export default function BottomNavigation({ activeTab, onTabChange, onOpenAddLog }: BottomNavigationProps) {
  const tabs: Array<{ id: BottomTab; label: string; icon: React.ComponentType<{ size?: number, strokeWidth?: number }> }> = [
    { id: 'home', label: 'HOME', icon: LayoutGrid },
    { id: 'logs', label: 'LOGS', icon: ClipboardList },
    { id: 'analysis', label: 'STATS', icon: Activity },
    { id: 'mypage', label: 'ME', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(env(safe-area-inset-bottom)+12px)] pointer-events-none">
      <div className="mx-auto max-w-lg h-24 rounded-[32px] border border-white/[0.06] bg-background/60 backdrop-blur-3xl px-8 flex items-center justify-between relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
        
        {/* Subtle Background Glow for Navigation */}
        <div className="absolute inset-0 bg-linear-to-t from-primary/5 to-transparent pointer-events-none" />

        {/* Left Tabs */}
        <div className="flex flex-1 justify-around items-center gap-2">
          {tabs.slice(0, 2).map((tab) => (
            <TabButton 
              key={tab.id} 
              tab={tab} 
              isActive={activeTab === tab.id} 
              onClick={() => onTabChange(tab.id)} 
            />
          ))}
        </div>

        {/* Central Record Button - High Impact */}
        <div className="flex justify-center -translate-y-2 px-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={onOpenAddLog}
            className="w-18 h-18 rounded-3xl bg-linear-to-br from-primary to-primary-dark text-white shadow-[0_15px_30px_-5px_rgba(99,102,241,0.5)] flex items-center justify-center relative overflow-hidden group border border-white/20"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus size={36} strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Right Tabs */}
        <div className="flex flex-1 justify-around items-center gap-2">
          {tabs.slice(2).map((tab) => (
            <TabButton 
              key={tab.id} 
              tab={tab} 
              isActive={activeTab === tab.id} 
              onClick={() => onTabChange(tab.id)} 
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function TabButton({ tab, isActive, onClick }: { tab: any, isActive: boolean, onClick: () => void }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 transition-all duration-500 relative py-2',
        isActive ? 'text-primary-light' : 'text-white/20 hover:text-white/40'
      )}
    >
      <div className="relative">
        {isActive && (
          <motion.div 
            layoutId="tabGlow"
            className="absolute inset-[-12px] bg-primary/15 rounded-full blur-xl z-0" 
          />
        )}
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
      </div>
      <span className={cn(
        'text-[10px] font-black tracking-[0.25em] uppercase relative z-10',
        isActive ? 'opacity-100' : 'opacity-60'
      )}>
        {tab.label}
      </span>
      {isActive && (
        <motion.div 
          layoutId="activeTabIndicator"
          className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary-light shadow-[0_0_10px_rgba(192,193,255,1)]" 
        />
      )}
    </button>
  );
}
