import { Task } from "@wedding-plan/types";
import { useMemo } from "react";
import { isTaskCompleted } from "../../components/tasks/taskUtils";

export const useTasksStats = (tasks: Task[]) => {
      const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((task) => isTaskCompleted(task)).length;
        const open = total - completed;
        const completionPercentage =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        const highPriority = tasks.filter(
          (task) => task.priority.toLowerCase() === "high" && !isTaskCompleted(task)
        ).length;

        const pastDue = tasks.filter((task) => {
          if (!task.dueDate || isTaskCompleted(task)) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const dueDate = new Date(task.dueDate);
          return dueDate < today;
        }).length;

        const upcomingDueTasks = tasks.filter((task) => {
          if (!task.dueDate || isTaskCompleted(task)) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate.getTime() - today.getTime();
          const dayDiff = timeDiff / (1000 * 3600 * 24);

          return dayDiff >= 0 && dayDiff <= 7;
        }).length;

        return {
          total,
          completed,
          open,
          completionPercentage,
          highPriority,
          pastDue,
          upcomingDueTasks,
        };
      }, [tasks]);
      return stats;
    };