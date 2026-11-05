import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Button, Card, Input, Loader } from "../components/ui";
import { clearFavorites } from "../store/slices/favoritesSlice";
import { resetMenuPrefs } from "../store/slices/menuSlice";
import { showSnackbar } from "../store/slices/uiSlice";
import { setUser } from "../store/slices/authSlice";
import { resetUserSettingsStorage } from "../utils/resetStorage";
import { apiGet, apiPatch } from "../utils/api";
import type { AuthUser } from "../utils/api";

type ProfileData = AuthUser & {
  createdAt?: string;
  student?: { classNumber: string; allergies: string | null } | null;
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const authUser = useSelector((s: RootState) => s.auth.user);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [classNumber, setClassNumber] = React.useState("");
  const [allergies, setAllergies] = React.useState("");
  const [role, setRole] = React.useState<"student" | "admin" | "kitchen_manager">("student");
  const [createdAt, setCreatedAt] = React.useState("");

  const loadProfile = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const profile = await apiGet<ProfileData>("/users/me", token);
      setFullName(profile.fullName);
      setEmail(profile.email);
      setRole(profile.role);
      setClassNumber(profile.student?.classNumber ?? "");
      setAllergies(profile.student?.allergies ?? "");
      setCreatedAt(profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("ru-RU") : "");
      dispatch(
        setUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role
        })
      );
    } catch (err) {
      dispatch(showSnackbar({ message: err instanceof Error ? err.message : "Не удалось загрузить профиль", type: "error" }));
    } finally {
      setLoading(false);
    }
  }, [dispatch, token]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== passwordConfirm) {
      dispatch(showSnackbar({ message: "Пароли не совпадают", type: "error" }));
      return;
    }
    if (password && password.length < 8) {
      dispatch(showSnackbar({ message: "Пароль должен быть не короче 8 символов", type: "error" }));
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, string | null> = {
        fullName: fullName.trim(),
        email: email.trim()
      };
      if (password) body.password = password;
      if (role === "student") {
        body.classNumber = classNumber.trim();
        body.allergies = allergies.trim() || null;
      }

      const updated = await apiPatch<ProfileData>("/users/me", body, token);
      dispatch(
        setUser({
          id: updated.id,
          email: updated.email,
          fullName: updated.fullName,
          role: updated.role
        })
      );
      setPassword("");
      setPasswordConfirm("");
      dispatch(showSnackbar({ message: "Профиль сохранён", type: "success" }));
    } catch (err) {
      dispatch(showSnackbar({ message: err instanceof Error ? err.message : "Ошибка сохранения", type: "error" }));
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    resetUserSettingsStorage();
    dispatch(clearFavorites());
    dispatch(resetMenuPrefs());
    dispatch(showSnackbar({ message: "Настройки приложения очищены", type: "info" }));
  };

  if (loading) return <Loader />;

  const isStudent = role === "student";

  return (
    <section className="profile-page">
      <h2>Профиль</h2>
      <p className="admin-page-desc">Управление личными данными и настройками аккаунта</p>

      <div className="profile-layout">
        <Card className="profile-summary">
          <h3>Обзор</h3>
          <ul className="profile-info">
            <li>
              <strong>ID:</strong> {authUser?.id}
            </li>
            <li>
              <strong>Роль:</strong> {isStudent ? "Ученик / Родитель" : "Администратор"}
            </li>
            {createdAt ? (
              <li>
                <strong>Дата регистрации:</strong> {createdAt}
              </li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <h3>Личные данные</h3>
          <form className="profile-form" onSubmit={onSave}>
            <label className="admin-field">
              <span>ФИО</span>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
            </label>
            <label className="admin-field">
              <span>Email</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {isStudent ? (
              <>
                <label className="admin-field">
                  <span>Класс</span>
                  <Input
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                    placeholder="7A"
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Аллергены</span>
                  <Input
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Орехи, лактоза..."
                  />
                </label>
              </>
            ) : null}

            <h3 className="profile-section-title">Смена пароля</h3>
            <p className="stats-muted">Оставьте пустым, если менять пароль не нужно</p>
            <label className="admin-field">
              <span>Новый пароль</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                minLength={6}
              />
            </label>
            <label className="admin-field">
              <span>Подтверждение пароля</span>
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Повторите пароль"
              />
            </label>

            <div className="profile-form-actions">
              <Button type="submit" disabled={saving}>
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </Button>
              <Button type="button" onClick={loadProfile} disabled={saving}>
                Отменить
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h3>Настройки приложения</h3>
          <p className="stats-muted">
            Сбросит фильтры меню и избранное в браузере.
          </p>
          <Button type="button" onClick={onReset}>
            Сброс локальных настроек
          </Button>
        </Card>
      </div>
    </section>
  );
}
