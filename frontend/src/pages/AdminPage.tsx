import React from "react";
import { apiGet } from "../utils/api";
import AdminCrudPanel from "../components/AdminCrudPanel";
import { Tabs, Button } from "../components/ui";

type Role = { id: number; name: string };
type User = { id: number; email: string; fullName: string };
type Category = { id: number; name: string };
type Dish = { id: number; name: string };
type Menu = { id: number; menuDate: string };

const TABS = [
  { id: "roles", label: "Роли" },
  { id: "users", label: "Пользователи" },
  { id: "students", label: "Ученики" },
  { id: "categories", label: "Категории" },
  { id: "dishes", label: "Блюда" },
  { id: "menus", label: "Меню" },
  { id: "menu-items", label: "Позиции меню" },
  { id: "favorites", label: "Избранное" }
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [tab, setTab] = React.useState<TabId>("roles");
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [dishes, setDishes] = React.useState<Dish[]>([]);
  const [menus, setMenus] = React.useState<Menu[]>([]);

  React.useEffect(() => {
    Promise.all([
      apiGet<Role[]>("/admin/roles"),
      apiGet<User[]>("/admin/users"),
      apiGet<Category[]>("/admin/categories"),
      apiGet<Dish[]>("/admin/dishes"),
      apiGet<Menu[]>("/admin/menus")
    ])
      .then(([r, u, c, d, m]) => {
        setRoles(r);
        setUsers(u);
        setCategories(c);
        setDishes(d);
        setMenus(m);
      })
      .catch(() => undefined);
  }, [tab]);

  return (
    <section className="admin-page">
      <h2>Админ-панель</h2>
      <p className="admin-page-desc">Управление всеми таблицами базы данных. Доступ только для администратора.</p>

      <Tabs>
        {TABS.map((t) => (
          <Button
            key={t.id}
            type="button"
            className={tab === t.id ? "tab-btn active" : "tab-btn"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </Tabs>

      {tab === "roles" && (
        <AdminCrudPanel
          title="Роли"
          endpoint="/admin/roles"
          columns={["id", "name"]}
          fields={[{ key: "name", label: "Название", required: true }]}
          getRowId={(r) => Number(r.id)}
          mapFormToBody={(f) => ({ name: f.name })}
        />
      )}

      {tab === "users" && (
        <AdminCrudPanel
          title="Пользователи"
          endpoint="/admin/users"
          columns={["id", "email", "fullName", "role"]}
          fields={[
            { key: "email", label: "Email", type: "email", required: true },
            { key: "password", label: "Пароль", type: "password" },
            { key: "fullName", label: "ФИО", required: true },
            {
              key: "roleId",
              label: "Роль",
              type: "select",
              required: true,
              options: roles.map((r) => ({ value: r.id, label: r.name }))
            }
          ]}
          getRowId={(r) => Number(r.id)}
          mapRowToForm={(r) => ({
            email: String(r.email),
            fullName: String(r.fullName),
            roleId: String((r.role as { id: number })?.id ?? ""),
            password: ""
          })}
          mapFormToBody={(f) => ({
            email: f.email,
            fullName: f.fullName,
            roleId: Number(f.roleId),
            ...(f.password ? { password: f.password } : {})
          })}
          renderCell={(row, col) =>
            col === "role" ? String((row.role as { name?: string })?.name ?? "") : String(row[col] ?? "")
          }
        />
      )}

      {tab === "students" && (
        <AdminCrudPanel
          title="Ученики"
          endpoint="/admin/students"
          columns={["id", "userId", "classNumber", "allergies"]}
          fields={[
            {
              key: "userId",
              label: "Пользователь",
              type: "select",
              required: true,
              options: users.map((u) => ({ value: u.id, label: `${u.fullName} (${u.email})` }))
            },
            { key: "classNumber", label: "Класс", required: true },
            { key: "allergies", label: "Аллергены" }
          ]}
          getRowId={(r) => Number(r.id)}
          mapFormToBody={(f) => ({
            userId: Number(f.userId),
            classNumber: f.classNumber,
            allergies: f.allergies || undefined
          })}
        />
      )}

      {tab === "categories" && (
        <AdminCrudPanel
          title="Категории"
          endpoint="/admin/categories"
          columns={["id", "name"]}
          fields={[{ key: "name", label: "Название", required: true }]}
          getRowId={(r) => Number(r.id)}
          mapFormToBody={(f) => ({ name: f.name })}
        />
      )}

      {tab === "dishes" && (
        <AdminCrudPanel
          title="Блюда"
          endpoint="/admin/dishes"
          columns={["id", "name", "price", "calories", "category"]}
          fields={[
            { key: "name", label: "Название", required: true },
            { key: "description", label: "Описание", required: true },
            { key: "price", label: "Цена", type: "number", required: true },
            { key: "calories", label: "Калории", type: "number", required: true },
            { key: "allergens", label: "Аллергены" },
            {
              key: "categoryId",
              label: "Категория",
              type: "select",
              required: true,
              options: categories.map((c) => ({ value: c.id, label: c.name }))
            }
          ]}
          getRowId={(r) => Number(r.id)}
          mapRowToForm={(r) => ({
            name: String(r.name),
            description: String(r.description),
            price: String(r.price),
            calories: String(r.calories),
            allergens: r.allergens ? String(r.allergens) : "",
            categoryId: String((r.category as { id: number })?.id ?? r.categoryId ?? "")
          })}
          mapFormToBody={(f) => ({
            name: f.name,
            description: f.description,
            price: Number(f.price),
            calories: Number(f.calories),
            allergens: f.allergens || undefined,
            categoryId: Number(f.categoryId)
          })}
          renderCell={(row, col) =>
            col === "category" ? String((row.category as { name?: string })?.name ?? "") : String(row[col] ?? "")
          }
        />
      )}

      {tab === "menus" && (
        <AdminCrudPanel
          title="Меню по датам"
          endpoint="/admin/menus"
          columns={["id", "menuDate"]}
          fields={[{ key: "menuDate", label: "Дата", type: "date", required: true }]}
          getRowId={(r) => Number(r.id)}
          mapRowToForm={(r) => ({
            menuDate: new Date(String(r.menuDate)).toISOString().slice(0, 10)
          })}
          mapFormToBody={(f) => ({ menuDate: f.menuDate })}
        />
      )}

      {tab === "menu-items" && (
        <AdminCrudPanel
          title="Позиции меню"
          endpoint="/admin/menu-items"
          columns={["id", "menuId", "dishId", "mealType", "isActive"]}
          fields={[
            {
              key: "menuId",
              label: "Меню",
              type: "select",
              required: true,
              options: menus.map((m) => ({
                value: m.id,
                label: `#${m.id} ${new Date(m.menuDate).toLocaleDateString("ru-RU")}`
              }))
            },
            {
              key: "dishId",
              label: "Блюдо",
              type: "select",
              required: true,
              options: dishes.map((d) => ({ value: d.id, label: d.name }))
            },
            {
              key: "mealType",
              label: "Приём пищи",
              type: "select",
              required: true,
              options: [
                { value: "BREAKFAST", label: "Завтрак" },
                { value: "LUNCH", label: "Обед" },
                { value: "SNACK", label: "Полдник" }
              ]
            },
            { key: "isActive", label: "Активно", type: "checkbox" }
          ]}
          getRowId={(r) => Number(r.id)}
          mapRowToForm={(r) => ({
            menuId: String(r.menuId),
            dishId: String(r.dishId),
            mealType: String(r.mealType ?? "LUNCH"),
            isActive: String(r.isActive)
          })}
          mapFormToBody={(f) => ({
            menuId: Number(f.menuId),
            dishId: Number(f.dishId),
            mealType: f.mealType,
            isActive: f.isActive === "true"
          })}
        />
      )}

      {tab === "favorites" && (
        <AdminCrudPanel
          title="Избранное"
          endpoint="/admin/favorites"
          columns={["id", "userId", "dishId", "createdAt"]}
          fields={[
            {
              key: "userId",
              label: "Пользователь",
              type: "select",
              required: true,
              options: users.map((u) => ({ value: u.id, label: u.fullName }))
            },
            {
              key: "dishId",
              label: "Блюдо",
              type: "select",
              required: true,
              options: dishes.map((d) => ({ value: d.id, label: d.name }))
            }
          ]}
          getRowId={(r) => Number(r.id)}
          mapRowToForm={(r) => ({ userId: String(r.userId), dishId: String(r.dishId) })}
          mapFormToBody={(f) => ({ userId: Number(f.userId), dishId: Number(f.dishId) })}
          renderCell={(row, col) =>
            col === "createdAt" ? new Date(String(row.createdAt)).toLocaleString("ru-RU") : String(row[col] ?? "")
          }
        />
      )}
    </section>
  );
}
