import React from 'react';
import { GlassWater } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { login, authError } = useAuth();

  return (
    <div className="min-h-screen px-6 py-12 flex flex-col justify-between text-center">
      <div className="pt-16 space-y-8">
        <div className="w-24 h-24 mx-auto rounded-[32px] border border-white/15 bg-white/5 flex items-center justify-center">
          <GlassWater size={44} className="text-primary" />
        </div>
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Sool-Log</p>
          <h1 className="text-5xl font-black tracking-tight">술 기록, 한 화면에서</h1>
          <p className="text-sm leading-relaxed text-white/45">
            개인 음주 기록을 빠르게 남기고, 주간·월간 패턴과 목표 진행을 확인하는 모바일 앱입니다.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button onClick={login} className="btn-primary w-full py-4">
          Google 로그인
        </button>
        {authError ? (
          <p className="text-xs leading-relaxed text-red-300/90 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            {authError}
          </p>
        ) : null}
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
          login to start your personal record
        </p>
      </div>
    </div>
  );
}
