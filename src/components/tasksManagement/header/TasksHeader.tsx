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
import { CalendarMonth, List, TableRows } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import { useProducerTasks } from "../../../hooks/producerTasks";

interface TasksHeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  currentView,
  onViewChange,
}) => {
  const { t } = useTranslation();
  const { data: weddingTasks = [] } = useAllWeddingsTasks();
  const { data: producerTasks = [] } = useProducerTasks();

  // Combine wedding and producer tasks for stats
  const allTasks = useMemo(() => [...weddingTasks, ...producerTasks], [weddingTasks, producerTasks]);

  // Calculate stats for compact display
  const stats = useMemo(() => {
    const now = new Date();
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);

    const overdue = allTasks.filter(
      (task) => !task.completed && task.dueDate && new Date(task.dueDate) < now
    ).length;

    const upcoming = allTasks.filter(
      (task) =>
        !task.completed &&
        task.dueDate &&
        new Date(task.dueDate) >= now &&
        new Date(task.dueDate) <= twoWeeks
    ).length;

    const later = allTasks.filter(
      (task) =>
        !task.completed &&
        task.dueDate &&
        new Date(task.dueDate) > twoWeeks
    ).length;

    const completed = allTasks.filter((task) => task.completed).length;

    return { overdue, upcoming, later, completed };
  }, [allTasks]);

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
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

        {/* Status Chips - more prominent styling */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {stats.overdue > 0 && (
            <Chip
              label={`${stats.overdue} ${t("tasksManagement.list.overdueTitle")}`}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                color: "error.dark",
                fontWeight: 700,
                fontSize: "0.8rem",
                py: 0.5,
                borderRadius: 2,
                border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            />
          )}
          {stats.upcoming > 0 && (
            <Chip
              label={`${stats.upcoming} ${t("tasksManagement.list.upcomingTitle")}`}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
                color: "info.dark",
                fontWeight: 700,
                fontSize: "0.8rem",
                py: 0.5,
                borderRadius: 2,
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              }}
            />
          )}
          {stats.later > 0 && (
            <Chip
              label={`${stats.later} ${t("tasksManagement.list.laterTitle")}`}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                color: "primary.dark",
                fontWeight: 700,
                fontSize: "0.8rem",
                py: 0.5,
                borderRadius: 2,
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            />
          )}
          {stats.completed > 0 && (
            <Chip
              label={`${stats.completed} ${t("common.completed")}`}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.15),
                color: "success.dark",
                fontWeight: 700,
                fontSize: "0.8rem",
                py: 0.5,
                borderRadius: 2,
                border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
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
        <ToggleButton value="table" aria-label="table view">
          <TableRows />
        </ToggleButton>
        <ToggleButton value="list" aria-label="list view">
          <List />
        </ToggleButton>
        <ToggleButton value="calendar" aria-label="calendar view">
          <CalendarMonth />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default TasksHeader;
