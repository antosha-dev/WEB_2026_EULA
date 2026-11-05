import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import favoritesReducer from "./slices/favoritesSlice";
import menuReducer from "./slices/menuSlice";
import reportsReducer from "./slices/reportsSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    favorites: favoritesReducer,
    reports: reportsReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
