import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store';
import { type UserRole } from '../store/authSlice';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = '/login',
}) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

interface RoleRouteProps {
  allowedRoles: UserRole[];
  redirectPath?: string;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRoles,
  redirectPath = '/forbidden',
}) => {
  const { activeRole } = useAppSelector((state) => state.auth);

  if (!activeRole || !allowedRoles.includes(activeRole)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
