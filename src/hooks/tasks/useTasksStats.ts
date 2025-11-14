import { Task } from "@wedding-plan/types";
import { useMemo } from "react";

export const useTasksStats = (tasks: Task[]) => {
      const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((task) => task.completed).length;
        const pending = total - completed;
        const completionPercentage =
          total > 0 ? Math.round((completed / total) * 100) : 0;
    
        const highPriority = tasks.filter(
          (task) => task.priority.toLowerCase() === "high" && !task.completed
        ).length;
    
        const upcomingDueTasks = tasks.filter((task) => {
          if (!task.dueDate || task.completed) return false;
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
          pending,
          completionPercentage,
          highPriority,
          upcomingDueTasks,
        };
      }, [tasks]);
      return stats;
    };