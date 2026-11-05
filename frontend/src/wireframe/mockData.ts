import type { AuthUser } from "../utils/api";
import type { Dish } from "../types/dish";
import { formatDate, getWeekStart, addDays } from "../utils/menuWeek";
export const WIREFRAME_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280">
      <rect width="400" height="280" fill="#e5e5e5" stroke="#999" stroke-width="2"/>
      <line x1="0" y1="0" x2="400" y2="280" stroke="#bbb" stroke-width="1"/>
      <line x1="400" y1="0" x2="0" y2="280" stroke="#bbb" stroke-width="1"/>
      <text x="200" y="145" text-anchor="middle" fill="#888" font-family="Arial" font-size="18">IMG</text>
    </svg>`
  );

const categories = [
  { id: 1, name: "Завтраки" },
  { id: 2, name: "Горячее" },
  { id: 3, name: "Десерты" }
];

export const mockDishes: Dish[] = [1, 2, 3, 4, 5, 6].map((id) => ({
  id,
  name: `Блюдо ${String(id).padStart(2, "0")}`,
  description: "Краткое описание блюда для макета интерфейса. Текст-заглушка.",
  price: 100 + id * 25,
  calories: 200 + id * 30,
  allergens: id % 2 === 0 ? "заглушка" : null,
  imageUrl: null,
  categoryId: ((id - 1) % 3) + 1,
  category: categories[(id - 1) % 3]
}));

const weekStart = getWeekStart(new Date());
const weekDays = Array.from({ length: 7 }, (_, i) => {
  const date = addDays(weekStart, i);
  const dateStr = formatDate(date);
  const dayNames = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  return {
    date: dateStr,
    dayName: dayNames[date.getDay()],
    isComplete: true,
    meals: {
      BREAKFAST: [mockDishes[0]],
      LUNCH: [mockDishes[1], mockDishes[2]],
      SNACK: [mockDishes[3]]
    }
  };
});

export const mockWeekMenu = {
  weekStart: formatDate(weekStart),
  weekEnd: formatDate(addDays(weekStart, 6)),
  isCurrentWeek: true,
  days: weekDays
};

export const mockDayMenu = weekDays.find((d) => d.date === formatDate(new Date())) ?? weekDays[0];

export const mockMenus = [
  {
    id: 1,
    menuDate: new Date().toISOString(),
    items: mockDishes.slice(0, 4).map((dish) => ({ dish, mealType: "LUNCH", isActive: true }))
  }
];

export const mockStats = {
  overview: {
    totalDishes: 12,
    totalCategories: 3,
    totalUsers: 8,
    totalStudents: 7,
    totalFavorites: 4,
    totalMenus: 28,
    menuWeeks: 4,
    completeDaysThisWeek: 7,
    currentWeekDays: 7
  },
  last7Days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((_, i) => ({
    date: formatDate(addDays(new Date(), i - 6)),
    hasMenu: true,
    isComplete: i !== 2,
    dishCount: 6 + (i % 3)
  })),
  popularDishes: mockDishes.slice(0, 5).map((d, i) => ({
    dishId: d.id,
    dishName: d.name,
    category: d.category!.name,
    count: 10 - i,
    price: d.price,
    calories: d.calories
  })),
  categoryStats: categories.map((c, i) => ({
    categoryName: c.name,
    dishCount: 4,
    menuAppearances: 12 - i
  })),
  currentWeek: mockWeekMenu,
  menuDates: weekDays.map((d) => d.date)
};

export function mockUser(role: "student" | "admin" | "kitchen_manager"): AuthUser {
  if (role === "admin") {
    return { id: 1, email: "admin@example.local", fullName: "Администратор", role };
  }
  if (role === "kitchen_manager") {
    return { id: 3, email: "chef@example.local", fullName: "Заведующая кухни", role };
  }
  return { id: 2, email: "student@example.local", fullName: "Ученик А.", role };
}

export const mockAdminLists: Record<string, Record<string, unknown>[]> = {
  roles: [
    { id: 1, name: "admin" },
    { id: 2, name: "student" },
    { id: 3, name: "kitchen_manager" }
  ],
  users: [
    { id: 1, email: "admin@example.local", fullName: "Администратор" },
    { id: 2, email: "user@example.local", fullName: "Ученик А." },
    { id: 3, email: "chef@example.local", fullName: "Заведующая кухни" }
  ],
  students: [{ id: 1, userId: 2, classNumber: "9А", allergies: "—" }],
  categories: categories.map((c) => ({ ...c })),
  dishes: mockDishes.map((d) => ({
    id: d.id,
    name: d.name,
    price: d.price,
    categoryId: d.categoryId
  })),
  menus: [{ id: 1, menuDate: new Date().toISOString() }],
  "menu-items": [{ id: 1, menuId: 1, dishId: 1, mealType: "LUNCH", isActive: true }],
  favorites: [{ id: 1, userId: 1, dishId: 1 }]
};
