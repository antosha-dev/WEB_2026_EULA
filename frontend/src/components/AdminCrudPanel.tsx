import React from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../utils/api";
import { Button, Card, DataTable, Input, Loader } from "./ui";

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "password" | "date" | "select" | "checkbox";
  options?: { value: string | number; label: string }[];
  required?: boolean;
};

type Props = {
  title: string;
  endpoint: string;
  fields: FieldConfig[];
  columns: string[];
  getRowId: (row: Record<string, unknown>) => number;
  mapRowToForm?: (row: Record<string, unknown>) => Record<string, string>;
  mapFormToBody: (form: Record<string, string>) => Record<string, unknown>;
  renderCell?: (row: Record<string, unknown>, col: string) => React.ReactNode;
};

const emptyForm = (fields: FieldConfig[]) =>
  Object.fromEntries(fields.map((f) => [f.key, f.type === "checkbox" ? "false" : ""]));

export default function AdminCrudPanel({
  title,
  endpoint,
  fields,
  columns,
  getRowId,
  mapRowToForm,
  mapFormToBody,
  renderCell
}: Props) {
  const [rows, setRows] = React.useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<Record<string, string>>(emptyForm(fields));
  const [editId, setEditId] = React.useState<number | null>(null);
  const [error, setError] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<Record<string, unknown>[]>(endpoint);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (editId !== null && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const body = mapFormToBody(form);
      if (editId !== null) {
        await apiPut(`${endpoint}/${editId}`, body);
      } else {
        await apiPost(endpoint, body);
      }
      setForm(emptyForm(fields));
      setEditId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  };

  const onEdit = (row: Record<string, unknown>) => {
    setEditId(getRowId(row));
    const mapped = mapRowToForm ? mapRowToForm(row) : {};
    const next = emptyForm(fields);
    for (const f of fields) {
      if (mapped[f.key] !== undefined) next[f.key] = mapped[f.key];
      else if (row[f.key] !== undefined && row[f.key] !== null) next[f.key] = String(row[f.key]);
    }
    setForm(next);
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Удалить запись?")) return;
    setError("");
    try {
      await apiDelete(`${endpoint}/${id}`);
      if (editId === id) {
        setEditId(null);
        setForm(emptyForm(fields));
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    }
  };

  return (
    <Card className="admin-crud-panel">
      <h3>{title}</h3>
      {error ? <p className="form-error">{error}</p> : null}

      <form ref={formRef} className="admin-form" onSubmit={onSubmit}>
        {fields.map((field) => (
          <label key={field.key} className="admin-field">
            <span>{field.label}</span>
            {field.type === "select" ? (
              <select
                className="select"
                value={form[field.key]}
                required={field.required}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              >
                <option value="">—</option>
                {field.options?.map((opt) => (
                  <option key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                className="checkbox"
                checked={form[field.key] === "true"}
                onChange={(e) => setForm({ ...form, [field.key]: String(e.target.checked) })}
              />
            ) : (
              <Input
                type={field.type || "text"}
                value={form[field.key]}
                required={field.required && editId === null}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              />
            )}
          </label>
        ))}
        <div className="admin-form-actions">
          <Button type="submit">{editId !== null ? "Сохранить" : "Добавить"}</Button>
          {editId !== null ? (
            <Button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm(fields));
              }}
            >
              Отмена
            </Button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-wrap">
          <DataTable>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = getRowId(row);
                return (
                  <tr key={id}>
                    {columns.map((col) => (
                      <td key={col}>{renderCell ? renderCell(row, col) : String(row[col] ?? "")}</td>
                    ))}
                    <td>
                      <Button type="button" onClick={() => onEdit(row)}>
                        Изменить
                      </Button>
                      <Button type="button" onClick={() => onDelete(id)}>
                        Удалить
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        </div>
      )}
    </Card>
  );
}
