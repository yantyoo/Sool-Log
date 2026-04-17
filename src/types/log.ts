import type { DrinkCategory } from './drink';

export interface DrinkingLog {
  id: string;
  userId: string;
  drinkCategory: DrinkCategory;
  consumedAt: string;
  drinkName: string;
  standardDrinkId: string | null;
  standardDrinkName: string | null;
  brand: string | null;
  abv: number | null;
  volumeMl: number | null;
  price: number | null;
  calories: number | null;
  foodPairing: string;
  memo: string;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LogFormValues {
  drinkCategory: DrinkCategory;
  consumedAt: string;
  drinkName: string;
  standardDrinkId: string;
  standardDrinkName: string;
  brand: string;
  abv: string;
  volumeMl: string;
  price: string;
  calories: string;
  foodPairing: string;
  memo: string;
  rating: string;
}

export interface LogFilterState {
  category: DrinkCategory | 'all';
  period: 'all' | 'week' | 'month';
  search: string;
}

