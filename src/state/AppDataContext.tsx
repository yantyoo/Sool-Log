import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { emitToast } from '../lib/toast';
import { drinkMasterSeed } from '../data/drinkMasterSeed';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { formToLogPayload } from '../lib/recordForms';
import type { GoalFormValues, HabitGoal } from '../types/goal';
import type { DrinkingLog, LogFormValues } from '../types/log';

interface AppDataContextValue {
  drinkMaster: typeof drinkMasterSeed;
  logs: DrinkingLog[];
  goals: HabitGoal[];
  ready: boolean;
  addLog: (form: LogFormValues) => Promise<void>;
  updateLog: (logId: string, form: LogFormValues) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  saveGoal: (form: GoalFormValues, goalId?: string) => Promise<void>;
  toggleGoalEnabled: (goalId: string) => Promise<void>;
  getLogById: (logId: string) => DrinkingLog | undefined;
  getGoalById: (goalId: string) => HabitGoal | undefined;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

function createEmptyState() {
  return {
    logs: [] as DrinkingLog[],
    goals: [] as HabitGoal[],
  };
}

function toLogRecord(record: Record<string, unknown>): DrinkingLog {
  return {
    id: String(record.id),
    userId: String(record.userId ?? record.userUid ?? ''),
    drinkCategory: record.drinkCategory as DrinkingLog['drinkCategory'],
    consumedAt: String(record.consumedAt),
    drinkName: String(record.drinkName ?? ''),
    standardDrinkId: typeof record.standardDrinkId === 'string' ? record.standardDrinkId : null,
    standardDrinkName: typeof record.standardDrinkName === 'string' ? record.standardDrinkName : null,
    brand: typeof record.brand === 'string' ? record.brand : null,
    abv: typeof record.abv === 'number' ? record.abv : null,
    volumeMl: typeof record.volumeMl === 'number' ? record.volumeMl : null,
    price: typeof record.price === 'number' ? record.price : null,
    calories: typeof record.calories === 'number' ? record.calories : null,
    foodPairing: String(record.foodPairing ?? ''),
    memo: String(record.memo ?? ''),
    rating: typeof record.rating === 'number' ? record.rating : null,
    createdAt: String(record.createdAt ?? ''),
    updatedAt: String(record.updatedAt ?? ''),
  };
}

function toGoalRecord(record: Record<string, unknown>): HabitGoal {
  return {
    id: String(record.id),
    userId: String(record.userId ?? ''),
    title: String(record.title ?? ''),
    goalType: record.goalType as HabitGoal['goalType'],
    period: record.period as HabitGoal['period'],
    targetValue: typeof record.targetValue === 'number' ? record.targetValue : Number(record.targetValue ?? 0),
    unit: record.unit as HabitGoal['unit'],
    warningThresholdPercent:
      typeof record.warningThresholdPercent === 'number'
        ? record.warningThresholdPercent
        : Number(record.warningThresholdPercent ?? 0),
    enabled: Boolean(record.enabled),
    createdAt: String(record.createdAt ?? ''),
    updatedAt: String(record.updatedAt ?? ''),
  };
}

function makeUserCollectionPath(userId: string, collectionName: 'logs' | 'goals') {
  return collection(db, 'users', userId, collectionName);
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState(createEmptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setState(createEmptyState());
      setReady(true);
      return;
    }

    setReady(false);
    const logsRef = makeUserCollectionPath(user.uid, 'logs');
    const goalsRef = makeUserCollectionPath(user.uid, 'goals');
    const logsQuery = query(logsRef, orderBy('consumedAt', 'desc'));

    let readyCount = 0;
    let cancelled = false;
    const readyTimeout = window.setTimeout(() => {
      if (!cancelled) {
        setReady(true);
      }
    }, 4000);

    const markReady = () => {
      readyCount += 1;
      if (!cancelled && readyCount >= 2) {
        window.clearTimeout(readyTimeout);
        setReady(true);
      }
    };

    const unsubscribeLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        if (cancelled) return;
        console.info('[firebase] logs snapshot received', { count: snapshot.size, userId: user.uid });
        setState((current) => ({
          ...current,
          logs: snapshot.docs.map((document) => toLogRecord(document.data() as Record<string, unknown>)),
        }));
        markReady();
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/logs`);
        } catch (handledError) {
          console.error(handledError);
        } finally {
          window.clearTimeout(readyTimeout);
          if (!cancelled) setReady(true);
        }
      },
    );

    const unsubscribeGoals = onSnapshot(
      goalsRef,
      (snapshot) => {
        if (cancelled) return;
        console.info('[firebase] goals snapshot received', { count: snapshot.size, userId: user.uid });
        setState((current) => ({
          ...current,
          goals: snapshot.docs.map((document) => toGoalRecord(document.data() as Record<string, unknown>)),
        }));
        markReady();
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/goals`);
        } catch (handledError) {
          console.error(handledError);
        } finally {
          window.clearTimeout(readyTimeout);
          if (!cancelled) setReady(true);
        }
      },
    );

    return () => {
      cancelled = true;
      window.clearTimeout(readyTimeout);
      unsubscribeLogs();
      unsubscribeGoals();
    };
  }, [user?.uid]);

  const addLog = async (form: LogFormValues) => {
    if (!user) return;
    try {
      const nextLog = formToLogPayload(form, user.uid);
      await setDoc(doc(db, 'users', user.uid, 'logs', nextLog.id), nextLog);
      emitToast({
        tone: 'success',
        title: '기록을 저장했습니다.',
        description: '홈, 기록, 분석 화면이 바로 갱신됩니다.',
      });
    } catch (error) {
      emitToast({
        tone: 'error',
        title: '저장에 실패했습니다.',
        description: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
        action: {
          label: '다시 시도',
          onClick: () => void addLog(form),
        },
      });
      throw error;
    }
  };

  const updateLog = async (logId: string, form: LogFormValues) => {
    if (!user) return;
    try {
      const existing = state.logs.find((log) => log.id === logId);
      if (!existing) return;
      const updated = formToLogPayload(form, user.uid, existing);
      await setDoc(doc(db, 'users', user.uid, 'logs', logId), updated);
      emitToast({
        tone: 'success',
        title: '기록을 수정했습니다.',
        description: '변경 내용이 바로 반영됩니다.',
      });
    } catch (error) {
      emitToast({
        tone: 'error',
        title: '수정에 실패했습니다.',
        description: '다시 시도해 주세요.',
      });
      throw error;
    }
  };

  const deleteLog = async (logId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'logs', logId));
      emitToast({
        tone: 'warning',
        title: '기록을 삭제했습니다.',
        description: '삭제한 기록은 복구할 수 없습니다.',
      });
    } catch (error) {
      emitToast({
        tone: 'error',
        title: '삭제에 실패했습니다.',
        description: '권한 또는 네트워크 상태를 확인해주세요.',
      });
      throw error;
    }
  };

  const saveGoal = async (form: GoalFormValues, goalId?: string) => {
    if (!user) return;
    try {
      const now = new Date().toISOString();
      const existing = goalId ? state.goals.find((goal) => goal.id === goalId) : undefined;
      const nextGoal: HabitGoal = {
        id: goalId ?? crypto.randomUUID(),
        userId: user.uid,
        title: form.title,
        goalType: form.goalType,
        period: form.period,
        targetValue: Number(form.targetValue),
        unit: form.unit,
        warningThresholdPercent: Number(form.warningThresholdPercent),
        enabled: existing?.enabled ?? true,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', user.uid, 'goals', nextGoal.id), nextGoal);
      emitToast({
        tone: 'success',
        title: '목표를 저장했습니다.',
        description: '분석 화면에서 진행률을 확인할 수 있습니다.',
      });
    } catch (error) {
      emitToast({
        tone: 'error',
        title: '목표 저장에 실패했습니다.',
        description: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
      });
      throw error;
    }
  };

  const toggleGoalEnabled = async (goalId: string) => {
    if (!user) return;
    try {
      const existing = state.goals.find((goal) => goal.id === goalId);
      if (!existing) return;

      await setDoc(doc(db, 'users', user.uid, 'goals', goalId), {
        ...existing,
        enabled: !existing.enabled,
        updatedAt: new Date().toISOString(),
      });
      emitToast({
        tone: 'info',
        title: existing.enabled ? '목표를 비활성화했습니다.' : '목표를 다시 활성화했습니다.',
        description: existing.title,
      });
    } catch (error) {
      emitToast({
        tone: 'error',
        title: '목표 변경에 실패했습니다.',
        description: '다시 시도해 주세요.',
      });
      throw error;
    }
  };

  const getLogById = useMemo(() => {
    return (logId: string) => state.logs.find((log) => log.id === logId);
  }, [state.logs]);

  const getGoalById = useMemo(() => {
    return (goalId: string) => state.goals.find((goal) => goal.id === goalId);
  }, [state.goals]);

  return (
    <AppDataContext.Provider
      value={{
        drinkMaster: drinkMasterSeed,
        logs: state.logs,
        goals: state.goals,
        ready,
        addLog,
        updateLog,
        deleteLog,
        saveGoal,
        toggleGoalEnabled,
        getLogById,
        getGoalById,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
