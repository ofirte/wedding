import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { DisplayTask } from "./TaskInlineColumns";

interface TaskDescriptionDialogProps {
  task: DisplayTask | null;
  open: boolean;
  onClose: () => void;
  onSave: (taskId: string, description: string) => Promise<void>;
}

const TaskDescriptionDialog: React.FC<TaskDescriptionDialogProps> = ({
  task,
  open,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset content when task changes or dialog opens
  useEffect(() => {
    if (task && open) {
      setDescription(task.description || "");
    }
  }, [task, open]);

  const handleSave = async () => {
    if (!task) return;

    setIsSaving(true);
    try {
      await onSave(task.id, description);
      onClose();
    } catch (error) {
      console.error("Error saving description:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = description !== (task?.description || "");

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">{t("common.description")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {task.title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("tasks.descriptionPlaceholder")}
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDescriptionDialog;
