import React, { FC } from "react";
import { Routes, Route } from "react-router";
import App from "./App";
import WeddingInviteTable from "./components/invitees/InviteList";
import BudgetPlanner from "./components/budget/BudgetPlanner";
const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/invite" element={<WeddingInviteTable />} />
        <Route path="/budget" element={<BudgetPlanner />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
