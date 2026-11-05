import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ReportsState = { ordersSummary: unknown | null; popularDishes: unknown[] };
const initialState: ReportsState = { ordersSummary: null, popularDishes: [] };

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setOrdersSummary(state, action: PayloadAction<unknown>) {
      state.ordersSummary = action.payload;
    },
    setPopularDishes(state, action: PayloadAction<unknown[]>) {
      state.popularDishes = action.payload;
    }
  }
});

export const { setOrdersSummary, setPopularDishes } = reportsSlice.actions;
export default reportsSlice.reducer;
