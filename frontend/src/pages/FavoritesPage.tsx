import React from "react";
import { useSelector } from "react-redux";
import { EmptyState, Loader } from "../components/ui";
import DishCard from "../components/DishCard";
import { useFavorites } from "../hooks/useFavorites";
import { RootState } from "../store/store";
import { apiGet } from "../utils/api";
import { Dish } from "../types/dish";

export default function FavoritesPage() {
  const token = useSelector((s: RootState) => s.auth.token);
  const { syncFromServer, toggleFavorite, isFavorite } = useFavorites();
  const [dishes, setDishes] = React.useState<Dish[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    syncFromServer();
    apiGet<{ dish: Dish }[]>("/favorites", token)
      .then((favorites) => setDishes(favorites.map((f) => f.dish)))
      .catch(() => setDishes([]))
      .finally(() => setLoading(false));
  }, [token, syncFromServer]);

  if (loading) return <Loader />;
  if (!dishes.length) return <EmptyState text="Избранных блюд пока нет. Добавьте их в каталоге." />;

  return (
    <section>
      <h2>Избранное</h2>
      <p className="admin-page-desc">Полные карточки ваших любимых блюд</p>
      <div className="dish-grid">
        {dishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            isFavorite={isFavorite(dish.id)}
            onToggleFavorite={() => {
              toggleFavorite(dish.id);
              setDishes((prev) => prev.filter((d) => d.id !== dish.id));
            }}
            showFavoriteButton
          />
        ))}
      </div>
    </section>
  );
}
