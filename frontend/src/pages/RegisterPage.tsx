import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button, Card, Input } from "../components/ui";
import { loginSuccess } from "../store/slices/authSlice";
import { registerRequest } from "../utils/api";
import { showSnackbar } from "../store/slices/uiSlice";
import { validatePassword } from "../utils/passwordValidation";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [classNumber, setClassNumber] = React.useState("");
  const [error, setError] = React.useState("");
  const [passwordErrors, setPasswordErrors] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const { errors } = validatePassword(value);
    setPasswordErrors(errors);
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, errors } = validatePassword(password);
    if (!valid) {
      setPasswordErrors(errors);
      setError(errors[0]);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await registerRequest(email, password, fullName, classNumber || undefined);
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      dispatch(showSnackbar({ message: "Регистрация успешна", type: "success" }));
      navigate("/menu", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-card">
      <h2>Регистрация</h2>
      <p className="auth-hint">Регистрация доступна только для ученика/родителя</p>
      <form onSubmit={onRegister}>
        <label className="admin-field">
          <span>ФИО</span>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label className="admin-field">
          <span>Email</span>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="admin-field">
          <span>Пароль</span>
          <Input
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {passwordErrors.map((err, i) => (
          <p key={i} className="form-error" style={{ fontSize: "0.85rem", margin: "4px 0 0" }}>
            {err}
          </p>
        ))}
        <label className="admin-field">
          <span>Класс</span>
          <Input value={classNumber} onChange={(e) => setClassNumber(e.target.value)} placeholder="7A" />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </Card>
  );
}
