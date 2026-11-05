import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Dish = { id: number; name: string; price: number; calories: number; category: string };
type MenuState = { items: Dish[]; filter: string; sort: string };

const savedFilter = localStorage.getItem("menuFilter") || "";
const savedSort = localStorage.getItem("menuSort") || "name";

const initialState: MenuState = { items: [], filter: savedFilter, sort: savedSort };

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenu(state, action: PayloadAction<Dish[]>) {
      state.items = action.payload;
    },
    setFilter(state, action: PayloadAction<string>) {
      state.filter = action.payload;
      localStorage.setItem("menuFilter", state.filter);
    },
    setSort(state, action: PayloadAction<string>) {
      state.sort = action.payload;
      localStorage.setItem("menuSort", state.sort);
    },
    resetMenuPrefs(state) {
      state.filter = "";
      state.sort = "name";
      localStorage.removeItem("menuFilter");
      localStorage.removeItem("menuSort");
    }
  }
});

export const { setMenu, setFilter, setSort, resetMenuPrefs } = menuSlice.actions;
export default menuSlice.reducer;
