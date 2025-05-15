import React, { FC } from "react";
import { Routes, Route, Navigate } from "react-router";
import App from "./App";
import WeddingInviteTable from "./components/invitees/InviteList";
import BudgetPlanner from "./components/budget/BudgetPlanner";
import Home from "./components/home/Home";
import TaskManager from "./components/tasks/TaskManager";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import SetupWeddingPage from "./components/auth/SetupWeddingPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useCurrentUser } from "./hooks/auth";

const AppRoutes: FC = () => {
  const { data: currentUser } = useCurrentUser();

  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Setup wedding route with App layout but no wedding requirement */}

      <Route path="/setup-wedding" element={<ProtectedRoute />}>
        <Route index element={<SetupWeddingPage />} />
      </Route>

      {/* Protected app routes */}
      <Route path="/" element={<App />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<Home />} />
          <Route path="/invite" element={<WeddingInviteTable />} />
          <Route path="/budget" element={<BudgetPlanner />} />
          <Route path="/tasks" element={<TaskManager />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
