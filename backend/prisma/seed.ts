import bcrypt from "bcryptjs";
import { MealType, PrismaClient } from "@prisma/client";
import { getDishImageUrlSync } from "../src/data/dishImages.js";
import { addDays, getWeekStart, startOfDay } from "../src/services/menuWeek.js";

const prisma = new PrismaClient();

const STUDENT_PASSWORD = "Student123";
const ADMIN_PASSWORD = "Admin123!";
const CHEF_PASSWORD = "Chef123!";

const studentsData = [
  { email: "student@school.local", fullName: "Иван Петров", classNumber: "7A", allergies: "Орехи" },
  { email: "maria@school.local", fullName: "Мария Сидорова", classNumber: "8B", allergies: null },
  { email: "alex@school.local", fullName: "Алексей Козлов", classNumber: "9A", allergies: "Лактоза" },
  { email: "elena@school.local", fullName: "Елена Волкова", classNumber: "6V", allergies: null },
  { email: "dmitry@school.local", fullName: "Дмитрий Орлов", classNumber: "10G", allergies: "Глютен" },
  { email: "sofia@school.local", fullName: "София Морозова", classNumber: "7B", allergies: null }
];

const categoriesData = ["Супы", "Горячее", "Салаты", "Напитки", "Десерты", "Гарниры", "Завтраки"];

const dishesTemplates = [
  { name: "Борщ", description: "Традиционный борщ со сметаной", basePrice: 120, calories: 180, category: "Супы" },
  { name: "Куриный суп", description: "Легкий суп с курицей", basePrice: 110, calories: 160, category: "Супы" },
  { name: "Суп-лапша", description: "Домашняя лапша с зеленью", basePrice: 95, calories: 140, category: "Супы" },
  { name: "Гороховый суп", description: "Суп с копченостями", basePrice: 105, calories: 200, category: "Супы" },
  { name: "Щи из свежей капусты", description: "Сметана отдельно", basePrice: 115, calories: 170, category: "Супы" },
  { name: "Солянка", description: "С лимоном и маслинами", basePrice: 130, calories: 210, category: "Супы" },
  { name: "Уха", description: "Рыбный суп", basePrice: 125, calories: 150, category: "Супы" },
  { name: "Суп харчо", description: "Острый суп", basePrice: 128, calories: 190, category: "Супы" },
  { name: "Рассольник", description: "С перловкой и солёными огурцами", basePrice: 118, calories: 175, category: "Супы" },
  { name: "Котлета с пюре", description: "Куриная котлета и пюре", basePrice: 170, calories: 360, category: "Горячее" },
  { name: "Паста болоньезе", description: "Паста с мясным соусом", basePrice: 180, calories: 420, category: "Горячее" },
  { name: "Рис с овощами", description: "Рис с тушеными овощами", basePrice: 140, calories: 250, category: "Горячее" },
  { name: "Рыба запеченная", description: "Филе с лимоном", basePrice: 195, calories: 280, category: "Горячее" },
  { name: "Гуляш с гречкой", description: "Говяжий гуляш", basePrice: 165, calories: 390, category: "Горячее" },
  { name: "Курица гриль", description: "Куриное филе с соусом", basePrice: 175, calories: 310, category: "Горячее" },
  { name: "Тефтели", description: "В томатном соусе", basePrice: 155, calories: 340, category: "Горячее" },
  { name: "Плов", description: "С курицей", basePrice: 160, calories: 380, category: "Горячее" },
  { name: "Биточки", description: "С подливой", basePrice: 145, calories: 320, category: "Горячее" },
  { name: "Котлета рыбная", description: "С рисом", basePrice: 150, calories: 300, category: "Горячее" },
  { name: "Котлета свиная", description: "С гарниром", basePrice: 185, calories: 400, category: "Горячее" },
  { name: "Лапша с курицей", description: "Суп-второе", basePrice: 135, calories: 290, category: "Горячее" },
  { name: "Голубцы", description: "С мясом и рисом", basePrice: 158, calories: 350, category: "Горячее" },
  { name: "Бефстроганов", description: "С гречкой", basePrice: 190, calories: 410, category: "Горячее" },
  { name: "Жаркое", description: "Домашнее с овощами", basePrice: 168, calories: 370, category: "Горячее" },
  { name: "Котлета по-киевски", description: "С картофельным пюре", basePrice: 200, calories: 450, category: "Горячее" },
  { name: "Овощной салат", description: "Свежие овощи", basePrice: 90, calories: 95, category: "Салаты" },
  { name: "Салат Цезарь", description: "Курица, салат, сыр", basePrice: 150, calories: 220, category: "Салаты" },
  { name: "Винегрет", description: "Классический винегрет", basePrice: 85, calories: 120, category: "Салаты" },
  { name: "Салат с тунцом", description: "Тунец и яйцо", basePrice: 160, calories: 210, category: "Салаты" },
  { name: "Греческий салат", description: "С фетой", basePrice: 140, calories: 180, category: "Салаты" },
  { name: "Капустный салат", description: "С маслом", basePrice: 75, calories: 90, category: "Салаты" },
  { name: "Салат оливье", description: "Классический", basePrice: 130, calories: 250, category: "Салаты" },
  { name: "Салат витаминный", description: "Капуста и морковь", basePrice: 70, calories: 85, category: "Салаты" },
  { name: "Салат с кукурузой", description: "Лёгкий овощной", basePrice: 88, calories: 100, category: "Салаты" },
  { name: "Компот", description: "Ягодный компот", basePrice: 60, calories: 70, category: "Напитки" },
  { name: "Чай с лимоном", description: "Черный чай", basePrice: 50, calories: 25, category: "Напитки" },
  { name: "Какао", description: "Какао на молоке", basePrice: 80, calories: 140, category: "Напитки" },
  { name: "Сок яблочный", description: "Натуральный сок", basePrice: 70, calories: 90, category: "Напитки" },
  { name: "Морс клюквенный", description: "Домашний морс", basePrice: 65, calories: 80, category: "Напитки" },
  { name: "Кефир", description: "200 мл", basePrice: 45, calories: 60, category: "Напитки" },
  { name: "Ряженка", description: "200 мл", basePrice: 50, calories: 80, category: "Напитки" },
  { name: "Кисель", description: "Ягодный кисель", basePrice: 55, calories: 75, category: "Напитки" },
  { name: "Творожная запеканка", description: "С изюмом", basePrice: 95, calories: 260, category: "Десерты" },
  { name: "Печенье овсяное", description: "2 штуки", basePrice: 45, calories: 180, category: "Десерты" },
  { name: "Фруктовый салат", description: "Сезонные фрукты", basePrice: 110, calories: 100, category: "Десерты" },
  { name: "Булочка", description: "Сдобная", basePrice: 35, calories: 200, category: "Десерты" },
  { name: "Кекс", description: "Ванильный", basePrice: 55, calories: 220, category: "Десерты" },
  { name: "Йогурт", description: "Натуральный", basePrice: 60, calories: 90, category: "Десерты" },
  { name: "Печенье сдобное", description: "2 штуки", basePrice: 40, calories: 170, category: "Десерты" },
  { name: "Булочка с повидлом", description: "Сдобная с начинкой", basePrice: 42, calories: 210, category: "Десерты" },
  { name: "Картофельное пюре", description: "Порция гарнира", basePrice: 55, calories: 150, category: "Гарниры" },
  { name: "Гречка", description: "Порция гарнира", basePrice: 50, calories: 130, category: "Гарниры" },
  { name: "Макароны", description: "Отварные макароны", basePrice: 48, calories: 160, category: "Гарниры" },
  { name: "Рис отварной", description: "Гарнир", basePrice: 52, calories: 140, category: "Гарниры" },
  { name: "Овощи тушеные", description: "Гарнир", basePrice: 58, calories: 110, category: "Гарниры" },
  { name: "Пюре морковное", description: "Гарнир", basePrice: 50, calories: 100, category: "Гарниры" },
  { name: "Каша овсяная", description: "На молоке", basePrice: 75, calories: 190, category: "Завтраки" },
  { name: "Каша манная", description: "С маслом", basePrice: 70, calories: 185, category: "Завтраки" },
  { name: "Каша гречневая", description: "На молоке", basePrice: 72, calories: 175, category: "Завтраки" },
  { name: "Каша рисовая", description: "С изюмом", basePrice: 74, calories: 180, category: "Завтраки" },
  { name: "Омлет", description: "С сыром", basePrice: 120, calories: 240, category: "Завтраки" },
  { name: "Сырники", description: "Со сметаной", basePrice: 100, calories: 280, category: "Завтраки" },
  { name: "Блины", description: "С вареньем", basePrice: 95, calories: 260, category: "Завтраки" },
  { name: "Яичница", description: "С хлебом", basePrice: 85, calories: 220, category: "Завтраки" },
  { name: "Творог со сметаной", description: "Порция 150 г", basePrice: 90, calories: 200, category: "Завтраки" },
  { name: "Бутерброд с маслом", description: "С хлебом", basePrice: 38, calories: 190, category: "Завтраки" },
  { name: "Бутерброд с сыром", description: "С хлебом", basePrice: 45, calories: 210, category: "Завтраки" },
  { name: "Каша пшенная", description: "С тыквой", basePrice: 76, calories: 195, category: "Завтраки" },
  { name: "Омлет с овощами", description: "Лёгкий завтрак", basePrice: 115, calories: 230, category: "Завтраки" },
  { name: "Молочная рисовая каша", description: "С корицей", basePrice: 73, calories: 188, category: "Завтраки" }
];

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "SNACK"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dishesForMeal(dishes: { id: number; category: { name: string } }[], mealType: MealType) {
  const breakfastCats = ["Завтраки", "Десерты", "Напитки"];
  const lunchCats = ["Супы", "Горячее", "Салаты", "Гарниры"];
  const snackCats = ["Десерты", "Напитки", "Завтраки"];

  const cats = mealType === "BREAKFAST" ? breakfastCats : mealType === "LUNCH" ? lunchCats : snackCats;
  const pool = dishes.filter((d) => cats.includes(d.category.name));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, randomInt(2, 4));
}

async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "Favorite",
      "MenuItem",
      "Menu",
      "Dish",
      "Category",
      "Student",
      "User",
      "Role"
    RESTART IDENTITY CASCADE;
  `);
}

async function main() {
  await resetDatabase();

  const adminRole = await prisma.role.create({ data: { name: "admin" } });
  const studentRole = await prisma.role.create({ data: { name: "student" } });
  const kitchenRole = await prisma.role.create({ data: { name: "kitchen_manager" } });

  const admin = await prisma.user.create({
    data: {
      email: "admin@school.local",
      fullName: "Администратор столовой",
      roleId: adminRole.id,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10)
    }
  });

  const chef = await prisma.user.create({
    data: {
      email: "chef@school.local",
      fullName: "Заведующая кухни",
      roleId: kitchenRole.id,
      passwordHash: await bcrypt.hash(CHEF_PASSWORD, 10)
    }
  });

  const studentPasswordHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
  const students = [];

  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        fullName: s.fullName,
        roleId: studentRole.id,
        passwordHash: studentPasswordHash
      }
    });
    await prisma.student.create({
      data: { userId: user.id, classNumber: s.classNumber, allergies: s.allergies }
    });
    students.push(user);
  }

  const categories = await prisma.category.createManyAndReturn({
    data: categoriesData.map((name) => ({ name }))
  });
  const categoryByName = new Map(categories.map((c) => [c.name, c.id]));

  for (const dish of dishesTemplates) {
    await prisma.dish.create({
      data: {
        name: dish.name,
        description: dish.description,
        price: dish.basePrice.toFixed(2),
        calories: dish.calories + randomInt(-10, 10),
        allergens: dish.name.includes("Цезарь")
          ? "Молоко"
          : dish.category === "Десерты" || dish.category === "Завтраки"
            ? "Молоко, яйца"
            : null,
        categoryId: categoryByName.get(dish.category)!,
        imageUrl: getDishImageUrlSync(dish.name, dish.category)
      }
    });
  }

  const dishes = await prisma.dish.findMany({ include: { category: true }, orderBy: { id: "asc" } });

  const currentWeekStart = getWeekStart(new Date());
  const weekOffsets = [-2, -1, 0, 1];

  for (const weekOffset of weekOffsets) {
    const weekStart = addDays(currentWeekStart, weekOffset * 7);
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const menuDate = startOfDay(addDays(weekStart, dayIndex));
      const menu = await prisma.menu.create({ data: { menuDate } });

      const items: { menuId: number; dishId: number; mealType: MealType; isActive: boolean }[] = [];
      for (const mealType of MEAL_TYPES) {
        for (const dish of dishesForMeal(dishes, mealType)) {
          items.push({ menuId: menu.id, dishId: dish.id, mealType, isActive: true });
        }
      }
      await prisma.menuItem.createMany({ data: items });
    }
  }

  const favoritesData = [];
  const favDishes = dishes.slice(0, 12);
  for (let i = 0; i < favDishes.length; i++) {
    favoritesData.push({
      userId: i % 2 === 0 ? admin.id : chef.id,
      dishId: favDishes[i].id
    });
  }
  await prisma.favorite.createMany({ data: favoritesData });

  const counts = {
    users: await prisma.user.count(),
    students: await prisma.student.count(),
    dishes: dishes.length,
    menus: await prisma.menu.count(),
    menuItems: await prisma.menuItem.count(),
    favorites: favoritesData.length
  };

  console.log("Seed completed successfully.");
  console.log("--- Credentials ---");
  console.log(`Admin: admin@school.local / ${ADMIN_PASSWORD}`);
  console.log(`Kitchen manager: chef@school.local / ${CHEF_PASSWORD}`);
  console.log(`Students: *@school.local / ${STUDENT_PASSWORD}`);
  console.log("--- Counts ---");
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
