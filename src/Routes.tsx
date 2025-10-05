import React, { FC } from "react";
import { Routes, Route } from "react-router";
import App from "./App";
import WeddingInviteTable from "./components/invitees/InviteList";
import BudgetPlanner from "./components/budget/BudgetPlanner";
import Home from "./components/home/Home";
import TaskManager from "./components/tasks/TaskManager";
import RSVPManager from "./components/rsvp/RSVPManager";
import MigrationManager from "./migrations/components/MigrationManager";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import SetupWeddingPage from "./components/wedding/SetupWeddingPage";
import WeddingRoute from "./components/wedding/WeddingRoute";
import RootRedirect from "./components/auth/RootRedirect";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRSVPPage from "./components/rsvp/GuestRSVPPage";
import GuestRSVPPageV2 from "./components/rsvp/GuestRSVPPageV2";

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/guest-rsvp/:weddingId/:guestId"
        element={<GuestRSVPPage />}
      />
      <Route
        path="/guest-rsvp-v2/:weddingId/:guestId"
        element={<GuestRSVPPageV2 />}
      />
      <Route element={<ProtectedRoute redirectPath="/login" />}>
        <Route path="wedding" element={<WeddingRoute />}>
          <Route index element={<SetupWeddingPage />} />
          <Route path=":weddingId" element={<App />}>
            <Route path="home" element={<Home />} />
            <Route path="invite" element={<WeddingInviteTable />} />
            <Route path="budget" element={<BudgetPlanner />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="rsvp" element={<RSVPManager />} />
            <Route path="migrations" element={<MigrationManager />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
