import React from 'react';
import { Capacitor } from '@capacitor/core';
import { GlassWater, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';

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
  const [termsAccepted, setTermsAccepted] = React.useState(false);
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
                className="w-full h-15 rounded-[22px] font-extrabold text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all flex items-center px-6 gap-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
                disabled={loggingIn || !termsAccepted}
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <LogIn size={16} className="text-white" />
                </div>
                <span className="flex-1 text-left">Google 계정으로 계속하기</span>
              </button>

              {/* Kakao Login Button */}
              <button 
                onClick={() => login('kakao')} 
                className="w-full h-15 rounded-[22px] font-extrabold text-sm text-[#191919] bg-[#FEE500] hover:bg-[#FEE500]/90 active:scale-[0.98] transition-all flex items-center px-6 gap-4 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" 
                disabled={loggingIn || !termsAccepted}
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
                disabled={loggingIn || !termsAccepted}
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <AppleIcon />
                </div>
                <span className="flex-1 text-left">Apple로 계속하기</span>
              </button>

              {/* Terms and Age Verification Checkbox */}
              <div className="flex items-start gap-3 px-3.5 py-3.5 bg-white/[0.01] border border-white/5 rounded-2xl mt-1 text-left">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={termsAccepted} 
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4.5 h-4.5 rounded accent-primary border-white/20 bg-white/5 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-white/40 font-semibold cursor-pointer select-none leading-snug">
                  (필수) 만 19세 이상 성인이며,{' '}
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); alert('이용약관: 술로그는 사용자의 음주량 및 신체 조건에 따른 분해 속도를 기록/시뮬레이션하는 개인 캘린더 아카이브 서비스입니다.'); }} 
                    className="text-primary-light underline hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 inline font-bold"
                  >
                    이용약관
                  </button>
                  {' '}및{' '}
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); alert('개인정보처리방침: 당사는 회원 식별 및 맞춤 정보 표시를 위해 소셜 가입 프로필(이메일, 닉네임, 프로필 이미지)만을 수집하며, 어떠한 경우에도 외부 기업이나 제3자에게 임의로 양도하거나 공유하지 않습니다.'); }} 
                    className="text-primary-light underline hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 inline font-bold"
                  >
                    개인정보처리방침
                  </button>
                  에 동의합니다.
                </label>
              </div>
            </div>
          )}

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
