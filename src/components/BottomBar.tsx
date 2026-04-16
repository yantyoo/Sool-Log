import React from 'react';
import { Home, Rss, Plus, Star, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRecordClick: () => void;
}

export default function BottomBar({ activeTab, onTabChange, onRecordClick }: BottomBarProps) {
  const tabs = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'feed', label: '피드', icon: Rss },
    { id: 'record', label: '', icon: Plus, isRecord: true },
    { id: 'recommend', label: '추천', icon: Star },
    { id: 'mypage', label: '마이', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0a0b10]/90 backdrop-blur-lg border-t border-white/10 px-10 flex items-center justify-between z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        if (tab.isRecord) {
          return (
            <button
              key={tab.id}
              onClick={onRecordClick}
              className="relative -top-10 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-black shadow-xl shadow-primary/30 active:scale-90 transition-transform font-bold"
            >
              <Icon size={32} strokeWidth={3} />
            </button>
          );
        }
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "bottom-nav-item gap-1",
              activeTab === tab.id ? "text-primary" : "text-white/40"
            )}
          >
            <Icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
