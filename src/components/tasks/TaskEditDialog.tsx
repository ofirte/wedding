import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import { Task } from "../../hooks/tasks/useTasks";
import { useTranslation } from "../../localization/LocalizationContext";

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
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    setEditedTask(task);
    setTitleError("");
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "title" && value.trim()) {
      setTitleError("");
    }

    setEditedTask({ ...editedTask, [name]: value });
  };

  const handleCompletedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTask({
      ...editedTask,
      completed: e.target.value === "true",
    });
  };

  const handleSave = () => {
    if (!editedTask.title.trim()) {
      setTitleError("Task title is required");
      return;
    }

    onSave(editedTask);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("tasks.editTask")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ pt: 1 }}>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label={t("common.taskTitle")}
              name="title"
              value={editedTask.title}
              onChange={handleChange}
              error={!!titleError}
              helperText={titleError}
              autoFocus
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label={t("common.description")}
              name="description"
              value={editedTask.description || ""}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

         <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              select
              label={t("common.priority")}
              name="priority"
              value={editedTask.priority}
              onChange={handleChange}
            >
              <MenuItem value="High">{t("common.high")}</MenuItem>
              <MenuItem value="Medium">{t("common.medium")}</MenuItem>
              <MenuItem value="Low">{t("common.low")}</MenuItem>
            </TextField>
          </Grid>

      <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label={t("common.dueDate")}
              name="dueDate"
              type="date"
              value={editedTask.dueDate || ""}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              select
              label={t("common.assignedTo")}
              name="assignedTo"
              value={editedTask.assignedTo || ""}
              onChange={handleChange}
            >
              <MenuItem value="">{t("common.unassigned")}</MenuItem>
              <MenuItem value="Bride">{t("common.bride")}</MenuItem>
              <MenuItem value="Groom">{t("common.groom")}</MenuItem>
              <MenuItem value="Both">{t("common.both")}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <FormControl component="fieldset">
              <FormLabel component="legend">{t("common.status")}</FormLabel>
              <RadioGroup
                row
                value={editedTask.completed.toString()}
                onChange={handleCompletedChange}
              >
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label={t("common.inProgress")}
                />
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label={t("common.completed")}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskEditDialog;
