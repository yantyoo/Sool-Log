import React from 'react';
import { Capacitor } from '@capacitor/core';
import { GlassWater, LogIn, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';

export default function LoginScreen() {
  const { login, authError, loggingIn } = useAuth();
  const platform = Capacitor.getPlatform();
  const shellMode = platform === 'ios' || platform === 'android' ? 'Native shell' : 'Web preview';

  return (
    <div className="min-h-screen bg-background px-8 py-16 flex flex-col justify-between overflow-hidden relative">
      {/* Cinematic Background Glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[80%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
      
      {/* Animated Floating Particles (Optional CSS-only) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
         <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary-light rounded-full animate-bounce [animation-duration:3s]" />
         <div className="absolute top-3/4 left-1/2 w-1 h-1 bg-secondary rounded-full animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] as const }}
        className="pt-24 space-y-12 relative z-10"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
          <div className="w-24 h-24 rounded-[32px] glass flex items-center justify-center relative overflow-hidden group border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent" />
            <GlassWater size={48} className="text-white relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-[1px] bg-primary-light/40" />
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary-light font-black">Private Ritual</p>
            </motion.div>
            <h1 className="text-6xl font-black tracking-tighter leading-[0.95] text-white font-sans">
              Smart<br />
              <span className="text-white/20">Drinking</span><br />
              Ritual.
            </h1>
          </div>
          
          <p className="text-[17px] leading-relaxed text-white/40 max-w-[300px] font-medium tracking-tight">
            당신의 음주 패턴을 예술적으로 기록하고<br />
            더 스마트한 내일을 설계하세요.
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
          <button 
            onClick={login} 
            className="btn-primary w-full h-18 text-lg disabled:opacity-50 disabled:scale-100 group relative overflow-hidden" 
            disabled={loggingIn}
          >
            {loggingIn ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="font-bold tracking-tight">시작하는 중...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                   <LogIn size={20} className="text-white" />
                </div>
                <span className="font-extrabold tracking-tight">Google 계정으로 계속하기</span>
              </div>
            )}
          </button>

          <p className="text-center text-[10px] text-white/20 font-bold tracking-widest uppercase flex items-center justify-center gap-2">
            <ShieldCheck size={12} />
            Secure Authentication powered by Firebase
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

        <div className="flex flex-col items-center gap-6 pt-4">
          <div className="flex items-center gap-4">
             <div className="w-1 h-1 rounded-full bg-white/10" />
             <p className="text-[9px] uppercase tracking-[0.3em] text-white/10 font-black">
               {shellMode} Edition 1.0
             </p>
             <div className="w-1 h-1 rounded-full bg-white/10" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
