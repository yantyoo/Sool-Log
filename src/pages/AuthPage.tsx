import React from 'react';
import { motion } from 'motion/react';
import { GlassWater } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-12 text-center relative overflow-hidden">
      <div className="mt-20 space-y-8 relative z-10">
        <motion.div
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-24 h-24 glass rounded-[40px] flex items-center justify-center mx-auto border border-white/20 shadow-2xl"
        >
          <GlassWater size={48} className="text-primary" />
        </motion.div>
        
        <div className="space-y-3">
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter">술로그</h1>
          <p className="text-white/40 font-bold text-sm uppercase tracking-[0.3em] leading-relaxed">
            나만의 주류 기록<br />아카이빙 플랫폼
          </p>
        </div>
      </div>

      <div className="w-full space-y-6 relative z-10">
        <button
          onClick={login}
          className="w-full py-5 px-8 bg-primary text-black rounded-[24px] font-black flex items-center justify-center space-x-4 shadow-2xl shadow-primary/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5 invert" />
          <span>Google 로그인</span>
        </button>
        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
          © 2026 Sool-Log. All rights reserved.
        </p>
      </div>
    </div>
  );
}
