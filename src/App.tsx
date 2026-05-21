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
import { X, Bell, Trash2, AlertCircle } from 'lucide-react';

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
  const { user, loading: authLoading } = useAuth();
  const { addLog, updateLog, deleteLog, getLogById, ready } = useAppData();
  const [activeTab, setActiveTab] = useState<BottomTab>('home');
  const [overlay, setOverlay] = useState<OverlayView>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [logForm, setLogForm] = useState<LogFormValues>(createEmptyLogForm());
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [savingLog, setSavingLog] = useState(false);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;
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
