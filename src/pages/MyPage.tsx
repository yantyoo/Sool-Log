import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { LogOut, Award, User as UserIcon, Bell, Database, Trash2, Download, Upload, ChevronRight, ShieldCheck, Compass, Heart, Sparkles, BookOpen, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../state/AppDataContext';
import { format } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';
import { db } from '../lib/firebase';

export default function MyPage() {
  const { user, logout } = useAuth();
  const { logs, goals, healthProfile, saveHealthProfile } = useAppData();
  
  // Health Profile local states
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<number>(70);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync health profile when loaded
  useEffect(() => {
    if (healthProfile) {
      setGender(healthProfile.gender);
      setWeight(healthProfile.weight);
    }
  }, [healthProfile]);

  // Load push settings from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sool_log_push_notifications') === 'true';
    setPushNotifications(saved);
  }, []);

  const totalSpend = logs.reduce((acc, l) => acc + (l.price || 0), 0);

  // Gamification calculations
  const getSoberDays = () => {
    if (logs.length === 0) return 0;
    const lastLogDate = new Date(logs[0].consumedAt);
    lastLogDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = today.getTime() - lastLogDate.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const soberDays = getSoberDays();
  const activeGoalsCount = goals.filter(g => g.enabled).length;
  const gamificationScore = logs.length * 10 + activeGoalsCount * 30 + soberDays * 20;

  const getLevelInfo = (score: number) => {
    if (score < 100) {
      return {
        level: 1,
        title: '아기 솜털 간 🍼',
        desc: '음주 기록을 막 시작한 새싹입니다. 안전한 주량 기록을 쌓아보세요!',
        next: 100,
        prev: 0
      };
    } else if (score < 300) {
      return {
        level: 2,
        title: '청정 숲 산책자 🌲',
        desc: '자신만의 페이스를 유지하며 신체 해독을 챙기는 조율자입니다.',
        next: 300,
        prev: 100
      };
    } else if (score < 600) {
      return {
        level: 3,
        title: '강철 위벽의 파수꾼 🛡️',
        desc: '지속적인 절주 목표와 스마트 음주 루틴을 체득한 건강 지킴이입니다.',
        next: 600,
        prev: 300
      };
    } else if (score < 1000) {
      return {
        level: 4,
        title: '주류 아카이브 현자 🔮',
        desc: '도수와 안주의 페어링까지 예술적으로 성찰하는 지혜로운 음주가입니다.',
        next: 1000,
        prev: 600
      };
    } else {
      return {
        level: 5,
        title: '무결점 주류 대선사 👑',
        desc: '신체 밸런스와 주류의 조화를 극도로 통제하는 진정한 라이프스타일 거장!',
        next: score,
        prev: 1000
      };
    }
  };

  const levelInfo = getLevelInfo(gamificationScore);
  const levelProgress = levelInfo.next === levelInfo.prev ? 100 : Math.min(100, ((gamificationScore - levelInfo.prev) / (levelInfo.next - levelInfo.prev)) * 100);

  const badges = [
    { id: 'first_step', name: '첫 걸음 👣', desc: '첫 음주 기록 완료', icon: Award, color: 'text-primary-light bg-primary/10 border-primary/20', unlocked: logs.length >= 1 },
    { id: 'sober_3', name: '청정 3일 🛡️', desc: '3일 연속 해독 유지', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', unlocked: soberDays >= 3 },
    { id: 'goal_setter', name: '목표 설계자 🎯', desc: '첫 목표 등록 완료', icon: Compass, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', unlocked: goals.length >= 1 },
    { id: 'variety_drinker', name: '주류 탐험가 🗺️', desc: '3가지 이상 주종 기록', icon: BookOpen, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', unlocked: new Set(logs.map(l => l.drinkCategory)).size >= 3 },
    { id: 'wallet_guardian', name: '지갑 수호자 💰', desc: '지출 목표 등록 완료', icon: Heart, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', unlocked: goals.some(g => g.goalType === 'spending') },
    { id: 'steady_archivist', name: '기록 마스터 ✍️', desc: '기록 5회 이상 등록', icon: Sparkles, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', unlocked: logs.length >= 5 },
  ];

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await saveHealthProfile({ gender, weight: Number(weight) });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTogglePush = () => {
    const nextVal = !pushNotifications;
    setPushNotifications(nextVal);
    localStorage.setItem('sool_log_push_notifications', String(nextVal));
  };

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify({ logs, goals }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `sool-log-backup-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error(err);
      alert("백업 파일 생성 도중 오류가 발생했습니다.");
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!window.confirm("주의: 백업된 데이터로 덮어씌웁니다. 기존 데이터가 삭제 및 교체될 수 있습니다. 진행하시겠습니까?")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.logs || !Array.isArray(parsed.logs)) {
          alert("유효한 Sool-Log 백업 파일이 아닙니다. (logs 배열 유실)");
          return;
        }

        const { writeBatch, doc } = await import('firebase/firestore');
        const batch = writeBatch(db);

        // Upload logs
        parsed.logs.forEach((log: any) => {
          const logRef = doc(db, 'users', user.uid, 'logs', log.id || crypto.randomUUID());
          batch.set(logRef, log);
        });

        // Upload goals
        if (parsed.goals && Array.isArray(parsed.goals)) {
          parsed.goals.forEach((goal: any) => {
            const goalRef = doc(db, 'users', user.uid, 'goals', goal.id || crypto.randomUUID());
            batch.set(goalRef, goal);
          });
        }

        await batch.commit();
        alert("백업 파일이 성공적으로 복원되었습니다!");
      } catch (err) {
        console.error(err);
        alert("데이터 복원 도중 에러가 발생했습니다. 백업 파일을 확인해 주세요.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (!user) return;
    
    if (!window.confirm("정말로 모든 음주 기록과 설정된 목표를 초기화하시겠습니까?\n이 작업은 복구할 수 없습니다.")) {
      return;
    }
    
    try {
      const { writeBatch, collection, getDocs } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      const logsSnap = await getDocs(collection(db, 'users', user.uid, 'logs'));
      logsSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      const goalsSnap = await getDocs(collection(db, 'users', user.uid, 'goals'));
      goalsSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      alert("모든 데이터가 성공적으로 초기화되었습니다.");
    } catch (error) {
      console.error("Failed to reset data", error);
      alert("데이터 초기화에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="space-y-8 pb-32"
    >
      {/* Header Area */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary font-black mb-0.5">내 정보 관리</p>
          <h2 className="text-2xl font-black tracking-tight">마이페이지</h2>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card p-8 flex flex-col items-center space-y-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-700" />
        
        <div className="w-24 h-24 rounded-[36px] glass p-1 shadow-2xl relative z-10 border-white/10">
           <div className="w-full h-full rounded-[30px] overflow-hidden bg-white/5 flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Award size={36} className="text-white/20" />
              )}
           </div>
        </div>
        <div className="text-center relative z-10 space-y-1">
             <h3 className="text-2xl font-black tracking-tight">{user?.displayName || '사용자'}</h3>
             <p className="text-xs text-white/40 font-bold tracking-wide">{user?.email}</p>
             <div className="pt-2">
               <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black tracking-widest text-primary-light">
                 {levelInfo.title}
               </span>
             </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 flex flex-col items-center justify-center space-y-1 bg-linear-to-br from-white/[0.03] to-transparent">
           <div className="text-[9px] text-white/35 font-black tracking-widest uppercase text-center">누적 기록 횟수</div>
           <p className="text-xl font-black text-white">{logs.length}<span className="text-xs font-bold text-white/40 ml-1">회</span></p>
        </div>
        <div className="card p-5 flex flex-col items-center justify-center space-y-1 bg-linear-to-bl from-white/[0.03] to-transparent">
           <div className="text-[9px] text-white/35 font-black tracking-widest uppercase text-center">누적 지출 금액</div>
           <p className="text-xl font-black text-white">{formatCurrency(totalSpend).replace('₩','')}<span className="text-xs font-bold text-white/40 ml-1">원</span></p>
        </div>
      </div>

      {/* Sober Level Progress Card */}
      <div className="card p-6 space-y-4 bg-linear-to-br from-primary/5 to-transparent border-primary/10">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] text-primary font-black uppercase tracking-widest">Sober Level System</span>
            <h4 className="text-lg font-black text-white flex items-center gap-2">
              <span>LV.{levelInfo.level}</span>
              <span className="text-primary-light">{levelInfo.title}</span>
            </h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-white/35 font-bold">건강 스코어</span>
            <p className="text-sm font-black text-white">{gamificationScore} <span className="text-[9px] text-white/40">PTS</span></p>
          </div>
        </div>

        <p className="text-xs text-white/50 leading-relaxed font-semibold">{levelInfo.desc}</p>

        <div className="space-y-2 pt-1">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5 p-0.5">
            <div 
              className="h-full rounded-full bg-linear-to-r from-primary to-primary-light transition-all duration-1000" 
              style={{ width: `${levelProgress}%` }} 
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/30 font-bold">
            <span>LV.{levelInfo.level} ({levelInfo.prev} PTS)</span>
            {levelInfo.next === gamificationScore ? (
              <span>최고 등급 달성! 🎉</span>
            ) : (
              <span>LV.{levelInfo.level + 1}까지 {levelInfo.next - gamificationScore} PTS 남음</span>
            )}
          </div>
        </div>
      </div>

      {/* Achievements Badges Grid */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-2 flex items-center gap-1.5">
          <Award size={12} /> 나의 획득 배지 ({badges.filter(b => b.unlocked).length} / {badges.length})
        </p>

        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className={cn(
                  "card p-4 flex flex-col items-center justify-center text-center space-y-2 border transition-all duration-500",
                  badge.unlocked 
                    ? `${badge.color} scale-100` 
                    : "bg-white/[0.01] border-white/5 text-white/20 select-none grayscale opacity-40"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center relative",
                  badge.unlocked ? "bg-white/10" : "bg-white/5"
                )}>
                  <Icon size={18} />
                  {!badge.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                      <Lock size={12} className="text-white/40" />
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black tracking-tight text-white/90">{badge.name}</p>
                  <p className="text-[8px] font-medium text-white/30 tracking-tight leading-none">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Sections - Directly in Main Depth */}
      <div className="space-y-6">
        {/* 1. Health Body Profile Settings */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-2 flex items-center gap-1.5">
            <UserIcon size={12} /> 신체 정보 설정 (해독 속도 계산용)
          </p>
          
          <div className="card p-5 space-y-4 border-white/5">
            {/* Gender Selection */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-white/40 font-bold ml-1">성별</span>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setGender('male')}
                  className={cn(
                    "h-12 rounded-xl text-xs font-bold border transition-all",
                    gender === 'male' 
                      ? 'btn-primary' 
                      : 'glass border-white/5 text-white/60 hover:bg-white/5'
                  )}
                >
                  남성
                </button>
                <button 
                  onClick={() => setGender('female')}
                  className={cn(
                    "h-12 rounded-xl text-xs font-bold border transition-all",
                    gender === 'female' 
                      ? 'btn-primary' 
                      : 'glass border-white/5 text-white/60 hover:bg-white/5'
                  )}
                >
                  여성
                </button>
              </div>
            </div>

            {/* Weight Selection */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-white/40 font-bold ml-1">몸무게</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setWeight(prev => Math.max(30, prev - 1))}
                  className="w-12 h-12 rounded-xl glass border-white/5 flex items-center justify-center font-bold text-white/60 hover:bg-white/10 active:scale-95 transition-transform"
                >
                  -
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(30, Number(e.target.value)))}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-center font-black text-sm text-white focus:outline-none focus:border-primary/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30">KG</span>
                </div>
                <button 
                  onClick={() => setWeight(prev => Math.min(200, prev + 1))}
                  className="w-12 h-12 rounded-xl glass border-white/5 flex items-center justify-center font-bold text-white/60 hover:bg-white/10 active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="btn-primary w-full h-12 text-xs"
            >
              {savingProfile ? '저장 중...' : '신체 정보 저장'}
            </button>
          </div>
        </div>

        {/* 2. Notification Toggle */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-2 flex items-center gap-1.5">
            <Bell size={12} /> 알림 설정
          </p>
          
          <button 
            onClick={handleTogglePush}
            className="w-full h-16 px-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] active:scale-[0.99] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", pushNotifications ? "bg-primary/10 text-primary-light" : "bg-white/5 text-white/40")}>
                <Bell size={18} />
              </div>
              <span className="font-bold text-sm text-white/80">일일 기록 권장 리마인더 알림 받기</span>
            </div>
            <div className={cn(
              "w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center",
              pushNotifications ? "bg-primary-light" : "bg-white/10"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300",
                pushNotifications ? "translate-x-5" : "translate-x-0"
              )} />
            </div>
          </button>
        </div>
        
        {/* 3. Data Backup and Restore */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 pl-2 flex items-center gap-1.5">
            <Database size={12} /> 데이터 관리 (백업 및 복원)
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleExportData}
              className="h-16 px-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-3 hover:bg-white/[0.05] active:scale-[0.99] transition-all group"
            >
              <Download size={18} className="text-white/40 group-hover:text-primary-light transition-colors" />
              <span className="font-bold text-xs text-white/80">백업 내보내기</span>
            </button>
            
            <label 
              className="h-16 px-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-3 hover:bg-white/[0.05] active:scale-[0.99] transition-all group cursor-pointer"
            >
              <Upload size={18} className="text-white/40 group-hover:text-primary-light transition-colors" />
              <span className="font-bold text-xs text-white/80">백업 가져오기</span>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImportData}
                accept=".json"
                className="hidden"
              />
            </label>
          </div>

          <button 
            onClick={handleResetData}
            className="w-full h-16 px-5 rounded-2xl border border-red-500/10 bg-red-500/5 flex items-center justify-between hover:bg-red-500/10 active:scale-[0.99] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <Trash2 size={18} />
              </div>
              <span className="font-bold text-sm text-red-400">모든 기록 초기화</span>
            </div>
            <ChevronRight size={18} className="text-red-500/30 group-hover:text-red-500/50 transition-colors" />
          </button>
        </div>
        
        {/* Logout */}
        <div className="pt-2">
          <button onClick={logout} className="w-full h-14 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500 font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <LogOut size={18} /> 로그아웃
          </button>
        </div>
        
        <div className="pt-6 pb-2 text-center">
          <p className="text-[10px] font-bold text-white/20 tracking-widest uppercase">SOOL-LOG v1.3.0</p>
          <p className="text-[9px] font-medium text-white/10 mt-1">Design with Google Stitch MCP</p>
        </div>
      </div>
    </motion.div>
  );
}
