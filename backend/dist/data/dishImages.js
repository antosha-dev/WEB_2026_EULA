import fs from "fs/promises";
import path from "path";
/** Генерация локального пути к изображению блюда (сохраняет кириллицу) */
function getLocalImagePath(name) {
    const filename = name
        .toLowerCase()
        .replace(/[^a-zа-я0-9]+/g, "-")
        .replace(/^-|-$/g, "") + ".svg";
    return `/images/dishes/${filename}`;
}
/** Проверить существование локального изображения */
async function checkLocalImage(name) {
    try {
        const filepath = path.resolve("../frontend/public/images/dishes", name.toLowerCase().replace(/[^a-zа-я0-9]+/g, "-").replace(/^-|-$/g, "") + ".svg");
        await fs.access(filepath);
        return true;
    }
    catch {
        return false;
    }
}
/** Кураторские изображения блюд (Unsplash, бесплатное использование) */
const byCategory = {
    Супы: [
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1604909052750-8e603761e32b?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=280&fit=crop&q=80",
        "https://images.unsplash.com/photo-1476124369491-e7addf6eb371?w=400&h=280&fit=crop"
    ],
    Горячее: [
        "https://images.unsplash.com/photo-1606755962773-d324e2e9f769?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1563379091339-03246963d51c?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=280&fit=crop"
    ],
    Салаты: [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=280&fit=crop"
    ],
    Напитки: [
        "https://images.unsplash.com/photo-1544145945-f904253840c7?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1515823064-d6e0c67e2c40?w=400&h=280&fit=crop"
    ],
    Десерты: [
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1488477181941-6421a029177a?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=280&fit=crop"
    ],
    Гарниры: [
        "https://images.unsplash.com/photo-1512058564376-437021ec0464?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1585937923221-3e7083a1c970?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1604909052750-8e603761e32b?w=400&h=280&fit=crop"
    ],
    Завтраки: [
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1541416330091-6f5c0d1447a4?w=400&h=280&fit=crop",
        "https://images.unsplash.com/photo-1533081423043-2d350a8c9c93?w=400&h=280&fit=crop"
    ]
};
/** Точные совпадения по названию блюда */
const byDishName = {
    Борщ: "https://images.unsplash.com/photo-1604909052750-8e603761e32b?w=400&h=280&fit=crop",
    "Куриный суп": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=280&fit=crop",
    "Котлета с пюре": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=280&fit=crop",
    "Паста болоньезе": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=280&fit=crop",
    "Овощной салат": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=280&fit=crop",
    "Салат Цезарь": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=280&fit=crop",
    Компот: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=280&fit=crop",
    "Чай с лимоном": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=280&fit=crop",
    Какао: "https://images.unsplash.com/photo-1515823064-d6e0c67e2c40?w=400&h=280&fit=crop",
    "Творожная запеканка": "https://images.unsplash.com/photo-1488477181941-6421a029177a?w=400&h=280&fit=crop",
    "Картофельное пюре": "https://images.unsplash.com/photo-1585937923221-3e7083a1c970?w=400&h=280&fit=crop",
    Гречка: "https://images.unsplash.com/photo-1512058564376-437021ec0464?w=400&h=280&fit=crop",
    "Рыба запеченная": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=280&fit=crop",
    Плов: "https://images.unsplash.com/photo-1563379091339-03246963d51c?w=400&h=280&fit=crop"
};
function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}
/**
 * Возвращает первичный URL (Unsplash) и fallback (локальный SVG)
 */
export async function getDishImageUrl(name, category) {
    const hasLocal = await checkLocalImage(name);
    const fallback = hasLocal ? getLocalImagePath(name) : "";
    // Приоритет: точное совпадение по имени > категория > дефолт
    let primary;
    if (byDishName[name]) {
        primary = byDishName[name];
    }
    else {
        const pool = byCategory[category] ?? byCategory["Горячее"];
        const index = hashString(name) % pool.length;
        primary = pool[index];
    }
    return { primary, fallback };
}
// Синхронная версия для использования в seed (возвращает первичный Unsplash URL)
export function getDishImageUrlSync(name, category) {
    if (byDishName[name])
        return byDishName[name];
    const pool = byCategory[category] ?? byCategory["Горячее"];
    const index = hashString(name) % pool.length;
    return pool[index];
}
// Для получения только fallback URL
export function getDishFallbackUrl(name) {
    return getLocalImagePath(name);
}
