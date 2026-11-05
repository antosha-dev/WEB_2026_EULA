import React from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { Footer, Header, Navbar, Snackbar, Button } from "./components/ui";
import { AuthGuard } from "./components/AuthGuard";
import { BurgerButton, BurgerMenu } from "./components/BurgerMenu";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MenuPage from "./pages/MenuPage";
import MenuHistoryPage from "./pages/MenuHistoryPage";
import MenuPlanningPage from "./pages/MenuPlanningPage";
import AllDishesPage from "./pages/AllDishesPage";
import DishDetailsPage from "./pages/DishDetailsPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import ReportsPage from "./pages/ReportsPage";
import {
  logout,
  roleLabel,
  selectCanManageMenu,
  selectCanUseFavorites,
  selectIsAdmin,
  selectIsAuthenticated
} from "./store/slices/authSlice";
import { hideSnackbar } from "./store/slices/uiSlice";
import { WIREFRAME_MODE } from "./config/mode";
import { WireframeBanner } from "./components/WireframeBanner";

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const snackbar = useSelector((state: RootState) => state.ui.snackbar);
  const isAuth = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const canManageMenu = useSelector(selectCanManageMenu);
  const canUseFavorites = useSelector(selectCanUseFavorites);
  const user = useSelector((state: RootState) => state.auth.user);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  React.useEffect(() => {
    if (!snackbar) return;
    const t = setTimeout(() => dispatch(hideSnackbar()), 3500);
    return () => clearTimeout(t);
  }, [snackbar, dispatch]);

  return (
    <div className="app">
      {WIREFRAME_MODE ? <WireframeBanner /> : null}
      <BurgerMenu isOpen={menuOpen} onClose={closeMenu} user={user} />
      <Header>
        <div className="header-top">
          <h1 className="site-title">Школьная столовая</h1>
          <div className="header-auth">
            {isAuth && user ? (
              <>
                <span className="user-badge">
                  {user.fullName} ({roleLabel(user.role)})
                </span>
                <Button type="button" onClick={onLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <NavLink className="nav-link" to="/login">
                  Вход
                </NavLink>
                <NavLink className="nav-link" to="/register">
                  Регистрация
                </NavLink>
              </>
            )}
          </div>
        </div>
        <BurgerButton onClick={toggleMenu} isOpen={menuOpen} />
        <Navbar>
          <NavLink className="nav-link" to="/">
            Главная
          </NavLink>
          <NavLink className="nav-link" to="/menu">
            Меню
          </NavLink>
          {canManageMenu ? (
            <NavLink className="nav-link" to="/menu-history">
              История меню
            </NavLink>
          ) : null}
          <NavLink className="nav-link" to="/dishes">
            Все блюда
          </NavLink>
          {canUseFavorites ? (
            <NavLink className="nav-link" to="/favorites">
              Избранное
            </NavLink>
          ) : null}
          {isAuth ? (
            <NavLink className="nav-link" to="/profile">
              Профиль
            </NavLink>
          ) : null}
          {canManageMenu ? (
            <NavLink className="nav-link" to="/menu-planning">
              Планирование
            </NavLink>
          ) : null}
          {isAdmin ? (
            <>
              <NavLink className="nav-link" to="/admin">
                Админ
              </NavLink>
              <NavLink className="nav-link" to="/reports">
                Отчеты
              </NavLink>
            </>
          ) : null}
        </Navbar>
      </Header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <AuthGuard guestOnly>
                <LoginPage />
              </AuthGuard>
            }
          />
          <Route
            path="/register"
            element={
              <AuthGuard guestOnly>
                <RegisterPage />
              </AuthGuard>
            }
          />
          <Route path="/menu" element={<MenuPage />} />
          <Route
            path="/menu-history"
            element={
              <AuthGuard requireAuth roles={["admin", "kitchen_manager"]}>
                <MenuHistoryPage />
              </AuthGuard>
            }
          />
          <Route
            path="/menu-planning"
            element={
              <AuthGuard requireAuth roles={["admin", "kitchen_manager"]}>
                <MenuPlanningPage />
              </AuthGuard>
            }
          />
          <Route path="/dishes" element={<AllDishesPage />} />
          <Route path="/dishes/:id" element={<DishDetailsPage />} />
          <Route
            path="/favorites"
            element={
              <AuthGuard requireAuth roles={["admin", "kitchen_manager"]}>
                <FavoritesPage />
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard requireAuth>
                <ProfilePage />
              </AuthGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthGuard requireAuth roles={["admin"]}>
                <AdminPage />
              </AuthGuard>
            }
          />
          <Route
            path="/reports"
            element={
              <AuthGuard requireAuth roles={["admin"]}>
                <ReportsPage />
              </AuthGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer>School Canteen Project 2026</Footer>
      {snackbar ? (
        <Snackbar onClick={() => dispatch(hideSnackbar())} type={snackbar.type}>
          {snackbar.message}
        </Snackbar>
      ) : null}
    </div>
  );
}
