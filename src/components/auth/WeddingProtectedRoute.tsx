import React from "react";
import { Navigate, Outlet, useParams } from "react-router";
import { useCurrentUser } from "../../hooks/auth/useCurrentUser";
import DSLoading from "../common/DSLoading";
import { AccessDenied } from "../common";

interface WeddingProtectedRouteProps {
  redirectPath?: string;
}

/**
 * Protected route that ensures user has access to the specific wedding
 * Checks if the wedding ID is in the user's weddingIds array
 */
const WeddingProtectedRoute: React.FC<WeddingProtectedRouteProps> = ({
  redirectPath = "/weddings",
}) => {
  const { data: userData, isLoading: userDataLoading } = useCurrentUser();
  const { weddingId } = useParams<{ weddingId: string }>();

  if (userDataLoading) {
    return <DSLoading />;
  }

  if (!weddingId) {
    return <Navigate to={redirectPath} replace />;
  }
  const userWeddingIds = userData?.weddingIds || [];
  const hasWeddingAccess = userWeddingIds.includes(weddingId);

  if (!hasWeddingAccess) {
    return <AccessDenied reason="wedding" />;
  }

  return <Outlet />;
};

export default WeddingProtectedRoute;
