import { drinkMasterSeed } from '../data/drinkMasterSeed';
import type { DrinkCategory } from '../types/drink';
import type { DrinkingLog, LogFormValues } from '../types/log';
import { toDateTimeLocalValue } from './utils';

export function createEmptyLogForm(category: DrinkCategory = 'soju'): LogFormValues {
  return {
    drinkCategory: category,
    consumedAt: toDateTimeLocalValue(),
    drinkName: '',
    standardDrinkId: '',
    standardDrinkName: '',
    brand: '',
    abv: '',
    volumeMl: '',
    price: '',
    calories: '',
    foodPairing: '',
    memo: '',
    rating: '',
  };
}

export function logToForm(log: DrinkingLog): LogFormValues {
  return {
    drinkCategory: log.drinkCategory,
    consumedAt: toDateTimeLocalValue(log.consumedAt),
    drinkName: log.drinkName,
    standardDrinkId: log.standardDrinkId ?? '',
    standardDrinkName: log.standardDrinkName ?? '',
    brand: log.brand ?? '',
    abv: log.abv?.toString() ?? '',
    volumeMl: log.volumeMl?.toString() ?? '',
    price: log.price?.toString() ?? '',
    calories: log.calories?.toString() ?? '',
    foodPairing: log.foodPairing,
    memo: log.memo,
    rating: log.rating?.toString() ?? '',
  };
}

export function formToLogPayload(form: LogFormValues, userId: string, existing?: DrinkingLog): DrinkingLog {
  const selectedDrink = drinkMasterSeed.find((item) => item.id === form.standardDrinkId);

  return {
    id: existing?.id ?? crypto.randomUUID(),
    userId,
    drinkCategory: form.drinkCategory,
    consumedAt: new Date(form.consumedAt).toISOString(),
    drinkName: form.drinkName || selectedDrink?.name || '기록 없음',
    standardDrinkId: selectedDrink?.id ?? null,
    standardDrinkName: selectedDrink?.name ?? (form.standardDrinkName || null),
    brand: selectedDrink?.brand ?? (form.brand || null),
    abv: selectedDrink ? selectedDrink.abv : parseNumber(form.abv),
    volumeMl: selectedDrink ? selectedDrink.volume_ml : parseNumber(form.volumeMl),
    price: selectedDrink ? selectedDrink.price : parseNumber(form.price),
    calories: selectedDrink ? selectedDrink.calories : parseNumber(form.calories),
    foodPairing: form.foodPairing,
    memo: form.memo,
    rating: parseNumber(form.rating),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getDrinkCategoryLabel(category: DrinkCategory) {
  const labels: Record<DrinkCategory, string> = {
    soju: '소주',
    beer: '맥주',
    wine: '와인',
    whiskey: '위스키',
    makgeolli: '막걸리',
    highball: '하이볼',
    traditional_liquor: '전통주',
    other: '기타',
  };

  return labels[category];
}

function parseNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
