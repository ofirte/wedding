import React, { useState } from "react";
import { Box, List, Typography, Paper } from "@mui/material";
import { Task } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useWeddingMembers } from "../../hooks/wedding";
import { TaskListItem } from "./TaskListItem";
import { TaskActionsMenu } from "./TaskActionsMenu";
import TaskEditDialog from "./TaskEditDialog";
import { sortTasks } from "./taskUtils";

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, task: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAssignTask: (id: string, person: string) => void;
  onCompleteTask: (id: string, completed: boolean) => void;
}

/**
 * TaskList Component
 *
 * Orchestrates the display and management of wedding tasks:
 * 1. Fetches wedding members for assignment
 * 2. Manages state for menu, edit dialog, and expanded items
 * 3. Handles user actions (assign, delete, edit, complete, expand)
 * 4. Renders sorted task items with empty state
 */
const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onAssignTask,
  onCompleteTask,
}) => {
  const { t } = useTranslation();
  const { data: weddingMembers = [] } = useWeddingMembers();

  // State management
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Menu handlers
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

  const handleAssign = (userId: string) => {
    if (currentTaskId) {
      onAssignTask(currentTaskId, userId);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (currentTaskId) {
      onDeleteTask(currentTaskId);
      handleMenuClose();
    }
  };

  // Edit dialog handlers
  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setEditDialogOpen(true);
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

  // Task interaction handlers
  const handleToggleComplete = (taskId: string, completed: boolean) => {
    onCompleteTask(taskId, !completed);
  };

  const handleToggleExpand = (taskId: string, hasDescription: boolean) => {
    if (!hasDescription) return;
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  // Sort tasks for display
  const sortedTasks = sortTasks(tasks);

  if (sortedTasks.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 2,
          background: "linear-gradient(135deg, rgba(155, 187, 155, 0.05) 0%, rgba(122, 156, 179, 0.05) 100%)",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {t("tasks.allCaughtUp")}
        </Typography>
      </Paper>
    );
  }

  // Render the task list
  return (
    <Box>
      <List sx={{ p: 0 }}>
        {sortedTasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            isExpanded={expandedTaskId === task.id}
            onToggleExpand={handleToggleExpand}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEdit}
            onMenuClick={handleMenuClick}
          />
        ))}
      </List>

      <TaskActionsMenu
        anchorEl={anchorEl}
        currentTaskId={currentTaskId}
        tasks={tasks}
        weddingMembers={weddingMembers}
        onClose={handleMenuClose}
        onAssign={handleAssign}
        onDelete={handleDelete}
      />

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
