import React from 'react';
import { Capacitor } from '@capacitor/core';
import { GlassWater, LogIn, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 text-[#191919]">
    <path d="M12 3c-5.523 0-10 3.73-10 8.33 0 2.978 1.867 5.59 4.675 7.086l-1.183 4.338c-.144.529.418.986.877.68l5.127-3.414c.167.014.335.02.504.02 5.523 0 10-3.73 10-8.33s-4.477-8.33-10-8.33z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 text-white">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.18.66-2.9 1.49-.62.7-1.16 1.84-1.01 2.96 1.12.09 2.26-.58 2.92-1.39z" />
  </svg>
);

export default function LoginScreen() {
  const { login, authError, loggingIn } = useAuth();
  
  const platform = Capacitor.getPlatform();
  const shellMode = platform === 'ios' || platform === 'android' ? 'Native shell' : 'Web preview';

  return (
    <div className="min-h-screen bg-background px-8 py-16 flex flex-col justify-between overflow-hidden relative">
      {/* Cinematic Background Glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[80%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
      
      {/* Animated Floating Particles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
         <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce [animation-duration:3s]" />
         <div className="absolute top-3/4 left-1/2 w-1 h-1 bg-secondary rounded-full animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] as const }}
        className="pt-16 space-y-8 relative z-10"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
          <div className="w-20 h-20 rounded-[28px] glass flex items-center justify-center relative overflow-hidden group border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent" />
            <GlassWater size={40} className="text-white relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tight leading-[1.1] text-white font-sans">
            나만의 스마트한<br />
            음주 리추얼,<br />
            <span className="text-primary-light font-black drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">술로그</span>
          </h1>
          
          <p className="text-sm leading-relaxed text-white/40 max-w-[300px] font-medium tracking-tight">
            당신의 음주 패턴을 기록하고<br />
            더 건강한 내일을 설계하세요.
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="space-y-8 relative z-10"
      >
        <div className="space-y-4">
          {loggingIn ? (
            <div className="w-full h-44 glass border-white/5 rounded-[28px] flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-primary-light/30 border-t-primary-light rounded-full animate-spin" />
              <p className="text-xs font-black text-white/60 tracking-wider">인증을 진행하는 중입니다...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Google Login Button */}
              <button 
                onClick={() => login('google')} 
                className="w-full h-15 rounded-[22px] font-extrabold text-sm text-[#1f1f1f] bg-white hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center px-6 gap-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md" 
                disabled={loggingIn}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <GoogleIcon />
                </div>
                <span className="flex-1 text-left">Google 계정으로 계속하기</span>
              </button>

              {/* Kakao Login Button */}
              <button 
                onClick={() => login('kakao')} 
                className="w-full h-15 rounded-[22px] font-extrabold text-sm text-[#191919] bg-[#FEE500] hover:bg-[#FEE500]/90 active:scale-[0.98] transition-all flex items-center px-6 gap-4 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" 
                disabled={loggingIn}
              >
                <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center">
                  <KakaoIcon />
                </div>
                <span className="flex-1 text-left">카카오톡으로 계속하기</span>
              </button>

              {/* Apple Login Button */}
              <button 
                onClick={() => login('apple')} 
                className="w-full h-15 rounded-[22px] font-extrabold text-sm text-white bg-black border border-white/15 hover:bg-white/[0.03] active:scale-[0.98] transition-all flex items-center px-6 gap-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
                disabled={loggingIn}
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <AppleIcon />
                </div>
                <span className="flex-1 text-left">Apple로 계속하기</span>
              </button>
            </div>
          )}

          <p className="text-center text-[10px] text-white/20 font-bold tracking-wider flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} />
            Firebase를 통한 안전한 보안 로그인
          </p>
        </div>

        {authError ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-[24px] bg-red-500/5 border border-red-500/10 backdrop-blur-md"
          >
            <p className="text-xs text-red-400/80 leading-relaxed text-center font-bold">
              {authError}
            </p>
          </motion.div>
        ) : null}

        <div className="flex flex-col items-center gap-6 pt-2">
          <div className="flex items-center gap-4">
             <div className="w-1 h-1 rounded-full bg-white/10" />
             <p className="text-[9px] tracking-wider text-white/10 font-bold">
               술로그 v1.0 ({shellMode === 'Native shell' ? '앱' : '웹'} 버전)
             </p>
             <div className="w-1 h-1 rounded-full bg-white/10" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
