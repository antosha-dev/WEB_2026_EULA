import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiGet } from "../utils/api";
import { Card, ChartBlock, Loader } from "../components/ui";
import { selectCanManageMenu, selectIsAdmin, selectIsAuthenticated } from "../store/slices/authSlice";
import { MEAL_TYPES, MEAL_TYPE_LABELS, WeekMenu } from "../types/menu";

type DashboardStats = {
  overview: {
    totalDishes: number;
    totalCategories: number;
    totalUsers: number;
    totalStudents: number;
    totalFavorites: number;
    totalMenus: number;
    menuWeeks: number;
    completeDaysThisWeek: number;
  };
  last7Days: { date: string; hasMenu: boolean; isComplete: boolean; dishCount: number }[];
  popularDishes: { dishName: string; category: string; count: number }[];
  categoryStats: { categoryName: string; dishCount: number; menuAppearances: number }[];
  currentWeek: WeekMenu;
};

export default function HomePage() {
  const isAuth = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const canManageMenu = useSelector(selectCanManageMenu);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    apiGet<DashboardStats>("/stats")
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error || !stats) {
    return (
      <Card>
        <h2>Главная</h2>
        <p className="form-error">{error || "Не удалось загрузить статистику"}</p>
      </Card>
    );
  }

  const { overview, last7Days, popularDishes, categoryStats, currentWeek } = stats;
  const maxDayDishes = Math.max(...last7Days.map((d) => d.dishCount), 1);

  return (
    <section className="home-page">
      <div className="home-hero">
        <h2>Школьная столовая</h2>
        <p>Актуальное и архивное меню питания для учеников и сотрудников столовой.</p>
        <div className="home-hero-actions">
          <Link to="/menu" className="button">
            Меню дня
          </Link>
          {canManageMenu ? (
            <Link to="/menu-history" className="button">
              История меню
            </Link>
          ) : null}
          {!isAuth ? (
            <Link to="/login" className="button">
              Войти
            </Link>
          ) : null}
          {canManageMenu ? (
            <Link to="/menu-planning" className="button">
              Планирование
            </Link>
          ) : null}
          {isAdmin ? (
            <Link to="/reports" className="button">
              Отчёты
            </Link>
          ) : null}
        </div>
      </div>

      <h3 className="section-title">Статистика столовой</h3>
      <div className="stats-grid">
        <ChartBlock title="Блюд в каталоге" value={overview.totalDishes} />
        <ChartBlock title="Категорий" value={overview.totalCategories} />
        <ChartBlock title="Дней с меню" value={overview.totalMenus} />
        <ChartBlock title="Недель с меню" value={overview.menuWeeks} />
        <ChartBlock title="Полных дней на неделе" value={`${overview.completeDaysThisWeek}/7`} />
        <ChartBlock title="Пользователей" value={overview.totalUsers} />
      </div>

      <Card>
        <h3>Текущая неделя {currentWeek.isCurrentWeek ? "(сейчас)" : ""}</h3>
        <p className="stats-muted">
          {new Date(currentWeek.weekStart).toLocaleDateString("ru-RU")} —{" "}
          {new Date(currentWeek.weekEnd).toLocaleDateString("ru-RU")}
        </p>
        <div className="menu-history-days">
          {currentWeek.days.map((day) => (
            <article key={day.date} className="menu-history-day">
              <h4>
                {day.dayName} {new Date(day.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                {!day.isComplete ? " · неполное" : ""}
              </h4>
              {MEAL_TYPES.map((mealType) => (
                <p key={mealType} className="stats-muted">
                  <strong>{MEAL_TYPE_LABELS[mealType]}:</strong>{" "}
                  {day.meals[mealType].map((d) => d.name).join(", ") || "—"}
                </p>
              ))}
            </article>
          ))}
        </div>
      </Card>

      <div className="home-columns">
        <Card>
          <h3>Покрытие меню за 7 дней</h3>
          <div className="bar-chart">
            {last7Days.map((day) => (
              <div key={day.date} className="bar-chart-item">
                <div
                  className="bar-chart-bar"
                  style={{ height: `${Math.max(8, (day.dishCount / maxDayDishes) * 100)}%` }}
                  title={`${day.dishCount} блюд${day.isComplete ? ", полное" : ""}`}
                />
                <span className="bar-chart-label">{day.date.slice(5)}</span>
                <span className="bar-chart-value">{day.hasMenu ? day.dishCount : "—"}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3>Частые блюда в меню</h3>
          <ol className="stats-ranked">
            {popularDishes.slice(0, 5).map((dish, i) => (
              <li key={dish.dishName}>
                <span className="rank">{i + 1}</span>
                <div>
                  <strong>{dish.dishName}</strong>
                  <span className="stats-muted">
                    {dish.category} · {dish.count} раз в меню
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card>
        <h3>Категории в меню</h3>
        <ul className="stats-list">
          {categoryStats.map((cat) => (
            <li key={cat.categoryName}>
              <strong>{cat.categoryName}</strong>
              <span>
                {cat.dishCount} блюд · {cat.menuAppearances} вхождений
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
