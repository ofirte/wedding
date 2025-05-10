import React from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  styled,
  Paper,
  Button,
  useTheme,
} from "@mui/material";
import { ArrowForward as ArrowIcon } from "@mui/icons-material";
import { useNavigate } from "react-router";

// Styled LinearProgress for better visualization
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
  },
}));

interface TaskOverviewCardProps {
  taskStats: {
    total: number;
    completed: number;
    percentage: number;
  };
}

const TaskOverviewCard: React.FC<TaskOverviewCardProps> = ({ taskStats }) => {
  const theme = useTheme();
  const navigate = useNavigate();

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

      <List disablePadding>
        <ListItem sx={{ px: 0 }}>
          <ListItemText primary="Total Tasks" secondary={taskStats.total} />
        </ListItem>
        <Divider />
        <ListItem sx={{ px: 0 }}>
          <ListItemText
            primary="Completed Tasks"
            secondary={taskStats.completed}
          />
        </ListItem>
        <Divider />
        <ListItem sx={{ px: 0 }}>
          <ListItemText
            primary="Pending Tasks"
            secondary={taskStats.total - taskStats.completed}
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default TaskOverviewCard;
