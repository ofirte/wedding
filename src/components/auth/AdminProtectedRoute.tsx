import React from "react";
import { Outlet } from "react-router";
import { useAuth } from "../../hooks/auth/AuthContext";
import DSLoading from "../common/DSLoading";
import { AccessDenied } from "../common";

interface AdminProtectedRouteProps {
  redirectPath?: string;
}

/**
 * Protected route that ensures only admin users can access
 * Checks if the user has admin role in their claims
 */
const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = () => {
  const { role, isClaimsLoading } = useAuth();

  if (isClaimsLoading) {
    return <DSLoading />;
  }

  // Check if user has admin role
  const isAdmin = role === "admin";

  if (!isAdmin) {
    return <AccessDenied reason="admin" />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
