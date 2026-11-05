import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../../utils/api";

export type UserRole = "student" | "admin" | "kitchen_manager";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
};

function loadStoredAuth(): Pick<AuthState, "token" | "user"> {
  try {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (!token || !userRaw) return { token: null, user: null };
    return { token, user: JSON.parse(userRaw) as AuthUser };
  } catch {
    return { token: null, user: null };
  }
}

const stored = loadStoredAuth();
const initialState: AuthState = {
  token: stored.token,
  user: stored.user,
  hydrated: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateDone(state) {
      state.hydrated = true;
    },
    loginSuccess(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.removeItem("favoriteDishIds");
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("favoriteDishIds");
    }
  }
});

export const { hydrateDone, loginSuccess, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: { auth: AuthState }) => Boolean(state.auth.token);
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === "admin";
export const selectIsKitchenManager = (state: { auth: AuthState }) =>
  state.auth.user?.role === "kitchen_manager";
export const selectCanManageMenu = (state: { auth: AuthState }) =>
  state.auth.user?.role === "admin" || state.auth.user?.role === "kitchen_manager";
export const selectCanUseFavorites = (state: { auth: AuthState }) =>
  state.auth.user?.role === "admin" || state.auth.user?.role === "kitchen_manager";
export const selectAuthRole = (state: { auth: AuthState }) => state.auth.user?.role ?? null;

export function roleLabel(role: UserRole | string | null | undefined) {
  if (role === "admin") return "Админ";
  if (role === "kitchen_manager") return "Заведующая кухни";
  return "Ученик";
}
