import React, { useState, useMemo } from "react";
import { Box, List, Typography, Paper } from "@mui/material";
import { Task } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useWeddingMembers } from "../../hooks/wedding";
import { useWeddingsDetails } from "../../hooks/wedding/useWeddingsDetails";
import { useUsersByIds } from "../../hooks/auth/useUsersByIds";
import { TaskListItem } from "./TaskListItem";
import { TaskActionsMenu } from "./TaskActionsMenu";
import TaskEditDialog from "./TaskEditDialog";
import { sortTasks } from "./taskUtils";

// Extended task type that includes producer tasks for unified display
export interface DisplayTask extends Task {
  taskType?: "wedding" | "producer";
  weddingId?: string;
}

interface TaskListProps {
  tasks: DisplayTask[];
  // Unified callbacks - parent handles routing based on task.taskType
  onUpdate: (task: DisplayTask, data: Partial<Task>) => void;
  onDelete: (task: DisplayTask) => void;
  onAssign: (task: DisplayTask, userId: string) => void;
  onComplete: (task: DisplayTask, completed: boolean) => void;
  weddingMembers?: any[]; // Optional: pass wedding members for assignment menu
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
  onUpdate,
  onDelete,
  onAssign,
  onComplete,
  weddingMembers: providedWeddingMembers,
}) => {
  const { t } = useTranslation();
  // For single-wedding context (backward compatibility)
  const { data: fetchedWeddingMembers = [] } = useWeddingMembers();
  // Extract unique weddingIds from tasks for multi-wedding context
  const uniqueWeddingIds = useMemo(() => {
    const ids = tasks
      .map(task => task.weddingId)
      .filter((id): id is string => Boolean(id));
    return Array.from(new Set(ids));
  }, [tasks]);

  // Fetch all weddings for multi-wedding context
  const { data: weddings = [] } = useWeddingsDetails(
    uniqueWeddingIds.length > 0 ? uniqueWeddingIds : undefined
  );

  // Extract unique user IDs from all wedding members for multi-wedding context
  const uniqueUserIds = useMemo(() => {
    const ids = new Set<string>();
    weddings.forEach(wedding => {
      if (wedding.members) {
        Object.keys(wedding.members).forEach(userId => ids.add(userId));
      }
    });
    return Array.from(ids);
  }, [weddings]);

  // Fetch user details for all members across all weddings
  const { data: usersDetails = [] } = useUsersByIds(uniqueUserIds);

  // Build a map of weddingId -> members for multi-wedding context
  const weddingMembersMap = useMemo(() => {
    const map = new Map<string, typeof fetchedWeddingMembers>();

    weddings.forEach(wedding => {
      if (wedding.id && wedding.members) {
        // Convert wedding members to the same format as useWeddingMembers returns
        const members = Object.entries(wedding.members).map(([userId, memberData]) => {
          const userInfo = usersDetails.find(u => u.uid === userId);
          return {
            userId,
            role: (memberData as any).role || memberData,
            displayName: userInfo?.displayName || userInfo?.email || userId,
            email: userInfo?.email || userId,
            addedAt: (memberData as any).addedAt || new Date().toISOString(),
            addedBy: (memberData as any).addedBy || '',
          };
        });
        map.set(wedding.id, members as any);
      }
    });

    return map;
  }, [weddings, usersDetails]);

  // Use provided wedding members if available, otherwise use fetched members
  const weddingMembers = providedWeddingMembers || fetchedWeddingMembers;

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
      const task = tasks.find(t => t.id === currentTaskId);
      if (task) {
        onAssign(task, userId);
      }
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (currentTaskId) {
      const task = tasks.find(t => t.id === currentTaskId);
      if (task) {
        onDelete(task);
      }
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
      const task = tasks.find(t => t.id === editedTask.id);
      if (task) {
        onUpdate(task, editedTask);
      }
      setEditDialogOpen(false);
      setTaskToEdit(null);
    }
  };

  // Task interaction handlers
  const handleToggleComplete = (taskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onComplete(task, !completed);
    }
  };

  const handleToggleExpand = (taskId: string, hasDescription: boolean) => {
    if (!hasDescription) return;
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };
    // Get current task and its wedding-specific members
  const currentTask = tasks.find(t => t.id === currentTaskId);
  const currentTaskWeddingMembers = useMemo(() => {
    if (!currentTask?.weddingId) {
      // Fall back to default wedding members for single-wedding context
      return weddingMembers;
    }
    // Get members for the current task's wedding
    return weddingMembersMap.get(currentTask.weddingId) || [];
  }, [currentTask, weddingMembers, weddingMembersMap]);

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
        weddingMembers={currentTaskWeddingMembers}
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
