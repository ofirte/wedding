import { FC } from "react";
import { Routes, Route } from "react-router";
import App from "./App";
import WeddingInviteTable from "./components/invitees/InviteList";
import BudgetPlanner from "./components/budget/BudgetPlanner";
import Home from "./components/home/Home";
import TaskManager from "./components/tasks/TaskManager";
import RSVPManager from "./components/rsvp/RSVPManager";
import SeatingManager from "./components/seating/SeatingManager";
import AttendanceTracker from "./components/seating/attendance/AttendanceTracker";

import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import SetupWeddingPage from "./components/wedding/SetupWeddingPage";
import WeddingSettings from "./components/wedding/WeddingSettings";
import WeddingRoute from "./components/wedding/WeddingRoute";
import RootRedirect from "./components/auth/RootRedirect";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import WeddingProtectedRoute from "./components/auth/WeddingProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import GuestRSVPPage from "./components/rsvpGuestForm/GuestRSVPPage";
import WeddingsPage from "./components/wedding/WeddingsPage";
import { AdminPage } from "./components/admin";
import ManageApp from "./components/common/ManageApp";
import { RsvpManagerContainer } from "./components/rsvp/RsvpManagerContainer";
import TasksManagementPage from "./components/tasksManagement/TasksManagementPage";
import TaskTemplateManager from "./components/taskTemplates/TaskTemplateManager";
import TaskTemplateBuilderPage from "./components/taskTemplates/TaskTemplateBuilderPage";
import LandingPage from "./components/landing/LandingPage";
import LeadsPage from "./components/leads/LeadsPage";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsOfService from "./components/legal/TermsOfService";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route
        path="/guest-rsvp/:weddingId/:guestId"
        element={<GuestRSVPPage />}
      />
      <Route
        path="/attendance/:weddingId"
        element={<AttendanceTracker />}
      />
      <Route element={<ProtectedRoute redirectPath="/login" />}>
        <Route path="wedding" element={<WeddingRoute />}>
          <Route index element={<SetupWeddingPage />} />
          <Route element={<WeddingProtectedRoute />}>
            <Route path=":weddingId" element={<App />}>
              <Route path="home" element={<Home />} />
              <Route path="invite" element={<WeddingInviteTable />} />
              <Route path="budget" element={<BudgetPlanner />} />
              <Route path="tasks" element={<TaskManager />} />
              <Route path="seating" element={<SeatingManager />} />
              <Route path="payment/success" element={<PaymentSuccessPage />} />
              <Route path="rsvp" element={<RsvpManagerContainer />} />
              <Route path="rsvp/admin" element={<RSVPManager />} />
              <Route path="settings" element={<WeddingSettings />} />
            </Route>
          </Route>
        </Route>
        <Route path="weddings" element={<ManageApp />}>
          <Route path="manage" element={<WeddingsPage />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="tasks" element={<TasksManagementPage />} />
          <Route path="task-templates" element={<TaskTemplateManager />} />
          <Route path="task-templates/create" element={<TaskTemplateBuilderPage />} />
          <Route path="task-templates/edit/:templateId" element={<TaskTemplateBuilderPage />} />
          <Route path="leads" element={<LeadsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
