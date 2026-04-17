import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppDataProvider, useAppData } from './state/AppDataContext';
import AppShell from './components/AppShell';
import LoginScreen from './screens/auth/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import LogListScreen from './screens/logs/LogListScreen';
import AnalysisScreen from './screens/analysis/AnalysisScreen';
import GoalSettingScreen from './screens/goals/GoalSettingScreen';
import ProgressScreen from './screens/goals/ProgressScreen';
import AddLogModal from './screens/logs/AddLogModal';
import DrinkSearchScreen from './screens/logs/DrinkSearchScreen';
import LogDetailScreen from './screens/logs/LogDetailScreen';
import { createEmptyLogForm, logToForm } from './lib/recordForms';
import type { DrinkingLog, LogFormValues } from './types/log';
import type { BottomTab, OverlayView } from './types/navigation';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b10]">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function AppWorkflow() {
  const { user } = useAuth();
  const { addLog, updateLog, deleteLog, getLogById } = useAppData();
  const [activeTab, setActiveTab] = useState<BottomTab>('home');
  const [overlay, setOverlay] = useState<OverlayView>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [logForm, setLogForm] = useState<LogFormValues>(createEmptyLogForm());
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  if (!user) {
    return <LoginScreen />;
  }

  const selectedLog = selectedLogId ? getLogById(selectedLogId) ?? null : null;
  const isAddLogOpen = overlay === 'add-log';
  const isDrinkSearchOpen = overlay === 'drink-search';
  const isLogDetailOpen = overlay === 'log-detail';
  const isProgressOpen = overlay === 'progress';

  const openNewLog = () => {
    setEditingLogId(null);
    setLogForm(createEmptyLogForm());
    setOverlay('add-log');
  };

  const openEditLog = (log: DrinkingLog) => {
    setEditingLogId(log.id);
    setLogForm(logToForm(log));
    setOverlay('add-log');
  };

  const openLogDetail = (logId: string) => {
    setSelectedLogId(logId);
    setOverlay('log-detail');
  };

  const closeOverlay = () => {
    setOverlay(null);
    setSelectedLogId(null);
    setEditingLogId(null);
    setDeleteTargetId(null);
  };

  const handleSaveLog = async () => {
    try {
      if (editingLogId) {
        await updateLog(editingLogId, logForm);
      } else {
        await addLog(logForm);
      }
      closeOverlay();
    } catch (error) {
      console.error('Failed to save log', error);
    }
  };

  const handleSelectDrink = (drink: { id: string; name: string; brand: string; category: LogFormValues['drinkCategory']; abv: number; volume_ml: number; calories: number; price: number; }) => {
    setLogForm((current) => ({
      ...current,
      drinkCategory: drink.category,
      standardDrinkId: drink.id,
      standardDrinkName: drink.name,
      drinkName: drink.name,
      brand: drink.brand,
      abv: drink.abv.toString(),
      volumeMl: drink.volume_ml.toString(),
      price: drink.price.toString(),
      calories: drink.calories.toString(),
    }));
    setOverlay('add-log');
  };

  const handleManualEntry = () => {
    setLogForm((current) => ({
      ...current,
      standardDrinkId: '',
      standardDrinkName: '',
      brand: '',
      abv: '',
      volumeMl: '',
      price: '',
      calories: '',
    }));
    setOverlay('add-log');
  };

  const handleDeleteLog = async (logId: string) => {
    setDeleteTargetId(logId);
  };

  const confirmDeleteLog = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteLog(deleteTargetId);
      closeOverlay();
    } catch (error) {
      console.error('Failed to delete log', error);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onOpenAddLog={openNewLog} onOpenLogDetail={openLogDetail} />;
      case 'logs':
        return <LogListScreen onOpenAddLog={openNewLog} onOpenLogDetail={openLogDetail} />;
      case 'analysis':
        return <AnalysisScreen />;
      case 'goals':
        return <GoalSettingScreen onOpenProgress={() => setOverlay('progress')} />;
      default:
        return <HomeScreen onOpenAddLog={openNewLog} onOpenLogDetail={openLogDetail} />;
    }
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab} onOpenAddLog={openNewLog}>
      {renderTab()}

      <AddLogModal
        open={isAddLogOpen}
        value={logForm}
        onChange={setLogForm}
        onClose={closeOverlay}
        onSave={handleSaveLog}
        onOpenDrinkSearch={() => setOverlay('drink-search')}
        editing={Boolean(editingLogId)}
      />

      <DrinkSearchScreen
        open={isDrinkSearchOpen}
        onClose={() => setOverlay('add-log')}
        onSelectDrink={handleSelectDrink}
        onManualEntry={handleManualEntry}
      />

      <LogDetailScreen
        open={isLogDetailOpen}
        log={selectedLog}
        onClose={closeOverlay}
        onEdit={openEditLog}
        onDelete={handleDeleteLog}
      />

      {isProgressOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm">
          <div className="mx-auto max-w-md h-full bg-[#0a0b10] overflow-y-auto">
            <div className="px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0a0b10]/90 backdrop-blur-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Progress</p>
                <h2 className="text-lg font-black">목표 진행률</h2>
              </div>
              <button onClick={closeOverlay} className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                ×
              </button>
            </div>
            <div className="px-5 py-4 pb-8">
              <ProgressScreen />
            </div>
          </div>
        </div>
      ) : null}

      {deleteTargetId ? (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md card space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Delete Log</p>
              <h3 className="text-lg font-black">이 기록을 삭제할까요?</h3>
              <p className="text-sm text-white/45 leading-relaxed">삭제하면 복구할 수 없습니다.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setDeleteTargetId(null)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold">
                취소
              </button>
              <button type="button" onClick={confirmDeleteLog} className="rounded-2xl bg-red-400/15 border border-red-400/30 px-4 py-3 font-bold text-red-100">
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AppWorkflow />
      </AppDataProvider>
    </AuthProvider>
  );
}
