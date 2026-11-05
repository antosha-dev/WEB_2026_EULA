import type { AuthUser, LoginResponse } from "../utils/api";
import {
  mockAdminLists,
  mockDayMenu,
  mockDishes,
  mockMenus,
  mockStats,
  mockUser,
  mockWeekMenu
} from "./mockData";
function delay<T>(data: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function matchAdminList(path: string): Record<string, unknown>[] | null {
  const m = path.match(/^\/admin\/([\w-]+)$/);
  if (!m) return null;
  return mockAdminLists[m[1]] ?? [];
}

function resolveRole(email: string): AuthUser["role"] {
  if (email.includes("admin")) return "admin";
  if (email.includes("chef") || email.includes("kitchen")) return "kitchen_manager";
  return "student";
}

export async function mockApiGet<T>(path: string, token?: string | null): Promise<T> {
  if (path === "/stats" || path === "/reports/dashboard") {
    return delay(mockStats as T);
  }
  if (path === "/reports/menu-summary" || path === "/reports/popular-dishes") {
    return delay(mockStats as T);
  }
  if (path === "/dishes") {
    return delay(mockDishes as T);
  }
  const dishMatch = path.match(/^\/dishes\/(\d+)$/);
  if (dishMatch) {
    const dish = mockDishes.find((d) => d.id === Number(dishMatch[1])) ?? mockDishes[0];
    return delay(dish as T);
  }
  if (path.startsWith("/menus/week") || path.startsWith("/menus/history")) {
    const raw = localStorage.getItem("wireframe_user");
    const user = raw ? (JSON.parse(raw) as AuthUser) : mockUser("student");
    if (user.role !== "admin" && user.role !== "kitchen_manager") {
      throw new Error("Forbidden");
    }
  }
  if (path.startsWith("/menus/week")) {
    return delay(mockWeekMenu as T);
  }
  if (path.startsWith("/menus/history")) {
    return delay([
      {
        weekStart: mockWeekMenu.weekStart,
        weekEnd: mockWeekMenu.weekEnd,
        daysWithMenu: 7,
        completeDays: 7,
        isCurrentWeek: true
      }
    ] as T);
  }
  if (path.startsWith("/menus?date=")) {
    return delay(mockDayMenu as T);
  }
  if (path === "/menus") {
    return delay(mockMenus as T);
  }
  if (path === "/favorites") {
    const raw = localStorage.getItem("wireframe_user");
    const user = raw ? (JSON.parse(raw) as AuthUser) : mockUser("student");
    if (user.role === "student") {
      throw new Error("Forbidden");
    }
    return delay([{ dishId: 1 }, { dishId: 2 }] as T);
  }
  if (path === "/users/me" || path === "/auth/me") {
    return mockFetchMe("") as Promise<T>;
  }
  const admin = matchAdminList(path);
  if (admin) {
    return delay(admin as T);
  }
  return delay([] as T);
}

export async function mockApiPost<T>(path: string, body: unknown, _token?: string | null): Promise<T> {
  if (path === "/auth/login" || path === "/auth/register") {
    const email = (body as { email?: string }).email ?? "";
    const role = path === "/auth/register" ? "student" : resolveRole(email);
    const res: LoginResponse = { token: "wireframe-token", user: mockUser(role) };
    return delay(res as T);
  }
  if (path.startsWith("/favorites/")) {
    return delay(undefined as T);
  }
  if (path.startsWith("/admin/")) {
    return delay({ id: 100, ...(body as object) } as T);
  }
  if (path === "/reports/send-email") {
    return delay({ message: "Report sent (wireframe)" } as T);
  }
  return delay({ ok: true } as T);
}

export async function mockApiPatch<T>(path: string, _body: unknown, _token?: string | null): Promise<T> {
  if (path === "/users/me") {
    return delay({
      ...mockUser("student"),
      student: { classNumber: "9Б", allergies: "—" }
    } as T);
  }
  if (path.startsWith("/admin/")) {
    return delay({ id: 1 } as T);
  }
  return delay({} as T);
}

export async function mockApiPut<T>(path: string, body: unknown, _token?: string | null): Promise<T> {
  if (path === "/menus/week") {
    return delay(mockWeekMenu as T);
  }
  if (path.startsWith("/admin/")) {
    return delay({ id: 1, ...(body as object) } as T);
  }
  return delay({} as T);
}

export async function mockApiDelete(_path: string, _token?: string | null): Promise<void> {
  await delay(undefined);
}

export async function mockApiDownloadFile(_path: string, filename: string): Promise<void> {
  const blob = new Blob([`Wireframe export: ${filename}`], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function persistWireframeUser(user: AuthUser) {
  localStorage.setItem("wireframe_user", JSON.stringify(user));
}

export async function mockLogin(email: string, _password: string): Promise<LoginResponse> {
  const user = mockUser(resolveRole(email));
  persistWireframeUser(user);
  return delay({ token: "wireframe-token", user });
}

export async function mockRegister(
  email: string,
  _password: string,
  fullName: string,
  _classNumber?: string
): Promise<LoginResponse> {
  const user = { id: 2, email, fullName: fullName || "Новый ученик", role: "student" as const };
  persistWireframeUser(user);
  return delay({ token: "wireframe-token", user });
}

export async function mockFetchMe(_token: string): Promise<AuthUser & { student?: { classNumber: string } | null }> {
  const raw = localStorage.getItem("wireframe_user");
  const base = raw ? (JSON.parse(raw) as AuthUser) : mockUser("student");
  return delay({
    ...base,
    student: base.role === "student" ? { classNumber: "9А", allergies: "заглушка" } : null
  });
}
