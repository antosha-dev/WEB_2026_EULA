import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type FavoritesState = { dishIds: number[] };

const saved = localStorage.getItem("favoriteDishIds");
const initialState: FavoritesState = { dishIds: saved ? JSON.parse(saved) : [] };

function persist(ids: number[]) {
  localStorage.setItem("favoriteDishIds", JSON.stringify(ids));
}

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    setFavoriteIds(state, action: PayloadAction<number[]>) {
      state.dishIds = action.payload;
      persist(state.dishIds);
    },
    toggleFavoriteId(state, action: PayloadAction<number>) {
      if (state.dishIds.includes(action.payload)) {
        state.dishIds = state.dishIds.filter((id) => id !== action.payload);
      } else {
        state.dishIds.push(action.payload);
      }
      persist(state.dishIds);
    },
    clearFavorites(state) {
      state.dishIds = [];
      localStorage.removeItem("favoriteDishIds");
    }
  }
});

export const { setFavoriteIds, toggleFavoriteId, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
