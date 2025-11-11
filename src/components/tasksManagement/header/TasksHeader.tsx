import React, { useMemo } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  alpha,
} from "@mui/material";
import { ViewType } from "../types";
import { CalendarMonth, List, Insights } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";

interface TasksHeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  currentView,
  onViewChange,
}) => {
  const { t } = useTranslation();
  const { data: tasks = [] } = useAllWeddingsTasks();

  // Calculate stats for compact display
  const stats = useMemo(() => {
    const now = new Date();
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);

    const overdue = tasks.filter(
      (task) => !task.completed && task.dueDate && new Date(task.dueDate) < now
    ).length;

    const upcoming = tasks.filter(
      (task) =>
        !task.completed &&
        task.dueDate &&
        new Date(task.dueDate) >= now &&
        new Date(task.dueDate) <= twoWeeks
    ).length;

    const later = tasks.filter(
      (task) =>
        !task.completed &&
        task.dueDate &&
        new Date(task.dueDate) > twoWeeks
    ).length;

    const completed = tasks.filter((task) => task.completed).length;

    return { overdue, upcoming, later, completed };
  }, [tasks]);

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: ViewType | null
  ) => {
    if (newView !== null) {
      onViewChange(newView);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t("tasksManagement.title")}
        </Typography>

        {/* Compact Status Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {stats.overdue > 0 && (
            <Chip
              label={`${stats.overdue} ${t("tasksManagement.list.overdueTitle")}`}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                color: "error.main",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          )}
          {stats.upcoming > 0 && (
            <Chip
              label={`${stats.upcoming} ${t("tasksManagement.list.upcomingTitle")}`}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                color: "info.main",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          )}
          {stats.later > 0 && (
            <Chip
              label={`${stats.later} ${t("tasksManagement.list.laterTitle")}`}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          )}
          {stats.completed > 0 && (
            <Chip
              label={`${stats.completed} ${t("common.completed")}`}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          )}
        </Box>
      </Box>

      <ToggleButtonGroup
        value={currentView}
        exclusive
        onChange={handleViewChange}
        aria-label="view selector"
      >
        <ToggleButton value="calendar" aria-label="calendar view">
          <CalendarMonth />
        </ToggleButton>
        <ToggleButton value="list" aria-label="list view">
          <List />
        </ToggleButton>
        <ToggleButton value="stats" aria-label="stats view">
          <Insights />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default TasksHeader;
