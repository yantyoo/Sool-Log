import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppDataProvider, useAppData } from './state/AppDataContext';
import { ToastProvider } from './contexts/ToastContext';
import AppShell from './components/AppShell';
import LoginScreen from './screens/auth/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import LogListScreen from './screens/logs/LogListScreen';
import AnalysisScreen from './screens/analysis/AnalysisScreen';
import MyPage from './pages/MyPage';
import ProgressScreen from './screens/goals/ProgressScreen';
import AddLogModal from './screens/logs/AddLogModal';
import DrinkSearchScreen from './screens/logs/DrinkSearchScreen';
import LogDetailScreen from './screens/logs/LogDetailScreen';
import { createEmptyLogForm, logToForm } from './lib/recordForms';
import { emitToast } from './lib/toast';
import type { DrinkingLog, LogFormValues } from './types/log';
import type { BottomTab, OverlayView } from './types/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Trash2, AlertCircle, ShieldCheck, GlassWater } from 'lucide-react';
import { cn } from './lib/utils';

const TERMS_TEXT = `술로그 이용약관

제 1 조 (목적)
본 약관은 술로그(이하 "서비스")가 제공하는 음주 기록 및 건강 다이어리 아카이브 서비스의 이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.

제 2 조 (이용약관의 효력 및 변경)
1. 본 약관은 서비스 등록 화면 또는 공식 경로를 통해 이용자에게 공시하며, 동의함으로써 즉시 효력이 발생합니다.
2. 서비스는 필요 시 관련 법령을 위배하지 않는 범위 내에서 본 약관을 개정할 수 있습니다.

제 3 조 (서비스의 이용 및 한계)
1. 서비스는 사용자의 음주 패턴 기록, 알코올 섭취량에 기반한 해독 시뮬레이션 및 절주 목표 현황 시각화를 제공합니다.
2. 본 서비스가 제공하는 간 해독 소요 시간 등 모든 웰니스 데이터는 위드마크 공식을 바탕으로 계산된 단순 참고용 추정치이며, 의학적 소견이나 정밀 진단을 대체할 수 없습니다.

제 4 조 (이용자의 의무)
이용자는 음주 기록 작성 시 타인의 권리를 침해하거나 허위 사실을 유포해서는 안 되며, 서비스가 규정한 안내 요령을 준수해야 합니다.`;

const PRIVACY_TEXT = `술로그 개인정보처리방침

1. 수집하는 개인정보 항목
당사는 소셜 로그인(구글, 카카오, 애플)을 통한 회원가입 시 다음과 같은 정보를 수집합니다:
- 필수항목: 이메일 주소, 닉네임, 프로필 이미지 URL
- 선택항목 (프로필 설정 시): 성별, 몸무게 (위드마크 공식 기반 해독 소요 시간 계산 목적)

2. 개인정보의 수집 및 이용 목적
수집된 개인정보는 다음의 목적을 위해 활용됩니다:
- 회원 식별 및 소셜 로그인 연동
- 개인화된 해독 시뮬레이션 결과 제공 및 대시보드 통계 시각화
- 서비스 개선을 위한 익명 통계 처리

3. 개인정보의 보유 및 이용 기간
이용자의 개인정보는 원칙적으로 회원 탈퇴 시 혹은 서비스 종료 시까지 보유하며, 회원 탈퇴 시 수집된 데이터는 복구 불가능한 방법으로 즉시 파기합니다.

4. 제3자 제공 및 위탁
당사는 이용자의 사전 동의 없이 개인정보를 제3자에게 제공하거나 외부 기관에 위탁하지 않습니다.`;

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        <div className="w-14 h-14 rounded-full border-4 border-white/5 border-t-primary animate-spin relative z-10" />
      </div>
    </div>
  );
}

function AppWorkflow() {
  const { user, dbUser, acceptTerms, loading: authLoading } = useAuth();
  const { addLog, updateLog, deleteLog, getLogById, ready } = useAppData();
  const [activeTab, setActiveTab] = useState<BottomTab>('home');
  const [overlay, setOverlay] = useState<OverlayView>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [logForm, setLogForm] = useState<LogFormValues>(createEmptyLogForm());
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [savingLog, setSavingLog] = useState(false);

  const [onboardTermsAccepted, setOnboardTermsAccepted] = useState(false);
  const [activeDoc, setActiveDoc] = useState<'terms' | 'privacy' | null>(null);
  const [savingOnboard, setSavingOnboard] = useState(false);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;

  // Fullscreen terms consent overlay for first-time signups
  if (user && dbUser && !dbUser.termsAcceptedAt) {
    return (
      <div className="min-h-screen bg-background px-8 py-16 flex flex-col justify-between overflow-hidden relative">
        <div className="absolute top-[-15%] left-[-15%] w-[80%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-20 space-y-10 relative z-10 text-center"
        >
          <div className="w-20 h-20 rounded-[30px] glass flex items-center justify-center mx-auto border-white/10 shadow-2xl">
            <GlassWater size={40} className="text-primary drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tight text-white">가입 완료! 반가워요 🍻</h1>
            <p className="text-sm leading-relaxed text-white/50 max-w-sm mx-auto font-medium">
              술로그 서비스를 안전하고 쾌적하게 이용하시려면<br />
              이용약관 및 개인정보 처리방침 동의가 필요합니다.
            </p>
          </div>
        </motion.div>

        <div className="w-full space-y-8 relative z-10">
          <div className="space-y-4">
            {/* Terms Checkbox Card */}
            <div className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl text-left">
              <input 
                type="checkbox" 
                id="onboard-terms" 
                checked={onboardTermsAccepted} 
                onChange={(e) => setOnboardTermsAccepted(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded accent-primary border-white/20 bg-white/5 cursor-pointer"
              />
              <label htmlFor="onboard-terms" className="text-[12px] text-white/60 font-semibold cursor-pointer select-none leading-relaxed">
                (필수) 만 19세 이상 성인이며,{' '}
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveDoc('terms'); }} 
                  className="text-primary-light underline hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 inline font-bold"
                >
                  이용약관
                </button>
                {' '}및{' '}
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveDoc('privacy'); }} 
                  className="text-primary-light underline hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 inline font-bold"
                >
                  개인정보처리방침
                </button>
                에 동의합니다.
              </label>
            </div>

            <button
              onClick={async () => {
                setSavingOnboard(true);
                try {
                  await acceptTerms();
                } catch (e) {
                  console.error(e);
                } finally {
                  setSavingOnboard(false);
                }
              }}
              disabled={savingOnboard || !onboardTermsAccepted}
              className={cn("btn-primary w-full h-16 text-sm tracking-widest uppercase font-black rounded-2xl", (!onboardTermsAccepted || savingOnboard) && "opacity-35 grayscale cursor-not-allowed")}
            >
              {savingOnboard ? '저장 중...' : '동의하고 시작하기'}
            </button>
          </div>

          <p className="text-center text-[10px] text-white/20 font-bold tracking-widest uppercase flex items-center justify-center gap-2">
            <ShieldCheck size={12} />
            Secure Consent Audit Trail enabled
          </p>
        </div>

        {/* Detailed Modal Overlays */}
        <AnimatePresence>
          {activeDoc && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setActiveDoc(null)} 
                className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
              />
              <motion.div 
                initial={{ y: "100%" }} 
                animate={{ y: 0 }} 
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 250 }}
                className="w-full max-w-lg h-[80vh] sm:h-[70vh] bg-surface rounded-t-[40px] sm:rounded-[40px] overflow-hidden flex flex-col relative z-10 border-t border-white/10 shadow-2xl"
              >
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-primary-light font-black">LEGAL DOCUMENTS</span>
                  <button 
                    onClick={() => setActiveDoc(null)} 
                    className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 text-left text-xs text-white/60 leading-relaxed space-y-6 whitespace-pre-wrap font-medium">
                  {activeDoc === 'terms' ? TERMS_TEXT : PRIVACY_TEXT}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!ready) return <LoadingScreen />;

  const selectedLog = selectedLogId ? getLogById(selectedLogId) ?? null : null;

  const closeOverlay = () => {
    setOverlay(null);
    setSelectedLogId(null);
    setEditingLogId(null);
    setDeleteTargetId(null);
  };

  const handleSaveLog = async () => {
    if (!logForm.drinkName.trim() || !logForm.consumedAt.trim()) {
      emitToast({
        tone: 'warning',
        title: '필수 항목을 확인해주세요.',
        description: '제품명과 기록 시간을 먼저 입력해야 합니다.',
      });
      return;
    }

    setSavingLog(true);
    try {
      if (editingLogId) {
        await updateLog(editingLogId, logForm);
      } else {
        await addLog(logForm);
      }
      closeOverlay();
    } catch (error) {
      console.error('Failed to save log', error);
    } finally {
      setSavingLog(false);
    }
  };

  const handleQuickLog = (quickForm: LogFormValues) => {
    setEditingLogId(null);
    setLogForm(quickForm);
    setOverlay('add-log');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen onOpenAddLog={() => { setEditingLogId(null); setLogForm(createEmptyLogForm()); setOverlay('add-log'); }} onOpenLogDetail={(id) => { setSelectedLogId(id); setOverlay('log-detail'); }} onQuickLog={handleQuickLog} />;
      case 'logs': return <LogListScreen onOpenAddLog={() => { setEditingLogId(null); setLogForm(createEmptyLogForm()); setOverlay('add-log'); }} onOpenLogDetail={(id) => { setSelectedLogId(id); setOverlay('log-detail'); }} />;
      case 'analysis': return <AnalysisScreen onOpenProgress={() => setOverlay('progress')} />;
      case 'mypage': return <MyPage />;
      default: return <HomeScreen onOpenAddLog={() => setOverlay('add-log')} onOpenLogDetail={(id) => { setSelectedLogId(id); setOverlay('log-detail'); }} onQuickLog={handleQuickLog} />;
    }
  };

  return (
    <AppShell 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onOpenAddLog={() => { setEditingLogId(null); setLogForm(createEmptyLogForm()); setOverlay('add-log'); }}
      onOpenNotifications={() => setOverlay('notification')}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>

      {/* Modals & Overlays - Optimized Layers */}
      <AddLogModal
        open={overlay === 'add-log'}
        value={logForm}
        onChange={setLogForm}
        onClose={closeOverlay}
        onSave={handleSaveLog}
        onOpenDrinkSearch={() => setOverlay('drink-search')}
        editing={Boolean(editingLogId)}
        saving={savingLog}
      />

      <DrinkSearchScreen
        open={overlay === 'drink-search'}
        onClose={() => setOverlay('add-log')}
        onSelectDrink={(drink) => {
          setLogForm(curr => ({ ...curr, drinkCategory: drink.category, standardDrinkId: drink.id, drinkName: drink.name, abv: drink.abv.toString(), volumeMl: drink.volume_ml.toString() }));
          setOverlay('add-log');
        }}
        onManualEntry={() => setOverlay('add-log')}
      />

      <LogDetailScreen
        open={overlay === 'log-detail'}
        log={selectedLog}
        onClose={closeOverlay}
        onEdit={(log) => { setEditingLogId(log.id); setLogForm(logToForm(log)); setOverlay('add-log'); }}
        onDelete={setDeleteTargetId}
      />

      <AnimatePresence>
        {overlay === 'notification' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeOverlay} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-sm card space-y-8 relative z-10 p-10 border-white/10 shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-[22px] bg-primary/10 flex items-center justify-center text-primary-light border border-primary/20">
                  <Bell size={28} />
                </div>
                <div className="space-y-1">
                   <h2 className="text-2xl font-black tracking-tight">Notification</h2>
                   <p className="text-[13px] text-white/40 font-medium">새로운 알림이 없습니다.</p>
                </div>
              </div>
              <div className="py-6 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
                <p className="text-xs text-white/30 leading-relaxed">기록 잊음 방지와 목표 알림은<br />향후 푸시 기능과 함께 연동됩니다.</p>
              </div>
              <button onClick={closeOverlay} className="btn-secondary w-full py-4 rounded-2xl">닫기</button>
            </motion.div>
          </div>
        )}

        {overlay === 'progress' && (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeOverlay} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="w-full max-w-lg h-[92vh] sm:h-[85vh] bg-surface rounded-t-[48px] sm:rounded-[48px] overflow-hidden flex flex-col relative z-10 border-t border-white/10"
            >
              <div className="px-8 py-8 border-b border-white/5 bg-surface/40 backdrop-blur-3xl flex items-center justify-between">
                <div className="space-y-0.5">
                   <p className="text-[10px] uppercase tracking-[0.4em] text-primary-light font-black">Ritual Stats</p>
                   <h2 className="text-2xl font-black tracking-tight">목표 진행 현황</h2>
                </div>
                <button onClick={closeOverlay} className="w-12 h-12 rounded-[20px] glass flex items-center justify-center text-white/40 active:scale-90 transition-all border-white/10">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-8 pb-32"><ProgressScreen /></div>
            </motion.div>
          </div>
        )}

        {deleteTargetId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTargetId(null)} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-sm card space-y-10 relative z-10 p-10 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 rounded-[22px] bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">기록을 삭제할까요?</h3>
                  <p className="text-sm text-white/40 font-medium leading-relaxed px-4">삭제된 기록은 되돌릴 수 없으며 모든 통계에서 즉시 제외됩니다.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={async () => { await deleteLog(deleteTargetId); closeOverlay(); }} className="w-full h-16 rounded-2xl bg-red-500 text-white font-black active:scale-95 transition-all shadow-lg shadow-red-500/20">기록 삭제하기</button>
                <button onClick={() => setDeleteTargetId(null)} className="btn-secondary w-full h-16 rounded-2xl">취소</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppDataProvider>
          <AppWorkflow />
        </AppDataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
