import React from 'react';
import { LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { BottomTab } from '../types/navigation';
import BottomNavigation from './BottomNavigation';

interface AppShellProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
  onOpenAddLog: () => void;
  children: React.ReactNode;
}

export default function AppShell({ activeTab, onTabChange, onOpenAddLog, children }: AppShellProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white">
      <div className="mx-auto max-w-md min-h-screen pb-20">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0b10]/85 backdrop-blur-xl">
          <div className="h-16 px-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Sool-Log</p>
              <h1 className="text-lg font-black tracking-tight">기록 중심 알코올 관리</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={logout}
                className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserCircle size={20} className="text-white/40" />
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 py-4 space-y-5">{children}</main>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} onOpenAddLog={onOpenAddLog} />
    </div>
  );
}

