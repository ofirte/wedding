import React, { useMemo } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";

import { useTranslation } from "../../../localization/LocalizationContext";
import { Task } from "@wedding-plan/types";
import { useWeddingsDetails } from "src/hooks/wedding";
import { stringToColor } from "src/utils/ColorUtils";
import { isTaskCompleted } from "../../tasks/taskUtils";

interface TaskListProps {
  tasks: (Task & { weddingId: string })[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const { t, language } = useTranslation();
  const { data: weddingsDetails, isLoading: isLoadingWeddings } =
    useWeddingsDetails();

  const dateLocale = useMemo(() => (language === "he" ? he : enUS), [language]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  if (tasks.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          {t("tasksManagement.list.noTasks")}
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {tasks.map((task) => {
        const taskWedding = weddingsDetails?.find(
          (wedding) => wedding.id === task.weddingId
        );
        return (
          <ListItem
            key={task.id}
            sx={{
              bgcolor: "background.paper",
              mb: 1,
              borderRadius: 1,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
            secondaryAction={
              <Box>
                <IconButton edge="end" aria-label="edit" size="small">
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <Checkbox checked={isTaskCompleted(task)} edge="start" />
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      textDecoration: isTaskCompleted(task) ? "line-through" : "none",
                      fontWeight: 500,
                    }}
                  >
                    {task.title}
                  </Typography>
                  {/* Status Badge */}
                  <Chip
                    label={
                      isTaskCompleted(task)
                        ? t("common.completed")
                        : task.assignedTo
                        ? t("common.inProgress")
                        : t("common.unassigned")
                    }
                    size="small"
                    variant={isTaskCompleted(task) ? "filled" : "outlined"}
                    color={
                      isTaskCompleted(task)
                        ? "success"
                        : task.assignedTo
                        ? "primary"
                        : "default"
                    }
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                  {/* Priority Badge */}
                  <Chip
                    label={t(
                      `tasksManagement.priorities.${task.priority.toLowerCase()}`
                    )}
                    size="small"
                    color={getPriorityColor(task.priority)}
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <Chip
                    label={
                      taskWedding?.name || t("tasksManagement.unknownWedding")
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 18,
                      fontSize: "0.65rem",
                      mr: 1,
                      borderColor: stringToColor(taskWedding?.id || ""),
                    }}
                  />
                  {task.dueDate
                    ? format(new Date(task.dueDate), "PPP", {
                        locale: dateLocale,
                      })
                    : t("tasksManagement.noDueDate")}
                  {task.assignedTo &&
                    ` • ${t(`common.${task.assignedTo.toLocaleLowerCase()}`)}`}
                </Typography>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default TaskList;
