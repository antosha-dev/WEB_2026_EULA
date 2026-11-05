import React from "react";
import { useDispatch } from "react-redux";
import { fetchMe, apiGet } from "../utils/api";
import { hydrateDone, loginSuccess, logout } from "../store/slices/authSlice";
import { setFavoriteIds } from "../store/slices/favoritesSlice";
import type { UserRole } from "../store/slices/authSlice";

export function AuthInit({ children }: React.PropsWithChildren) {
  const dispatch = useDispatch();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(hydrateDone());
      setReady(true);
      return;
    }

    fetchMe(token)
      .then(async (user) => {
        dispatch(
          loginSuccess({
            token,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              role: user.role as UserRole
            }
          })
        );
        const canFav = user.role === "admin" || user.role === "kitchen_manager";
        if (canFav) {
          try {
            const favorites = await apiGet<{ dishId: number }[]>("/favorites", token);
            dispatch(setFavoriteIds(favorites.map((f) => f.dishId)));
          } catch {
            /* ignore */
          }
        }
        setReady(true);
      })
      .catch(() => {
        dispatch(logout());
        dispatch(hydrateDone());
        setReady(true);
      });
  }, [dispatch]);

  if (!ready) return <div className="loader-page">Загрузка...</div>;
  return <>{children}</>;
}
