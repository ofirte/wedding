import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../hooks/auth/AuthContext";
import LandingPage from "../landing/LandingPage";

const RootRedirect: React.FC = () => {
  const { currentUser } = useAuth();

  if (currentUser) {
    // If user is authenticated, redirect to wedding setup page
    return <Navigate to="/wedding" replace />;
  } else {
    // If user is not authenticated, redirect to login page
    const search = window.location.search;
    if (search) {
      // Preserve any query parameters in the redirect
      return <Navigate to={`/login${search}`} replace />;
    }
    return <LandingPage />; // Redirect to landing page if no query parameters
  }
};

export default RootRedirect;
