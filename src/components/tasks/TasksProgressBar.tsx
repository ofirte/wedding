import { Box, LinearProgress, styled, Typography } from "@mui/material";
import { Task } from "@wedding-plan/types";
import { useTasksStats } from "src/hooks/tasks/useTasksStats";
type TasksProgressBarProps = {
  tasks: Task[];
};
const TasksProgressBar: React.FC<TasksProgressBarProps> = ({ tasks }) => {
    const SingleLineProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== "progressColor",
})<{ progressColor: string }>(({ theme, progressColor }) => ({
  height: 4,
  borderRadius: 2,
  backgroundColor: theme.palette.grey[200],
  width: 180,
  "& .MuiLinearProgress-bar": {
    borderRadius: 2,
    background: progressColor,
  },
}));

  const stats = useTasksStats(tasks);
    // Dynamic progress color based on completion percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) {
      return "linear-gradient(90deg, #6DA97A, #9BBB9B)"; // Success gradient
    } else if (percentage >= 50) {
      return "linear-gradient(90deg, #7A9CB3, #9BBB9B)"; // Info gradient
    } else if (percentage >= 25) {
      return "linear-gradient(90deg, #D4B957, #F0E5B2)"; // Warning gradient
    } else {
      return "linear-gradient(90deg, #C77C58, #E8C9B9)"; // Error gradient
    }
  };
  return (      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,

          flexWrap: "wrap",
        }}
      >
        {/* Progress text + bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              background: `linear-gradient(90deg, ${
                stats.completionPercentage >= 75
                  ? "#6DA97A"
                  : stats.completionPercentage >= 50
                  ? "#7A9CB3"
                  : stats.completionPercentage >= 25
                  ? "#D4B957"
                  : "#C77C58"
              }, ${
                stats.completionPercentage >= 75
                  ? "#9BBB9B"
                  : stats.completionPercentage >= 50
                  ? "#9BBB9B"
                  : stats.completionPercentage >= 25
                  ? "#F0E5B2"
                  : "#E8C9B9"
              })`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ({stats.completionPercentage}%)
          </Typography>
          <SingleLineProgress
            variant="determinate"
            value={stats.completionPercentage}
            progressColor={getProgressColor(stats.completionPercentage)}
          />
        </Box>
      </Box>)};
      
export default TasksProgressBar;