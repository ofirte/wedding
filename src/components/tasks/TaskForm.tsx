import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  InputAdornment,
  Collapse,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as DescriptionIcon,
  Flag as PriorityIcon,
  CalendarToday as DateIcon,
} from "@mui/icons-material";
import { Task } from "../../hooks/tasks/useTasks";

interface TaskFormProps {
  onAddTask: (task: Omit<Task, "id">) => void;
  isSubmitting?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onAddTask,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [titleError, setTitleError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError("Task title is required");
      return;
    }

    const newTask: Omit<Task, "id"> = {
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    if (dueDate) {
      newTask.dueDate = dueDate;
    }

    onAddTask(newTask);

    // Clear form
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setTitleError("");
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: showDetails ? 12 : 8 }}>
          <TextField
            fullWidth
            label="New Task"
            variant="outlined"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError("");
            }}
            error={!!titleError}
            helperText={titleError}
            placeholder="What needs to be done?"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleDetails} edge="end">
                    {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {!showDetails && (
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AddIcon />
                )
              }
              sx={{ height: "56px" }}
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Collapse in={showDetails}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Add more details about this task"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  variant="outlined"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PriorityIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  variant="outlined"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <AddIcon />
                    )
                  }
                  sx={{ height: "56px" }}
                >
                  {isSubmitting ? "Adding..." : "Add Task"}
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskForm;
