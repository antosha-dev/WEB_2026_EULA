export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function getWeekStart(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

export function formatWeekRange(weekStart: string, weekEnd: string) {
  const start = new Date(weekStart).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  const end = new Date(weekEnd).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  return `${start} — ${end}`;
}
