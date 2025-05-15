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
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ pt: 1 }}>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Task Title"
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
              label="Description"
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
              label="Priority"
              name="priority"
              value={editedTask.priority}
              onChange={handleChange}
            >
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </TextField>
          </Grid>

      <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Due Date"
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
              label="Assigned To"
              name="assignedTo"
              value={editedTask.assignedTo || ""}
              onChange={handleChange}
            >
              <MenuItem value="">Unassigned</MenuItem>
              <MenuItem value="Bride">Bride</MenuItem>
              <MenuItem value="Groom">Groom</MenuItem>
              <MenuItem value="Both">Both</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Status</FormLabel>
              <RadioGroup
                row
                value={editedTask.completed.toString()}
                onChange={handleCompletedChange}
              >
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="In Progress"
                />
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Completed"
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
