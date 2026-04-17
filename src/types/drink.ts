export type DrinkCategory =
  | 'soju'
  | 'beer'
  | 'wine'
  | 'whiskey'
  | 'makgeolli'
  | 'highball'
  | 'traditional_liquor'
  | 'other';

export interface DrinkMasterItem {
  id: string;
  name: string;
  brand: string;
  category: DrinkCategory;
  abv: number;
  volume_ml: number;
  calories: number;
  price: number;
  aliases: string[];
}

