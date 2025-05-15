import React, { useEffect } from "react";
import { Navigate, useLocation, Outlet, useNavigate } from "react-router";
import { Box, CircularProgress } from "@mui/material";
import { useCurrentUser } from "../../hooks/auth";
import { useAuth } from "../../hooks/auth/AuthContext";
import { useWedding } from "../../context/WeddingContext";

interface ProtectedRouteProps {}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({}) => {
  const { isLoading: isAuthLoading, weddingId: authWeddingId } = useAuth();
  const { currentWeddingId, isLoading: isWeddingLoading } = useWedding();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  if (isAuthLoading || isUserLoading || isWeddingLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (!currentUser) {
    navigate("/login", {
      state: { from: location },
      replace: true,
    });
    return null;
  } else if (!authWeddingId && !currentWeddingId) {
    if (location.pathname !== "/setup-wedding") {
      navigate("/setup-wedding", {
        state: { from: location },
        replace: true,
      });
    }
    return <Outlet />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
