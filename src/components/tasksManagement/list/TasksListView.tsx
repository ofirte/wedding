import React, { useMemo } from "react";
import { Box, Typography, Divider } from "@mui/material";
import TaskList from "./TaskList";
import { useTranslation } from "../../../localization/LocalizationContext";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import { Task } from "@wedding-plan/types";
import { useTasksManagement } from "../TasksManagementContext";

const TasksListView: React.FC = () => {
  const { t } = useTranslation();
  const { data: tasks = [], isLoading: isLoadingTasks } = useAllWeddingsTasks();
  const { filterTasks } = useTasksManagement();
  const filteredTasks = filterTasks(tasks);
  const now = useMemo(() => new Date(), []); // Memoize current date
  const twoWeeks = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  }, []);

  interface TaskGroups {
    overdueTasks: (Task & { weddingId: string })[];
    upcomingTasks: (Task & { weddingId: string })[];
    laterTasks: (Task & { weddingId: string })[];
  }

  const { overdueTasks, upcomingTasks, laterTasks } = useMemo(() => {
    return filteredTasks.reduce<TaskGroups>(
      (acc, task) => {
        // Skip tasks without due date for date-based filtering
        if (!task.dueDate) {
          return acc;
        }

        const dueDate = new Date(task.dueDate);

        if (dueDate < now && !task.completed) {
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
      }
    );
  }, [filteredTasks, now, twoWeeks]);

  if (isLoadingTasks) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          {t("tasksManagement.list.loadingTasks")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("tasksManagement.list.overdueTitle")}
        </Typography>
        <TaskList tasks={overdueTasks} />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("tasksManagement.list.upcomingTitle")}
        </Typography>
        <TaskList tasks={upcomingTasks} />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6" gutterBottom>
          {t("tasksManagement.list.laterTitle")}
        </Typography>
        <TaskList tasks={laterTasks} />
      </Box>
    </Box>
  );
};

export default TasksListView;
