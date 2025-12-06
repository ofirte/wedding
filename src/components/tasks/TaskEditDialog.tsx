import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Task } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import TaskForm from "./TaskForm";

interface TaskEditDialogProps {
  open: boolean;
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  open,
  task,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  const handleSave = (updatedTask: Omit<Task, "id"> | Task) => {
    onSave(updatedTask as Task);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("tasks.editTask")}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TaskForm
          mode="edit"
          initialTask={task}
          taskType={(task as any).taskType}
          onAddTask={handleSave}
          onCancel={onClose}
          isSubmitting={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
