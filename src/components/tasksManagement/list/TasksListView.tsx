import React, { useMemo } from "react";
import { Box, Typography, Divider } from "@mui/material";
import TaskList, { DisplayTask } from "../../tasks/TaskList";
import { useTranslation } from "../../../localization/LocalizationContext";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import { Task } from "@wedding-plan/types";
import { useTasksManagement } from "../TasksManagementContext";
import { useProducerTasks } from "../../../hooks/producerTasks";

interface TasksListViewProps {
  // Unified callbacks - routing based on taskType is handled by parent
  onUpdate: (task: DisplayTask, data: Partial<Task>) => void;
  onDelete: (task: DisplayTask) => void;
  onAssign: (task: DisplayTask, userId: string) => void;
  onComplete: (task: DisplayTask, completed: boolean) => void;
}

interface TaskGroups {
    overdueTasks: DisplayTask[];
    upcomingTasks: DisplayTask[];
    laterTasks: DisplayTask[];
    recentlyCompletedTasks: DisplayTask[];
    allCompletedTasks: DisplayTask[];
}

const TasksListView: React.FC<TasksListViewProps> = ({
  onUpdate,
  onDelete,
  onAssign,
  onComplete,
}) => {
  const { t } = useTranslation();
  const { data: weddingTasks = [], isLoading: isLoadingWeddingTasks } = useAllWeddingsTasks();
  const { data: producerTasksData = [], isLoading: isLoadingProducerTasks } = useProducerTasks();
  const { filterTasks, filters } = useTasksManagement();

  // Combine wedding tasks and producer tasks for unified display
  const allTasks: DisplayTask[] = useMemo(() => {
    const weddingDisplayTasks: DisplayTask[] = weddingTasks.map((task) => ({
      ...task,
      taskType: "wedding" as const,
    }));

    const producerDisplayTasks: DisplayTask[] = producerTasksData.map((task) => ({
      ...task,
      taskType: "producer" as const,
      weddingId: undefined,
    }));

    return [...weddingDisplayTasks, ...producerDisplayTasks];
  }, [weddingTasks, producerTasksData]);

  // Cast back to DisplayTask since filterTasks preserves all properties
  const filteredTasks = filterTasks(allTasks) as DisplayTask[];
  const isLoadingTasks = isLoadingWeddingTasks || isLoadingProducerTasks;

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



  const { overdueTasks, upcomingTasks, laterTasks, allCompletedTasks } =
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

          // Tasks without due date go to "later" section
          if (!task.dueDate) {
            acc.laterTasks.push(task);
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

  // Check if completed tasks should be shown
  const showCompleted = filters.status?.includes("completed");

  const tasksList = [{
    title: 'tasksManagement.list.overdueTitle',
    tasks: overdueTasks
  }, {
    title: 'tasksManagement.list.upcomingTitle',
    tasks: upcomingTasks
  }, {
    title: 'tasksManagement.list.laterTitle',
    tasks: laterTasks
  },
  // Include completed section when completed status is selected
  ...(showCompleted ? [{
    title: 'tasksManagement.list.completedTitle',
    tasks: allCompletedTasks
  }] : [])]

  if (isLoadingTasks) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          {t("tasksManagement.list.loadingTasks")}
        </Typography>
      </Box>
    );
  }
  // Check if showing only completed tasks (completed selected, others not)
  const showOnlyCompleted = filters.status?.includes("completed") &&
    !filters.status?.includes("not_started") &&
    !filters.status?.includes("in_progress");

  if (showOnlyCompleted) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {t("tasksManagement.list.completedTitle")}
        </Typography>
        <TaskList
          tasks={allCompletedTasks}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAssign={onAssign}
          onComplete={onComplete}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Overdue Tasks */}
      {tasksList.map(({title, tasks}, index) => tasks.length > 0 && (
        <>
        <Box key={title} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t(title)}
          </Typography>
          <TaskList
            tasks={tasks}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAssign={onAssign}
            onComplete={onComplete}
          />
        </Box>
        {index < tasksList.length - 1 && <Divider sx={{ my: 3 }} />}
        </>
      ))}
    </Box>
  );
};

export default TasksListView;
