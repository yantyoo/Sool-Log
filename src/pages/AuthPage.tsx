import React from 'react';
import { motion } from 'motion/react';
import { GlassWater } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#191919]">
    <path d="M12 3c-5.523 0-10 3.73-10 8.33 0 2.978 1.867 5.59 4.675 7.086l-1.183 4.338c-.144.529.418.986.877.68l5.127-3.414c.167.014.335.02.504.02 5.523 0 10-3.73 10-8.33s-4.477-8.33-10-8.33z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.18.66-2.9 1.49-.62.7-1.16 1.84-1.01 2.96 1.12.09 2.26-.58 2.92-1.39z" />
  </svg>
);

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

      <div className="w-full space-y-3 relative z-10">
        {/* Google Login */}
        <button
          onClick={() => login('google')}
          className="w-full py-4.5 px-8 bg-white/5 border border-white/10 text-white rounded-[24px] font-black flex items-center justify-center space-x-3 active:scale-95 transition-all text-xs uppercase tracking-widest cursor-pointer"
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4 invert" />
          <span>Google 로그인</span>
        </button>

        {/* Kakao Login */}
        <button
          onClick={() => login('kakao')}
          className="w-full py-4.5 px-8 bg-[#FEE500] text-[#191919] rounded-[24px] font-black flex items-center justify-center space-x-3 active:scale-95 transition-all text-xs uppercase tracking-widest cursor-pointer"
        >
          <KakaoIcon />
          <span>카카오 로그인</span>
        </button>

        {/* Apple Login */}
        <button
          onClick={() => login('apple')}
          className="w-full py-4.5 px-8 bg-black border border-white/15 text-white rounded-[24px] font-black flex items-center justify-center space-x-3 active:scale-95 transition-all text-xs uppercase tracking-widest cursor-pointer"
        >
          <AppleIcon />
          <span>Apple 로그인</span>
        </button>

        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black pt-4">
          © 2026 Sool-Log. All rights reserved.
        </p>
      </div>
    </div>
  );
}
