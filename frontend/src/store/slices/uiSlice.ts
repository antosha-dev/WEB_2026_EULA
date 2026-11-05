import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SnackbarType = "success" | "error" | "info";

type UiState = { 
  snackbar: { message: string; type: SnackbarType } | null 
};

const initialState: UiState = { snackbar: null };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showSnackbar(state, action: PayloadAction<{ message: string; type?: SnackbarType }>) {
      state.snackbar = { message: action.payload.message, type: action.payload.type ?? "info" };
    },
    hideSnackbar(state) {
      state.snackbar = null;
    }
  }
});

export const { showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
