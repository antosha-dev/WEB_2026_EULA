import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader } from "../components/ui";
import DishCard from "../components/DishCard";
import { useFavorites } from "../hooks/useFavorites";
import { selectCanManageMenu } from "../store/slices/authSlice";
import { apiGet } from "../utils/api";
import { DayMenu, MEAL_TYPES, MEAL_TYPE_LABELS } from "../types/menu";
import { formatDate, startOfDay } from "../utils/menuWeek";

export default function MenuPage() {
  const canManageMenu = useSelector(selectCanManageMenu);
  const { syncFromServer, toggleFavorite, isFavorite, canUseFavorites } = useFavorites();
  const [dayMenu, setDayMenu] = React.useState<DayMenu | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    syncFromServer();
    const today = formatDate(startOfDay(new Date()));
    apiGet<DayMenu>(`/menus?date=${today}`)
      .then(setDayMenu)
      .catch(() => setDayMenu(null))
      .finally(() => setLoading(false));
  }, [syncFromServer]);

  if (loading) return <Loader />;

  const displayDate = dayMenu
    ? new Date(dayMenu.date).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })
    : "сегодня";

  return (
    <section>
      <h2>Меню на {displayDate}</h2>
      <p className="admin-page-desc">
        Актуальное меню дня по приёмам пищи.
        {canManageMenu ? (
          <>
            {" "}
            <Link to="/menu-history">Смотреть всю неделю и архив →</Link>
          </>
        ) : null}
      </p>

      {!dayMenu ? <p className="form-error">Меню на сегодня пока не сформировано.</p> : null}

      {MEAL_TYPES.map((mealType) => {
        const dishes = dayMenu?.meals[mealType] ?? [];
        return (
          <div key={mealType} className="menu-meal-section">
            <h3>{MEAL_TYPE_LABELS[mealType]}</h3>
            {dishes.length === 0 ? (
              <p>Блюда не выбраны</p>
            ) : (
              <div className="dish-grid">
                {dishes.map((dish) => (
                  <DishCard
                    key={`${mealType}-${dish.id}`}
                    dish={dish}
                    isFavorite={isFavorite(dish.id)}
                    onToggleFavorite={() => toggleFavorite(dish.id)}
                    showFavoriteButton={canUseFavorites}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
