import React from "react";
import { Link } from "react-router-dom";
import { Button, Loader } from "../components/ui";
import { apiGet } from "../utils/api";
import { MEAL_TYPES, MEAL_TYPE_LABELS, WeekMenu } from "../types/menu";
import { addDays, formatDate, formatWeekRange, getWeekStart } from "../utils/menuWeek";
import { formatPrice } from "../types/dish";

export default function MenuHistoryPage() {
  const [weekStart, setWeekStart] = React.useState(() => formatDate(getWeekStart(new Date())));
  const [weekMenu, setWeekMenu] = React.useState<WeekMenu | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadWeek = React.useCallback((start: string) => {
    setLoading(true);
    apiGet<WeekMenu>(`/menus/week?startDate=${start}`)
      .then(setWeekMenu)
      .catch(() => setWeekMenu(null))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadWeek(weekStart);
  }, [weekStart, loadWeek]);

  const shiftWeek = (delta: number) => {
    const next = formatDate(addDays(new Date(weekStart), delta * 7));
    setWeekStart(next);
  };

  if (loading) return <Loader />;

  return (
    <section className="menu-history-page">
      <h2>История меню</h2>
      <p className="admin-page-desc">Архив недельных меню столовой, включая текущую неделю.</p>

      <div className="menu-week-nav">
        <Button type="button" onClick={() => shiftWeek(-1)}>
          ← Предыдущая неделя
        </Button>
        <div className="menu-week-nav__label">
          {weekMenu ? (
            <>
              {formatWeekRange(weekMenu.weekStart, weekMenu.weekEnd)}
              {weekMenu.isCurrentWeek ? <span className="badge badge--current">Текущая неделя</span> : null}
            </>
          ) : (
            weekStart
          )}
        </div>
        <Button type="button" onClick={() => shiftWeek(1)}>
          Следующая неделя →
        </Button>
      </div>

      {!weekMenu ? (
        <p>Не удалось загрузить меню.</p>
      ) : (
        <div className="menu-history-days">
          {weekMenu.days.map((day) => (
            <article key={day.date} className={`menu-history-day ${day.isComplete ? "" : "menu-history-day--incomplete"}`}>
              <header className="menu-history-day__header">
                <h3>
                  {day.dayName}, {new Date(day.date).toLocaleDateString("ru-RU")}
                </h3>
                {!day.isComplete ? <span className="badge badge--warn">Неполное меню</span> : null}
              </header>

              {MEAL_TYPES.map((mealType) => (
                <div key={mealType} className="menu-history-meal">
                  <h4>{MEAL_TYPE_LABELS[mealType]}</h4>
                  {day.meals[mealType].length === 0 ? (
                    <p className="stats-muted">—</p>
                  ) : (
                    <ul className="menu-history-dish-list">
                      {day.meals[mealType].map((dish) => (
                        <li key={`${day.date}-${mealType}-${dish.id}`}>
                          <Link to={`/dishes/${dish.id}`}>{dish.name}</Link>
                          <span className="stats-muted">
                            {dish.category?.name} · {formatPrice(dish.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
