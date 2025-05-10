import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Checkbox,
  Paper,
  TextField,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  MoreVert as MoreIcon,
  Flag as PriorityIcon,
  CalendarToday as DateIcon,
} from "@mui/icons-material";
import TaskEditDialog from "./TaskEditDialog";
import { Task } from "../../hooks/tasks/useTasks";

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, task: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAssignTask: (id: string, person: string) => void;
  onCompleteTask: (id: string, completed: boolean) => void;
}

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

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onAssignTask,
  onCompleteTask,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    taskId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setCurrentTaskId(taskId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentTaskId(null);
  };

  const handleAssign = (person: string) => {
    if (currentTaskId) {
      onAssignTask(currentTaskId, person);
      handleMenuClose();
    }
  };

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (currentTaskId) {
      onDeleteTask(currentTaskId);
      handleMenuClose();
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setTaskToEdit(null);
  };

  const handleEditDialogSave = (editedTask: Task) => {
    if (editedTask.id) {
      onUpdateTask(editedTask.id, editedTask);
      setEditDialogOpen(false);
      setTaskToEdit(null);
    }
  };

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    onCompleteTask(taskId, !completed);
  };

  const filteredTasks = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!a.assignedTo && b.assignedTo) return -1;
      if (a.assignedTo && !b.assignedTo) return 1;
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;
      return 0;
    });

  if (filteredTasks.length === 0) {
    return (
      <Box>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? "No matching tasks found" : "No tasks available"}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <List>
        {filteredTasks.map((task) => (
          <ListItem
            key={task.id}
            sx={{
              mb: 1,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: task.completed
                ? "rgba(0, 0, 0, 0.04)"
                : "background.paper",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ListItemIcon>
              <Checkbox
                checked={task.completed}
                onChange={() => handleToggleComplete(task.id, task.completed)}
                sx={{
                  "&.Mui-checked": {
                    color: "success.main",
                  },
                }}
              />
            </ListItemIcon>

            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "medium",
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "text.secondary" : "text.primary",
                  }}
                >
                  {task.title}
                </Typography>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  {task.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {task.description}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Chip
                      size="small"
                      label={`Priority: ${task.priority}`}
                      color={getPriorityColor(task.priority)}
                      icon={<PriorityIcon />}
                    />
                    {task.dueDate && (
                      <Chip
                        size="small"
                        label={`Due: ${new Date(
                          task.dueDate
                        ).toLocaleDateString()}`}
                        icon={<DateIcon />}
                        variant="outlined"
                      />
                    )}
                    {task.assignedTo && (
                      <Chip
                        size="small"
                        label={`Assigned: ${task.assignedTo}`}
                        icon={<PersonIcon />}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              }
            />

            <ListItemSecondaryAction>
              <Box sx={{ display: "flex" }}>
                <Tooltip title="Edit task">
                  <IconButton edge="end" onClick={() => handleEdit(task)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <IconButton
                  edge="end"
                  onClick={(e) => handleMenuClick(e, task.id)}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAssign("Bride")}>
          Assign to Bride
        </MenuItem>
        <MenuItem onClick={() => handleAssign("Groom")}>
          Assign to Groom
        </MenuItem>
        <MenuItem onClick={() => handleAssign("Both")}>Assign to Both</MenuItem>
        <MenuItem onClick={() => handleAssign("")}>Unassign</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {taskToEdit && (
        <TaskEditDialog
          open={editDialogOpen}
          task={taskToEdit}
          onClose={handleEditDialogClose}
          onSave={handleEditDialogSave}
        />
      )}
    </Box>
  );
};

export default TaskList;
