import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setFavoriteIds, toggleFavoriteId } from "../store/slices/favoritesSlice";
import { logout, selectCanUseFavorites } from "../store/slices/authSlice";
import { showSnackbar } from "../store/slices/uiSlice";
import { apiDelete, apiGet, apiPost } from "../utils/api";

export function useFavorites() {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const canUseFavorites = useSelector(selectCanUseFavorites);
  const favoriteIds = useSelector((s: RootState) => s.favorites.dishIds);

  const syncFromServer = useCallback(async () => {
    if (!token || !canUseFavorites) return;
    try {
      const data = await apiGet<{ dishId: number }[]>("/favorites", token);
      dispatch(setFavoriteIds(data.map((f) => f.dishId)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("401") || message.includes("устарела") || message.includes("Unauthorized")) {
        dispatch(logout());
        dispatch(showSnackbar({ message: "Сессия устарела. Войдите снова.", type: "error" }));
      }
    }
  }, [canUseFavorites, dispatch, token]);

  const toggleFavorite = useCallback(
    async (dishId: number) => {
      if (!canUseFavorites) {
        dispatch(showSnackbar({ message: "Избранное доступно только администратору и заведующей кухни", type: "error" }));
        return;
      }
      if (!token) {
        dispatch(showSnackbar({ message: "Войдите, чтобы добавить в избранное", type: "error" }));
        return;
      }

      const isFav = favoriteIds.includes(dishId);
      dispatch(toggleFavoriteId(dishId));

      try {
        if (isFav) {
          await apiDelete(`/favorites/${dishId}`, token);
        } else {
          await apiPost(`/favorites/${dishId}`, {}, token);
        }
      } catch (err) {
        dispatch(toggleFavoriteId(dishId));
        const message = err instanceof Error ? err.message : "Не удалось обновить избранное";
        if (message.includes("401") || message.includes("устарела") || message.includes("Unauthorized")) {
          dispatch(logout());
        }
        dispatch(showSnackbar({ message, type: "error" }));
      }
    },
    [canUseFavorites, dispatch, favoriteIds, token]
  );

  return {
    favoriteIds,
    canUseFavorites,
    syncFromServer,
    toggleFavorite,
    isFavorite: (id: number) => favoriteIds.includes(id)
  };
}
