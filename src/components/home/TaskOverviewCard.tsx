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
  Chip,
} from "@mui/material";
import {
  ArrowForward as ArrowIcon,
  CheckCircleOutline as CheckIcon,
  RadioButtonUnchecked as UncheckIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import useTasks from "../../hooks/tasks/useTasks";
import { Task } from "@wedding-plan/types";
import { useCompleteTask } from "../../hooks/tasks/useCompleteTask";
import { useTranslation } from "../../localization/LocalizationContext";
import { isTaskCompleted } from "../tasks/taskUtils";

// Styled LinearProgress for better visualization
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
  },
}));

// Priority weights for scoring
const PRIORITY_WEIGHTS = {
  High: 10,
  Medium: 5,
  Low: 2,
};

// Function to get priority color
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "default";
  }
};

// Enhanced styled components for better UI
const TaskCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: "all 0.2s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[2],
    borderColor: theme.palette.primary.main,
  },
}));

const PriorityChip = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: "0.65rem",
  fontWeight: 600,
  "& .MuiChip-label": {
    paddingLeft: 6,
    paddingRight: 6,
  },
}));

const DateChip = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: "0.65rem",
  "& .MuiChip-label": {
    paddingLeft: 6,
    paddingRight: 6,
  },
}));

const calculateTaskImportance = (task: Task): number => {
  if (isTaskCompleted(task)) return 0;

  let score =
    PRIORITY_WEIGHTS[task.priority as keyof typeof PRIORITY_WEIGHTS] || 0;

  if (task.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    if (dayDiff < 0) {
      // Overdue tasks get highest priority
      score += 20 + Math.abs(dayDiff);
    } else if (dayDiff <= 3) {
      // Due within 3 days
      score += 15 - dayDiff * 2;
    } else if (dayDiff <= 7) {
      // Due within a week
      score += 8 - dayDiff;
    }
  }

  return score;
};

// Function to get most important tasks
const getMostImportantTasks = (tasks: Task[], limit: number = 4): Task[] => {
  return tasks
    .filter((task) => !isTaskCompleted(task))
    .map((task) => ({ ...task, importance: calculateTaskImportance(task) }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, limit)
    .map(({ importance, ...task }) => task);
};

const TaskOverviewCard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: tasks } = useTasks();
  const { mutateAsync: completeTask } = useCompleteTask();

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await completeTask(taskId, completed);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((task) => isTaskCompleted(task)).length ?? 0;
  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressTasks =
    tasks?.filter((task) => !!task.assignedTo).length ?? 0;
  const pendingTasks = totalTasks - completedTasks - inProgressTasks;

  // Get most important tasks
  const mostImportantTasks = getMostImportantTasks(tasks || [], 4);

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
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: "1.1rem",
          }}
        >
          {t("tasks.taskProgress")}
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowIcon />}
          onClick={() => navigate("../tasks")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 2,
          }}
        >
          {t("common.details")}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {t("tasks.tasksCompletedCount", {
              completed: taskStats.completed,
              total: taskStats.total,
            })}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color:
                taskStats.percentage === 100 ? "success.main" : "primary.main",
            }}
          >
            {taskStats.percentage}%
          </Typography>
        </Box>
        <StyledLinearProgress
          variant="determinate"
          value={taskStats.percentage}
          color="primary"
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background:
                taskStats.percentage === 100
                  ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                  : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      {/* Most Important Tasks Section */}
      <Box>
        {mostImportantTasks.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 3,
              bgcolor: "success.50",
              borderRadius: 2,
              border: `1px solid ${theme.palette.success.light}`,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "success.dark",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              🎉 {t("tasks.allCaughtUp")}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {mostImportantTasks.map((task) => {
              const isOverdue =
                task.dueDate && new Date(task.dueDate) < new Date();
              const isDueSoon =
                task.dueDate &&
                new Date(task.dueDate).getTime() - new Date().getTime() <=
                  3 * 24 * 60 * 60 * 1000;

              return (
                <TaskCard
                  key={task.id}
                  sx={{
                    borderColor: isOverdue
                      ? theme.palette.error.light
                      : isDueSoon
                      ? theme.palette.warning.light
                      : theme.palette.divider,
                    bgcolor: isOverdue
                      ? `${theme.palette.error.main}08`
                      : isDueSoon
                      ? `${theme.palette.warning.main}08`
                      : theme.palette.background.paper,
                    "&:hover": {
                      borderColor: isOverdue
                        ? theme.palette.error.main
                        : isDueSoon
                        ? theme.palette.warning.main
                        : theme.palette.primary.main,
                      bgcolor: isOverdue
                        ? `${theme.palette.error.main}12`
                        : isDueSoon
                        ? `${theme.palette.warning.main}12`
                        : `${theme.palette.primary.main}04`,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {/* Completion Checkbox */}
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskComplete(task.id, !isTaskCompleted(task));
                      }}
                      sx={{
                        cursor: "pointer",
                        color: isTaskCompleted(task)
                          ? "success.main"
                          : "text.disabled",
                        transition: "color 0.2s ease",
                        "&:hover": {
                          color: isTaskCompleted(task)
                            ? "success.dark"
                            : "primary.main",
                        },
                      }}
                    >
                      {isTaskCompleted(task) ? (
                        <CheckIcon fontSize="small" />
                      ) : (
                        <UncheckIcon fontSize="small" />
                      )}
                    </Box>

                    {/* Task Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isOverdue
                            ? theme.palette.error.dark
                            : isDueSoon
                            ? theme.palette.warning.dark
                            : theme.palette.text.primary,
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textDecoration: isTaskCompleted(task)
                            ? "line-through"
                            : "none",
                          opacity: isTaskCompleted(task) ? 0.6 : 1,
                        }}
                      >
                        {task.title}
                      </Typography>
                    </Box>

                    {/* Priority and Date Chips */}
                    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                      <PriorityChip
                        label={t(`common.${task.priority.toLowerCase()}`)}
                        color={getPriorityColor(task.priority)}
                        size="small"
                      />
                      {task.dueDate && (
                        <DateChip
                          label={new Date(task.dueDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                            }
                          )}
                          variant="outlined"
                          color={
                            isOverdue
                              ? "error"
                              : isDueSoon
                              ? "warning"
                              : "default"
                          }
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                </TaskCard>
              );
            })}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default TaskOverviewCard;
