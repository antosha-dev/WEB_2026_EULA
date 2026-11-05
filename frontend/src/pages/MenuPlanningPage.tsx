import React from "react";
import { useSelector } from "react-redux";
import { Button, Loader } from "../components/ui";
import { RootState } from "../store/store";
import { apiGet, apiPut } from "../utils/api";
import { Dish } from "../types/dish";
import { MealType, MEAL_TYPES, MEAL_TYPE_LABELS, WeekMenu } from "../types/menu";
import { addDays, formatDate, formatWeekRange, getWeekStart } from "../utils/menuWeek";

function sortDishesWithFavoritesFirst(dishes: Dish[], favoriteIds: number[]): Dish[] {
  const favoriteSet = new Set(favoriteIds);
  return [...dishes].sort((a, b) => {
    const aIsFav = favoriteSet.has(a.id);
    const bIsFav = favoriteSet.has(b.id);
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return 0;
  });
}

type WeekPlan = Record<string, Record<MealType, number[]>>;

function emptyPlan(weekStart: string): WeekPlan {
  const plan: WeekPlan = {};
  for (let i = 0; i < 7; i++) {
    const date = formatDate(addDays(new Date(weekStart), i));
    plan[date] = { BREAKFAST: [], LUNCH: [], SNACK: [] };
  }
  return plan;
}

function weekToPlan(week: WeekMenu): WeekPlan {
  const plan = emptyPlan(week.weekStart);
  for (const day of week.days) {
    for (const mealType of MEAL_TYPES) {
      plan[day.date][mealType] = day.meals[mealType].map((d) => d.id);
    }
  }
  return plan;
}

const WEEK_START_KEY = "menuPlanning.weekStart";

function getSavedWeekStart(): string {
  try {
    const saved = localStorage.getItem(WEEK_START_KEY);
    if (saved) return saved;
  } catch {}
  return formatDate(getWeekStart(new Date()));
}

export default function MenuPlanningPage() {
  const token = useSelector((s: RootState) => s.auth.token);
  const favoriteIds = useSelector((s: RootState) => s.favorites.dishIds);
  const [weekStart, setWeekStart] = React.useState(() => getSavedWeekStart());
  const [dishes, setDishes] = React.useState<Dish[]>([]);
  const [plan, setPlan] = React.useState<WeekPlan>(() => emptyPlan(getSavedWeekStart()));
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [weekEnd, setWeekEnd] = React.useState("");

  const sortedDishes = React.useMemo(
    () => sortDishesWithFavoritesFirst(dishes, favoriteIds),
    [dishes, favoriteIds]
  );

  const loadData = React.useCallback(
    async (start: string) => {
      setLoading(true);
      setStatus("");
      try {
        const [week, allDishes] = await Promise.all([
          apiGet<WeekMenu>(`/menus/week?startDate=${start}`, token),
          apiGet<Dish[]>("/dishes")
        ]);
        setDishes(allDishes);
        setPlan(weekToPlan(week));
        setWeekEnd(week.weekEnd);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  React.useEffect(() => {
    loadData(weekStart);
  }, [weekStart, loadData]);

  const shiftWeek = (delta: number) => {
    const newWeekStart = formatDate(addDays(new Date(weekStart), delta * 7));
    setWeekStart(newWeekStart);
    try {
      localStorage.setItem(WEEK_START_KEY, newWeekStart);
    } catch {}
  };

  const toggleDish = (date: string, mealType: MealType, dishId: number) => {
    setPlan((prev) => {
      const current = prev[date][mealType];
      const next = current.includes(dishId) ? current.filter((id) => id !== dishId) : [...current, dishId];
      return { ...prev, [date]: { ...prev[date], [mealType]: next } };
    });
  };

  const isCellEmpty = (date: string, mealType: MealType) => (plan[date]?.[mealType] ?? []).length === 0;

  const saveWeek = async () => {
    setSaving(true);
    setStatus("");
    try {
      const days = Object.entries(plan).map(([date, meals]) => ({ date, meals }));
      await apiPut(
        "/menus/week",
        { weekStartDate: weekStart, days },
        token
      );
      setStatus("Меню на неделю сохранено");
      await loadData(weekStart);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Не удалось сохранить меню");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const dates = Object.keys(plan).sort();

  return (
    <section className="menu-planning-page">
      <h2>Планирование меню</h2>
      <p className="admin-page-desc">
        Составьте меню на неделю. Можно сохранить частично заполненное меню — необязательно заполнять все дни и приёмы пищи.
      </p>

      <div className="menu-week-nav">
        <Button type="button" onClick={() => shiftWeek(-1)}>
          ← Предыдущая
        </Button>
        <strong>{formatWeekRange(weekStart, weekEnd || formatDate(addDays(new Date(weekStart), 6)))}</strong>
        <Button type="button" onClick={() => shiftWeek(1)}>
          Следующая →
        </Button>
      </div>

      <div className="menu-planning-grid">
        {dates.map((date) => (
          <div key={date} className="menu-planning-day">
            <h3>
              {new Date(date).toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })}
            </h3>
            {MEAL_TYPES.map((mealType) => (
              <div
                key={mealType}
                className={`menu-planning-meal ${isCellEmpty(date, mealType) ? "menu-planning-meal--empty" : ""}`}
              >
                <h4>{MEAL_TYPE_LABELS[mealType]}</h4>
                <div className="menu-planning-selected">
                  {(plan[date][mealType] ?? []).map((id) => {
                    const dish = dishes.find((d) => d.id === id);
                    return dish ? (
                      <button
                        key={id}
                        type="button"
                        className="tag tag--active"
                        onClick={() => toggleDish(date, mealType, id)}
                      >
                        {dish.name} ×
                      </button>
                    ) : null;
                  })}
                </div>
                <select
                  className="select"
                  value=""
                  onChange={(e) => {
                    const dishId = Number(e.target.value);
                    if (dishId) toggleDish(date, mealType, dishId);
                  }}
                >
                  <option value="">+ Добавить блюдо</option>
                  {sortedDishes.map((d) => (
                    <option key={d.id} value={d.id} disabled={plan[date][mealType].includes(d.id)}>
                      {d.name} ({d.category?.name}){favoriteIds.includes(d.id) ? " ⭐" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="menu-planning-actions">
        <Button type="button" onClick={saveWeek} disabled={saving}>
          {saving ? "Сохранение..." : "Сохранить неделю"}
        </Button>
        {status ? (
          <p className={status.includes("сохранено") ? "form-success" : "form-error"}>{status}</p>
        ) : null}
      </div>
    </section>
  );
}
