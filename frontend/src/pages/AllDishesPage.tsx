import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader, Select } from "../components/ui";
import DishCard from "../components/DishCard";
import { useFavorites } from "../hooks/useFavorites";
import { RootState } from "../store/store";
import { apiGet } from "../utils/api";
import { Dish } from "../types/dish";
import { setFilter, setSort } from "../store/slices/menuSlice";

export default function AllDishesPage() {
  const dispatch = useDispatch();
  const { filter, sort } = useSelector((s: RootState) => s.menu);
  const { syncFromServer, toggleFavorite, isFavorite, canUseFavorites } = useFavorites();
  const [dishes, setDishes] = React.useState<Dish[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    syncFromServer();
    apiGet<Dish[]>("/dishes")
      .then(setDishes)
      .catch(() => setDishes([]))
      .finally(() => setLoading(false));
  }, [syncFromServer]);

  const visible = useMemo(() => {
    const filtered = dishes.filter((d) => d.name.toLowerCase().includes(filter.toLowerCase()));
    if (sort === "price") return [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "calories") return [...filtered].sort((a, b) => a.calories - b.calories);
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [dishes, filter, sort]);

  if (loading) return <Loader />;

  return (
    <section>
      <h2>Каталог блюд</h2>
      <p className="admin-page-desc">Полный каталог блюд школьной столовой.</p>
      <div className="menu-toolbar">
        <input
          className="input"
          value={filter}
          placeholder="Поиск по названию"
          onChange={(e) => dispatch(setFilter(e.target.value))}
        />
        <Select value={sort} onChange={(e) => dispatch(setSort(e.target.value))}>
          <option value="name">По названию</option>
          <option value="price">По цене</option>
          <option value="calories">По калориям</option>
        </Select>
      </div>
      <div className="dish-grid">
        {visible.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            isFavorite={isFavorite(dish.id)}
            onToggleFavorite={() => toggleFavorite(dish.id)}
            showFavoriteButton={canUseFavorites}
          />
        ))}
      </div>
    </section>
  );
}
