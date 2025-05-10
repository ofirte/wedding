import React, { FC } from "react";
import { Routes, Route } from "react-router";
import App from "./App";
import WeddingInviteTable from "./components/invitees/InviteList";
import BudgetPlanner from "./components/budget/BudgetPlanner";
import Home from "./components/home/Home";
import TaskManager from "./components/tasks/TaskManager";

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/invite" element={<WeddingInviteTable />} />
        <Route path="/budget" element={<BudgetPlanner />} />
        <Route path="/tasks" element={<TaskManager />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
