import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { logout, roleLabel, selectCanManageMenu, selectCanUseFavorites, selectIsAdmin } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: { id: number; email: string; fullName: string; role: string } | null;
};

export function BurgerMenu({ isOpen, onClose, user }: Props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const canManageMenu = useSelector(selectCanManageMenu);
  const canUseFavorites = useSelector(selectCanUseFavorites);
  const isAdmin = useSelector(selectIsAdmin);

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
    onClose();
  };

  const handleLinkClick = () => onClose();

  return (
    <>
      <div 
        className={`mobile-menu-overlay ${isOpen ? "is-visible" : ""}`} 
        onClick={onClose} 
        aria-hidden={!isOpen} 
      />
      <aside 
        className={`mobile-menu ${isOpen ? "is-open" : ""}`} 
        role="dialog" 
        aria-modal="true" 
        aria-label="Меню навигации"
      >
        <div className="mobile-menu-header">
          <h2 className="mobile-menu-title">Меню</h2>
          <button className="mobile-menu-close" onClick={onClose} aria-label="Закрыть меню">
            ✕
          </button>
        </div>

        <nav className="mobile-menu-nav">
          <NavLink className="mobile-nav-link" to="/" onClick={handleLinkClick} end>
            Главная
          </NavLink>
          <NavLink className="mobile-nav-link" to="/menu" onClick={handleLinkClick}>
            Меню
          </NavLink>
          {canManageMenu && (
            <NavLink className="mobile-nav-link" to="/menu-history" onClick={handleLinkClick}>
              История меню
            </NavLink>
          )}
          <NavLink className="mobile-nav-link" to="/dishes" onClick={handleLinkClick}>
            Все блюда
          </NavLink>
          {canUseFavorites && (
            <NavLink className="mobile-nav-link" to="/favorites" onClick={handleLinkClick}>
              Избранное
            </NavLink>
          )}
          {user && (
            <NavLink className="mobile-nav-link" to="/profile" onClick={handleLinkClick}>
              Профиль
            </NavLink>
          )}
          {canManageMenu && (
            <NavLink className="mobile-nav-link" to="/menu-planning" onClick={handleLinkClick}>
              Планирование
            </NavLink>
          )}
          {isAdmin && (
            <>
              <NavLink className="mobile-nav-link" to="/admin" onClick={handleLinkClick}>
                Админ
              </NavLink>
              <NavLink className="mobile-nav-link" to="/reports" onClick={handleLinkClick}>
                Отчеты
              </NavLink>
            </>
          )}
        </nav>

        {user && (
          <div className="mobile-menu-user">
            <div className="mobile-user-info">
              <span className="mobile-user-name">{user.fullName}</span>
              <span className="mobile-user-role">{roleLabel(user.role)}</span>
            </div>
            <Button type="button" className="mobile-logout-btn" onClick={onLogout}>
              Выйти
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}

export function BurgerButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button className="burger-btn" onClick={onClick} aria-label={isOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={isOpen}>
      <span className="burger-line" />
      <span className="burger-line" />
      <span className="burger-line" />
    </button>
  );
}