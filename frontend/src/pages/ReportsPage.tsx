import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { apiDownloadFile, apiGet, apiPost } from "../utils/api";
import { Button, Card, ChartBlock, Drawer, Loader } from "../components/ui";
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "../types/menu";

type ReportStats = {
  overview: {
    totalDishes: number;
    totalMenus: number;
    menuWeeks: number;
    completeDaysThisWeek: number;
    totalFavorites: number;
  };
  last7Days: { date: string; hasMenu: boolean; isComplete: boolean; dishCount: number }[];
  popularDishes: { dishName: string; count: number; category: string }[];
  currentWeek: {
    weekStart: string;
    weekEnd: string;
    days: { date: string; dayName: string; isComplete: boolean; meals: Record<string, { name: string }[]> }[];
  };
};

export default function ReportsPage() {
  const [email, setEmail] = React.useState("");
  const [reportType, setReportType] = React.useState<"menu" | "coverage">("menu");
  const [status, setStatus] = React.useState("");
  const [downloading, setDownloading] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<ReportStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const token = useSelector((s: RootState) => s.auth.token);

  React.useEffect(() => {
    apiGet<ReportStats>("/reports/dashboard", token)
      .then(setStats)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [token]);

  const downloadReport = async (path: string, filename: string, label: string) => {
    setDownloading(label);
    setStatus("");
    try {
      await apiDownloadFile(path, filename, token);
      setStatus(`Файл ${filename} скачан`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Не удалось скачать отчёт");
    } finally {
      setDownloading(null);
    }
  };

  const sendReport = async () => {
    setStatus("Отправка...");
    try {
      await apiPost("/reports/send-email", { email, reportType }, token);
      setStatus("Отчет успешно отправлен");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Не удалось отправить отчет");
    }
  };

  if (loading) return <Loader />;

  return (
    <section className="reports-page">
      <h2>Отчёты</h2>
      <p className="admin-page-desc">
        PDF-отчёт содержит меню на текущую неделю. DOCX-отчёт — покрытие меню, частые блюда и категории.
      </p>

      {stats ? (
        <>
          <div className="stats-grid">
            <ChartBlock title="Блюд в каталоге" value={stats.overview.totalDishes} />
            <ChartBlock title="Дней с меню" value={stats.overview.totalMenus} />
            <ChartBlock title="Недель с меню" value={stats.overview.menuWeeks} />
            <ChartBlock title="Полных дней на неделе" value={stats.overview.completeDaysThisWeek} />
          </div>

          <Card>
            <h3>Превью: текущая неделя</h3>
            {stats.currentWeek.days.map((day) => (
              <div key={day.date} style={{ marginBottom: "0.75rem" }}>
                <strong>
                  {day.dayName} {day.date}
                </strong>
                {MEAL_TYPES.map((mealType) => (
                  <p key={mealType} className="stats-muted">
                    {MEAL_TYPE_LABELS[mealType]}: {day.meals[mealType]?.map((d) => d.name).join(", ") || "—"}
                  </p>
                ))}
              </div>
            ))}
          </Card>
        </>
      ) : null}

      <Drawer>
        <Button
          type="button"
          disabled={downloading !== null}
          onClick={() => downloadReport("/reports/menu-week.pdf", "menu-week.pdf", "pdf-menu")}
        >
          {downloading === "pdf-menu" ? "Скачивание..." : "Скачать PDF: меню на неделю"}
        </Button>
        <Button
          type="button"
          disabled={downloading !== null}
          onClick={() => downloadReport("/reports/menu-coverage.docx", "menu-coverage.docx", "docx-coverage")}
        >
          {downloading === "docx-coverage" ? "Скачивание..." : "Скачать DOCX: покрытие меню"}
        </Button>
        <input
          className="input"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <select
          className="select"
          value={reportType}
          onChange={(event) => setReportType(event.target.value as "menu" | "coverage")}
        >
          <option value="menu">Меню на неделю</option>
          <option value="coverage">Покрытие меню</option>
        </select>
        <Button onClick={sendReport}>Отправить отчет на e-mail</Button>
        {status ? (
          <p className={status.includes("скачан") || status.includes("отправлен") ? "form-success" : ""}>
            {status}
          </p>
        ) : null}
      </Drawer>
    </section>
  );
}
