import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { selectAuthRole, selectIsAuthenticated } from "../store/slices/authSlice";
import type { UserRole } from "../store/slices/authSlice";

type Props = {
  children: React.ReactNode;
  requireAuth?: boolean;
  roles?: UserRole[];
  guestOnly?: boolean;
};

export function AuthGuard({ children, requireAuth = false, roles, guestOnly = false }: Props) {
  const location = useLocation();
  const isAuth = useSelector(selectIsAuthenticated);
  const role = useSelector(selectAuthRole);
  const hydrated = useSelector((s: RootState) => s.auth.hydrated);

  if (!hydrated) {
    return <div className="loader-page">Загрузка...</div>;
  }

  if (guestOnly && isAuth) {
    return <Navigate to="/" replace />;
  }

  if (requireAuth && !isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && (!role || !roles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
