import { WIREFRAME_MODE } from "../config/mode";
import { WIREFRAME_IMAGE } from "../wireframe/mockData";

/** Запасные изображения по категории, если в БД нет imageUrl */
const fallbackByCategory: Record<string, string> = {
  Супы: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=280&fit=crop",
  Горячее: "https://images.unsplash.com/photo-1606755962773-d324e2e9f769?w=400&h=280&fit=crop",
  Салаты: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=280&fit=crop",
  Напитки: "https://images.unsplash.com/photo-1544145945-f904253840c7?w=400&h=280&fit=crop",
  Десерты: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=280&fit=crop",
  Гарниры: "https://images.unsplash.com/photo-1512058564376-437021ec0464?w=400&h=280&fit=crop",
  Завтраки: "https://images.unsplash.com/photo-1533089860892-a7c10f39098e?w=400&h=280&fit=crop"
};

export type DishCategory = { id: number; name: string };

export type Dish = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  calories: number;
  allergens: string | null;
  imageUrl: string | null;
  categoryId: number;
  category?: DishCategory;
};

export function getDishImageUrl(
  dish: {
    id: number;
    name: string;
    imageUrl?: string | null;
    category?: DishCategory;
  },
  options?: { ignoreStored?: boolean }
) {
  if (WIREFRAME_MODE) return WIREFRAME_IMAGE;
  const stored = dish.imageUrl?.trim();
  if (!options?.ignoreStored && stored) return stored;
  if (dish.category?.name && fallbackByCategory[dish.category.name]) {
    return fallbackByCategory[dish.category.name];
  }
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=280&fit=crop`;
}

export function formatPrice(price: string | number) {
  return `${Number(price).toFixed(0)} ₽`;
}