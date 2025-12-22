import React from "react";
import { Grid } from "@mui/material";
import StatCard from "./StatCard";
import { useNavigate } from "react-router";
import {
  PeopleAlt as GuestsIcon,
  Money as BudgetIcon,
  CheckCircleOutline as TaskIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { useBudgetItems } from "../../hooks/budget/useBudgetItems";
import { useTotalBudget } from "../../hooks/budget/useTotalBudget";
import useTasks from "../../hooks/tasks/useTasks";
import { useWeddingDate } from "../../hooks/wedding/useWeddingDate";
import { useTranslation } from "../../localization/LocalizationContext";
import { gridColumns } from "../../utils/ResponsiveUtils";
import { isTaskCompleted } from "../tasks/taskUtils";

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return "₪" + amount.toLocaleString();
};

interface StatCardsProps {}

const StatCards: React.FC<StatCardsProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: guests } = useInvitees();
  const { data: budget } = useBudgetItems();
  const { data: totalBudget } = useTotalBudget();
  const { data: tasks } = useTasks();
  const weddingDateInfo = useWeddingDate();
  const totalBudgetAmount = totalBudget?.amount || 0;
  const guestStats = {
    total:
      guests?.reduce((acc, i) => acc + parseInt(i.amount.toString()), 0) || 0,
    confirmed:
      guests?.reduce((acc, guest) => acc + (parseInt(guest.rsvpStatus?.amount?.toString() ?? "0") || 0), 0) || 0,
    pending: guests?.filter((guest) => guest.rsvpStatus?.attendance === undefined).length || 0,
    declined: guests?.filter((guest) => guest.rsvpStatus?.attendance === false).length || 0,
  };

  const totalSpent =
    budget?.reduce((acc, i) => acc + parseInt(i.actualPrice.toString()), 0) ||
    0;
  const remainingBudget = totalBudgetAmount
    ? totalBudgetAmount - totalSpent
    : 0;
  const budgetStats = {
    total: totalBudgetAmount,
    spent: totalSpent,
    remaining: remainingBudget,
  };

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((task) => isTaskCompleted(task)).length || 0;
  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const taskStats = {
    total: totalTasks,
    completed: completedTasks,
    percentage: percentage,
  };
  return (
    <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: 4 }}>
      <Grid size={gridColumns.stats}>
        <StatCard
          icon={<GuestsIcon />}
          title={t("guests.guestList")}
          value={`${guestStats.confirmed}/${guestStats.total}`}
          subtitle={t("guests.guestsConfirmed")}
          color="primary"
          onClick={() => navigate("../invite")}
        />
      </Grid>

      <Grid size={gridColumns.stats}>
        <StatCard
          icon={<BudgetIcon />}
          title={t("budget.budget")}
          value={formatCurrency(budgetStats.spent)}
          subtitle={`${t("common.of")} ${formatCurrency(budgetStats.total)}`}
          color="info"
          onClick={() => navigate("../budget")}
        />
      </Grid>

      <Grid size={gridColumns.stats}>
        <StatCard
          icon={<TaskIcon />}
          title={t("tasks.tasks")}
          value={`${taskStats.completed}/${taskStats.total}`}
          subtitle={`${taskStats.percentage}% ${t("common.completed")}`}
          color="success"
          onClick={() => navigate("../tasks")}
        />
      </Grid>

      <Grid size={gridColumns.stats}>
        <StatCard
          icon={<TimeIcon />}
          title={t("home.timeline")}
          value={weddingDateInfo?.daysRemaining || 0}
          subtitle={t("home.daysRemaining")}
          color="warning"
        />
      </Grid>
    </Grid>
  );
};

export default StatCards;
