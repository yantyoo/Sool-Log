import React from 'react';
import { Bell, UserCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function TopBar({ onOpenNotifications }: { onOpenNotifications?: () => void }) {
  const { user } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-40 px-6 pt-8 pb-4 pointer-events-none flex justify-between items-start">
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center border border-primary/20 backdrop-blur-md">
           <Sparkles size={16} className="text-primary-light" />
        </div>
        <span className="text-[12px] font-black tracking-[0.25em] text-white/50 uppercase">Sool.Log</span>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button 
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-[14px] flex items-center justify-center text-white/50 hover:text-white bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl transition-all active:scale-90"
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary-light rounded-full shadow-[0_0_8px_rgba(192,193,255,1)]"></span>
        </button>
        
        <button className="w-10 h-10 rounded-[14px] overflow-hidden border border-white/[0.05] bg-white/[0.03] backdrop-blur-xl p-0.5 transition-all active:scale-90">
          <div className="w-full h-full rounded-[10px] overflow-hidden bg-white/5 flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle size={22} className="text-white/20" />
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
