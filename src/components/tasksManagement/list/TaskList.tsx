import React from "react";
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

import { useTranslation } from "../../../localization/LocalizationContext";
import { Task } from "@wedding-plan/types";

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const { t } = useTranslation();

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
      {tasks.map((task) => (
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
          <Checkbox checked={task.completed} edge="start" />
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </Typography>
                <Chip
                  label={t(
                    `tasksManagement.priorities.${task.priority.toLowerCase()}`
                  )}
                  size="small"
                  color={getPriorityColor(task.priority)}
                />
              </Box>
            }
            secondary={
              <Typography variant="body2" color="text.secondary">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : t("tasksManagement.noDueDate")}
                {task.assignedTo && ` • ${task.assignedTo}`}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default TaskList;
