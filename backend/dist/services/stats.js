import { prisma } from "../prisma.js";
import { fetchWeekMenus, getWeekStart, startOfDay } from "./menuWeek.js";
function formatDate(d) {
    return d.toISOString().slice(0, 10);
}
export async function getDashboardStats() {
    const [dishes, categories, users, students, favorites, menus, menuItems] = await Promise.all([
        prisma.dish.findMany({ include: { category: true } }),
        prisma.category.findMany(),
        prisma.user.findMany({ include: { role: true } }),
        prisma.student.count(),
        prisma.favorite.count(),
        prisma.menu.findMany({ orderBy: { menuDate: "desc" } }),
        prisma.menuItem.findMany({
            where: { isActive: true },
            include: { dish: { include: { category: true } } }
        })
    ]);
    const currentWeek = await fetchWeekMenus(getWeekStart(new Date()));
    const completeDaysThisWeek = currentWeek.days.filter((d) => d.isComplete).length;
    const dishAppearances = new Map();
    for (const item of menuItems) {
        const existing = dishAppearances.get(item.dishId) ?? {
            dishId: item.dishId,
            dishName: item.dish.name,
            category: item.dish.category.name,
            price: Number(item.dish.price),
            calories: item.dish.calories,
            count: 0
        };
        existing.count += 1;
        dishAppearances.set(item.dishId, existing);
    }
    const popularDishes = [...dishAppearances.values()].sort((a, b) => b.count - a.count).slice(0, 15);
    const categoryStats = categories
        .map((cat) => {
        const catDishes = dishes.filter((d) => d.categoryId === cat.id);
        const catItems = menuItems.filter((i) => i.dish.categoryId === cat.id);
        return {
            categoryId: cat.id,
            categoryName: cat.name,
            dishCount: catDishes.length,
            menuAppearances: catItems.length
        };
    })
        .sort((a, b) => b.menuAppearances - a.menuAppearances);
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const day = startOfDay(new Date());
        day.setDate(day.getDate() - i);
        const dayStr = formatDate(day);
        const dayMenu = menus.find((m) => formatDate(m.menuDate) === dayStr);
        const dayItems = dayMenu
            ? menuItems.filter((mi) => mi.menuId === dayMenu.id)
            : [];
        const mealTypes = new Set(dayItems.map((i) => i.mealType));
        const isComplete = ["BREAKFAST", "LUNCH", "SNACK"].every((t) => mealTypes.has(t));
        last7Days.push({
            date: dayStr,
            hasMenu: Boolean(dayMenu),
            isComplete,
            dishCount: dayItems.length
        });
    }
    const menuWeeks = new Set(menus.map((m) => formatDate(getWeekStart(m.menuDate))));
    return {
        generatedAt: new Date().toISOString(),
        overview: {
            totalDishes: dishes.length,
            totalCategories: categories.length,
            totalUsers: users.length,
            totalStudents: students,
            totalFavorites: favorites,
            totalMenus: menus.length,
            menuWeeks: menuWeeks.size,
            completeDaysThisWeek,
            currentWeekDays: currentWeek.days.length
        },
        last7Days,
        popularDishes,
        categoryStats,
        currentWeek,
        menuDates: menus.map((m) => formatDate(m.menuDate))
    };
}
