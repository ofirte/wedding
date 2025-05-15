// filepath: /Users/ofirtene/Projects/wedding-plan/src/components/home/TaskOverviewCard.tsx
import React from "react";
import {
  Typography,
  Box,
  Divider,
  LinearProgress,
  styled,
  Paper,
  Button,
  useTheme,
  Stack,
} from "@mui/material";
import { ArrowForward as ArrowIcon } from "@mui/icons-material";
import { useNavigate } from "react-router";
import useTasks from "../../hooks/tasks/useTasks";

// Styled LinearProgress for better visualization
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
  },
}));

const TaskOverviewCard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: tasks } = useTasks();

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((task) => task.completed).length ?? 0;
  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressTasks =
    tasks?.filter((task) => !!task.assignedTo).length ?? 0;
  const pendingTasks = totalTasks - completedTasks - inProgressTasks;
  const taskStats = {
    total: totalTasks,
    completed: completedTasks,
    inProgress: inProgressTasks,
    pending: pendingTasks,
    percentage: percentage,
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Task Progress</Typography>
        <Button
          size="small"
          endIcon={<ArrowIcon />}
          onClick={() => navigate("/tasks")}
        >
          Details
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {taskStats.completed} of {taskStats.total} tasks completed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {taskStats.percentage}%
          </Typography>
        </Box>
        <StyledLinearProgress
          variant="determinate"
          value={taskStats.percentage}
          color="primary"
        />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={2}>
        <Box
          flex={1}
          sx={{
            p: 1.5,
            bgcolor: "success.light",
            color: "success.dark",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Completed
          </Typography>
          <Typography variant="h6">{taskStats.completed}</Typography>
        </Box>

        <Box
          flex={1}
          sx={{
            p: 1.5,
            bgcolor: "warning.light",
            color: "warning.dark",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Ongoing
          </Typography>
          <Typography variant="h6">{taskStats.inProgress}</Typography>
        </Box>

        <Box
          flex={1}
          sx={{
            p: 1.5,
            bgcolor: "error.light",
            color: "error.dark",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Pending
          </Typography>
          <Typography variant="h6">{taskStats.pending}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default TaskOverviewCard;
