import { Dish } from "./dish";

export type MealType = "BREAKFAST" | "LUNCH" | "SNACK";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Завтрак",
  LUNCH: "Обед",
  SNACK: "Полдник"
};

export const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "SNACK"];

export type DayMeals = Record<MealType, Dish[]>;

export type WeekDay = {
  date: string;
  dayName: string;
  meals: DayMeals;
  isComplete: boolean;
};

export type WeekMenu = {
  weekStart: string;
  weekEnd: string;
  isCurrentWeek: boolean;
  days: WeekDay[];
};

export type MenuHistoryWeek = {
  weekStart: string;
  weekEnd: string;
  daysWithMenu: number;
  completeDays: number;
  isCurrentWeek: boolean;
};

export type DayMenu = {
  date: string;
  dayName: string;
  meals: DayMeals;
  isComplete: boolean;
};
