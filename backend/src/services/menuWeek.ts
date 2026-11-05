import { MealType, Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

export const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "SNACK"];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Завтрак",
  LUNCH: "Обед",
  SNACK: "Полдник"
};

const DAY_NAMES = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getWeekStart(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

export function getWeekDates(weekStart: Date) {
  return MEAL_TYPES.map((_, i) => undefined).map((_, i) => addDays(weekStart, i));
}

type DishWithCategory = Prisma.DishGetPayload<{ include: { category: true } }>;

export type WeekDayMeals = Record<MealType, DishWithCategory[]>;

export function groupMenuItemsByMeal(
  items: { mealType: MealType; isActive: boolean; dish: DishWithCategory }[]
): WeekDayMeals {
  const meals: WeekDayMeals = { BREAKFAST: [], LUNCH: [], SNACK: [] };
  for (const item of items) {
    if (item.isActive) {
      meals[item.mealType].push(item.dish);
    }
  }
  return meals;
}

export function isDayComplete(meals: WeekDayMeals) {
  return MEAL_TYPES.every((t) => meals[t].length > 0);
}

export async function fetchWeekMenus(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  const menus = await prisma.menu.findMany({
    where: {
      menuDate: { gte: weekStart, lte: weekEnd }
    },
    include: {
      items: {
        include: { dish: { include: { category: true } } }
      }
    },
    orderBy: { menuDate: "asc" }
  });

  const menuByDate = new Map(menus.map((m) => [formatDate(m.menuDate), m]));
  const currentWeekStart = getWeekStart(new Date());

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = formatDate(date);
    const menu = menuByDate.get(dateStr);
    const meals = menu ? groupMenuItemsByMeal(menu.items) : { BREAKFAST: [], LUNCH: [], SNACK: [] };

    return {
      date: dateStr,
      dayName: DAY_NAMES[date.getDay()],
      meals,
      isComplete: isDayComplete(meals)
    };
  });

  return {
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    isCurrentWeek: formatDate(weekStart) === formatDate(currentWeekStart),
    days
  };
}

export async function fetchMenuByDate(dateStr: string) {
  const date = startOfDay(new Date(dateStr));
  const menu = await prisma.menu.findUnique({
    where: { menuDate: date },
    include: {
      items: {
        include: { dish: { include: { category: true } } }
      }
    }
  });

  const meals = menu ? groupMenuItemsByMeal(menu.items) : { BREAKFAST: [], LUNCH: [], SNACK: [] };

  return {
    date: formatDate(date),
    dayName: DAY_NAMES[date.getDay()],
    meals,
    isComplete: isDayComplete(meals)
  };
}

export async function fetchMenuHistory(from?: string, to?: string) {
  const where: Prisma.MenuWhereInput = {};
  if (from || to) {
    where.menuDate = {};
    if (from) where.menuDate.gte = startOfDay(new Date(from));
    if (to) where.menuDate.lte = startOfDay(new Date(to));
  }

  const menus = await prisma.menu.findMany({
    where,
    include: {
      items: { where: { isActive: true }, select: { mealType: true } }
    },
    orderBy: { menuDate: "desc" }
  });

  const weekMap = new Map<string, { weekStart: string; weekEnd: string; daysWithMenu: number; completeDays: number }>();

  for (const menu of menus) {
    const weekStart = getWeekStart(menu.menuDate);
    const key = formatDate(weekStart);
    const entry = weekMap.get(key) ?? {
      weekStart: key,
      weekEnd: formatDate(addDays(weekStart, 6)),
      daysWithMenu: 0,
      completeDays: 0
    };

    entry.daysWithMenu += 1;
    const mealTypes = new Set(menu.items.map((i) => i.mealType));
    if (MEAL_TYPES.every((t) => mealTypes.has(t))) {
      entry.completeDays += 1;
    }
    weekMap.set(key, entry);
  }

  const currentWeekStart = formatDate(getWeekStart(new Date()));

  return [...weekMap.values()]
    .map((w) => ({ ...w, isCurrentWeek: w.weekStart === currentWeekStart }))
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

export type WeekPlanDay = {
  date: string;
  meals: Record<MealType, number[]>;
};

export function validateWeekPlan(days: WeekPlanDay[]) {
  if (days.length !== 7) {
    return "Неделя должна содержать ровно 7 дней";
  }
  return null;
}

export async function saveWeekPlan(weekStartDate: string, days: WeekPlanDay[]) {
  const error = validateWeekPlan(days);
  if (error) {
    throw new Error(error);
  }

  const weekStart = startOfDay(new Date(weekStartDate));

  for (const day of days) {
    const menuDate = startOfDay(new Date(day.date));
    const menu = await prisma.menu.upsert({
      where: { menuDate },
      create: { menuDate },
      update: {}
    });

    await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });

    const items: Prisma.MenuItemCreateManyInput[] = [];
    for (const mealType of MEAL_TYPES) {
      const dishIds = [...new Set(day.meals[mealType])];
      for (const dishId of dishIds) {
        items.push({ menuId: menu.id, dishId, mealType, isActive: true });
      }
    }

    if (items.length > 0) {
      await prisma.menuItem.createMany({ data: items });
    }
  }

  return fetchWeekMenus(weekStart);
}
