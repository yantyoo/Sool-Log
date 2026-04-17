export type GoalType = 'frequency' | 'spending' | 'calorie' | 'sober_days';

export interface HabitGoal {
  id: string;
  userId: string;
  title: string;
  goalType: GoalType;
  period: 'weekly' | 'monthly';
  targetValue: number;
  unit: '회' | '원' | 'kcal' | '일';
  warningThresholdPercent: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalFormValues {
  title: string;
  goalType: GoalType;
  period: 'weekly' | 'monthly';
  targetValue: string;
  unit: '회' | '원' | 'kcal' | '일';
  warningThresholdPercent: string;
}
