import React, { useMemo } from "react";
import { Box, Typography, Divider, Collapse } from "@mui/material";
import TaskList from "./TaskList";
import { useTranslation } from "../../../localization/LocalizationContext";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import { Task } from "@wedding-plan/types";
import { useTasksManagement } from "../TasksManagementContext";

const TasksListView: React.FC = () => {
  const { t } = useTranslation();
  const { data: tasks = [], isLoading: isLoadingTasks } = useAllWeddingsTasks();
  const { filterTasks, filters } = useTasksManagement();
  const filteredTasks = filterTasks(tasks);
  const [showRecentlyCompleted, setShowRecentlyCompleted] = React.useState(true);

  const now = useMemo(() => new Date(), []); // Memoize current date
  const twoWeeks = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  }, []);

  const sevenDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }, []);

  interface TaskGroups {
    overdueTasks: (Task & { weddingId: string })[];
    upcomingTasks: (Task & { weddingId: string })[];
    laterTasks: (Task & { weddingId: string })[];
    recentlyCompletedTasks: (Task & { weddingId: string })[];
    allCompletedTasks: (Task & { weddingId: string })[];
  }

  const { overdueTasks, upcomingTasks, laterTasks, recentlyCompletedTasks, allCompletedTasks } =
    useMemo(() => {
      return filteredTasks.reduce<TaskGroups>(
        (acc, task) => {
          // Handle completed tasks separately
          if (task.completed) {
            acc.allCompletedTasks.push(task);
            // Add to recently completed if completed in last 7 days
            if (task.completedAt) {
              const completedDate = new Date(task.completedAt);
              if (completedDate >= sevenDaysAgo) {
                acc.recentlyCompletedTasks.push(task);
              }
            }
            return acc;
          }

          // Skip tasks without due date for date-based filtering
          if (!task.dueDate) {
            return acc;
          }

          const dueDate = new Date(task.dueDate);

          // Only add non-completed tasks to active sections
          if (dueDate < now) {
            acc.overdueTasks.push(task);
          } else if (dueDate >= now && dueDate <= twoWeeks) {
            acc.upcomingTasks.push(task);
          } else if (dueDate > twoWeeks) {
            acc.laterTasks.push(task);
          }

          return acc;
        },
        {
          overdueTasks: [],
          upcomingTasks: [],
          laterTasks: [],
          recentlyCompletedTasks: [],
          allCompletedTasks: [],
        }
      );
    }, [filteredTasks, now, twoWeeks, sevenDaysAgo]);

  // Sort recently completed by completedAt (newest first) and limit to 10
  const sortedRecentlyCompleted = useMemo(() => {
    return [...recentlyCompletedTasks]
      .sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      })
      .slice(0, 10);
  }, [recentlyCompletedTasks]);

  if (isLoadingTasks) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          {t("tasksManagement.list.loadingTasks")}
        </Typography>
      </Box>
    );
  }
  // If filtered to show only completed tasks
  if (filters.status === "completed") {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {t("tasksManagement.list.completedTitle")}
        </Typography>
        <TaskList tasks={allCompletedTasks} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Overdue Tasks */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("tasksManagement.list.overdueTitle")}
        </Typography>
        <TaskList tasks={overdueTasks} />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Upcoming Tasks */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("tasksManagement.list.upcomingTitle")}
        </Typography>
        <TaskList tasks={upcomingTasks} />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Later Tasks */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("tasksManagement.list.laterTitle")}
        </Typography>
        <TaskList tasks={laterTasks} />
      </Box>

      {/* Recently Completed Section */}
      {sortedRecentlyCompleted.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
              onClick={() => setShowRecentlyCompleted(!showRecentlyCompleted)}
            >
              Recently Completed ({sortedRecentlyCompleted.length})
              <Typography variant="body2" color="text.secondary">
                {showRecentlyCompleted ? "▼" : "▶"}
              </Typography>
            </Typography>
            <Collapse in={showRecentlyCompleted}>
              <TaskList tasks={sortedRecentlyCompleted} />
            </Collapse>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TasksListView;
