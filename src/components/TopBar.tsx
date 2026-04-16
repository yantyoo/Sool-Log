import React from 'react';
import { Bell, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function TopBar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 h-[70px] bg-black/20 backdrop-blur-md px-10 flex items-center justify-between z-40 border-b border-white/10">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-black tracking-tighter text-primary uppercase">술로그</h1>
      </div>
      <div className="flex items-center space-x-5">
        <button className="relative w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-[#0a0b10]"></span>
        </button>
        <button className="w-9 h-9 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <UserCircle size={20} className="text-white/40" />
          )}
        </button>
      </div>
    </header>
  );
}
