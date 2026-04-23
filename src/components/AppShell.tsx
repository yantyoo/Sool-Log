import React from 'react';
import type { BottomTab } from '../types/navigation';
import BottomNavigation from './BottomNavigation';
import TopBar from './TopBar';

interface AppShellProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
  onOpenAddLog: () => void;
  onOpenNotifications?: () => void;
  children: React.ReactNode;
}

export default function AppShell({ 
  activeTab, 
  onTabChange, 
  onOpenAddLog, 
  onOpenNotifications,
  children 
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      {/* Premium Framework Container */}
      <div className="mx-auto max-w-lg min-h-screen flex flex-col relative">
        
        {/* Integrated Redesigned TopBar (Now Absolute & Minimal) */}
        <TopBar onOpenNotifications={onOpenNotifications} />

        {/* Dynamic Editorial Content Area */}
        <main className="flex-1 px-6 pt-24 pb-40 relative z-0">
          {/* Internal Page Transition Container */}
          <div className="w-full h-full animate-[fadeIn_0.6s_ease_out]">
            {children}
          </div>
        </main>

        {/* Floating Navigation Frame */}
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
          onOpenAddLog={onOpenAddLog} 
        />
      </div>

      {/* Global Ambient Glow (Optional additional layer) */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
