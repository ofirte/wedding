import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { Box, CircularProgress } from '@mui/material';
import { useCurrentUser, useUserHasWedding } from '../../hooks/auth';
import { useAuth } from '../../hooks/auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWedding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireWedding = true 
}) => {
  const { isLoading } = useAuth();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: hasWedding, isLoading: isWeddingLoading } = 
    useUserHasWedding(currentUser?.uid);
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading || isUserLoading || (requireWedding && isWeddingLoading)) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If wedding is required but user has no wedding, redirect to setup
  if (requireWedding && !hasWedding) {
    return <Navigate to="/setup-wedding" state={{ from: location }} replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
