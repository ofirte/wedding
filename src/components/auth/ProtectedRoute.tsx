import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/auth/AuthContext";
import DSLoading from "../common/DSLoading";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = "/login",
}) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <DSLoading />;
  }

  if (!currentUser) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
