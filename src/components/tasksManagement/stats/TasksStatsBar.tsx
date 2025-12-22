import React, { useMemo } from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import {
  Warning,
  Schedule,
  CheckCircle,
  Celebration,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import { isTaskCompleted } from "../../tasks/taskUtils";

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Box sx={{ color: color || "primary.main", mr: 1 }}>{icon}</Box>
        <Typography variant="h6" component="div">
          {value}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const TasksStatsBar: React.FC = () => {
  const { t } = useTranslation();
  const { data: tasks = [] } = useAllWeddingsTasks();

  const stats = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const total = tasks.length;
    const overdue = tasks.filter(
      (task) => !isTaskCompleted(task) && task.dueDate && new Date(task.dueDate) < now
    ).length;
    const thisWeek = tasks.filter(
      (task) =>
        !isTaskCompleted(task) &&
        task.dueDate &&
        new Date(task.dueDate) >= now &&
        new Date(task.dueDate) <= nextWeek
    ).length;
    const completed = total
      ? Math.round(
          (tasks.filter((task) => isTaskCompleted(task)).length / total) * 100
        )
      : 0;
    const activeWeddings = new Set(tasks.map((task) => task.weddingId)).size;

    return {
      total,
      overdue,
      thisWeek,
      completed,
      activeWeddings,
    };
  }, [tasks]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatsCard
          icon={<Schedule />}
          title={t("tasksManagement.stats.total")}
          value={stats.total}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatsCard
          icon={<Warning />}
          title={t("tasksManagement.stats.overdue")}
          value={stats.overdue}
          color="error.main"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatsCard
          icon={<Schedule />}
          title={t("tasksManagement.stats.thisWeek")}
          value={stats.thisWeek}
          color="info.main"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatsCard
          icon={<CheckCircle />}
          title={t("tasksManagement.stats.completed")}
          value={`${stats.completed}%`}
          color="success.main"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatsCard
          icon={<Celebration />}
          title={t("tasksManagement.stats.activeWeddings")}
          value={stats.activeWeddings}
          color="secondary.main"
        />
      </Grid>
    </Grid>
  );
};

export default TasksStatsBar;
