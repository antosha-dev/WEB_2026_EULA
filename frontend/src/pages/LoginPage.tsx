import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button, Card, Input } from "../components/ui";
import { loginSuccess } from "../store/slices/authSlice";
import { loginRequest } from "../utils/api";
import { showSnackbar } from "../store/slices/uiSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      dispatch(showSnackbar({ message: `Добро пожаловать, ${data.user.fullName}!`, type: "success" }));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-card">
      <h2>Вход в аккаунт</h2>
      <p className="auth-hint">Демо: admin@school.local / Admin123! или student@school.local / Student123</p>
      <form onSubmit={onLogin}>
        <label className="admin-field">
          <span>Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@school.local"
            required
          />
        </label>
        <label className="admin-field">
          <span>Пароль</span>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
            minLength={8}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </Button>
      </form>
      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </Card>
  );
}
