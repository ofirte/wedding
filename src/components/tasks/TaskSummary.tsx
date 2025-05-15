import React, { useMemo } from "react";
import { Box, Grid, Typography, LinearProgress, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Assignment as TaskIcon,
  Flag as PriorityIcon,
} from "@mui/icons-material";
import { Task } from "../../hooks/tasks/useTasks";

interface TaskSummaryProps {
  tasks: Task[];
}

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const TaskSummary: React.FC<TaskSummaryProps> = ({ tasks }) => {
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, md: 8 }}>
          {/* <StatCard> */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TaskIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Task Progress</Typography>
            </Box>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {stats.completionPercentage}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={stats.completionPercentage}
            sx={{
              height: 10,
              borderRadius: 5,
              mb: 1,
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {stats.completed} of {stats.total} tasks completed
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {stats.pending} remaining
            </Typography>
          </Box>
          {/* </StatCard> */}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={2} height="100%">
            <Grid size={{ xs: 6 }} height="100%">
              <StatCard sx={{ bgcolor: "warning.light" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PriorityIcon sx={{ color: "warning.dark", mr: 1 }} />
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="warning.dark"
                  >
                    High Priority
                  </Typography>
                </Box>
                <Typography variant="h4" color="warning.dark" fontWeight="bold">
                  {stats.highPriority}
                </Typography>
                <Typography variant="body2" color="warning.dark">
                  tasks need attention
                </Typography>
              </StatCard>
            </Grid>

            <Grid size={{ xs: 6 }} height="100%">
              <StatCard sx={{ bgcolor: "info.light" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {/* <WatchLater sx={{ color: "info.dark", mr: 1 }} /> */}
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="info.dark"
                  >
                    Due Soon
                  </Typography>
                </Box>
                <Typography variant="h4" color="info.dark" fontWeight="bold">
                  {stats.upcomingDueTasks}
                </Typography>
                <Typography variant="body2" color="info.dark">
                  tasks this week
                </Typography>
              </StatCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskSummary;
