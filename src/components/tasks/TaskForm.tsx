import React, { useState, useRef, useEffect } from "react";
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
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as DescriptionIcon,
  Flag as PriorityIcon,
  CalendarToday as DateIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Task } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useWeddingMembers } from "../../hooks/wedding";

interface TaskFormProps {
  onAddTask: (task: Omit<Task, "id"> | Task) => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  initialTask?: Partial<Task>;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onAddTask,
  isSubmitting = false,
  mode = "create",
  initialTask,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [priority, setPriority] = useState(initialTask?.priority || "Medium");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || "");
  const [category, setCategory] = useState(initialTask?.category || "");
  const [assignedTo, setAssignedTo] = useState(initialTask?.assignedTo || "");
  const [completed, setCompleted] = useState(initialTask?.completed || false);
  const [showDetails, setShowDetails] = useState(mode === "edit");
  const [titleError, setTitleError] = useState("");
  const { t } = useTranslation();
  const { data: weddingMembers = [] } = useWeddingMembers();
  const formRef = useRef<HTMLDivElement>(null);

  // Update form fields when initialTask changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && initialTask) {
      setTitle(initialTask.title || "");
      setDescription(initialTask.description || "");
      setPriority(initialTask.priority || "Medium");
      setDueDate(initialTask.dueDate || "");
      setCategory(initialTask.category || "");
      setAssignedTo(initialTask.assignedTo || "");
      setCompleted(initialTask.completed || false);
      setTitleError("");
    }
  }, [mode, initialTask]);

  // Click outside detection (only in create mode)
  useEffect(() => {
    if (mode === "create") {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          formRef.current &&
          !formRef.current.contains(event.target as Node) &&
          showDetails
        ) {
          setShowDetails(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDetails, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError(t("common.taskTitleRequired"));
      return;
    }

    if (mode === "edit") {
      // Edit mode: return updated task with existing id
      const updatedTask: Task = {
        ...(initialTask as Task),
        title: title.trim(),
        description: description.trim(),
        priority,
        completed,
        dueDate: dueDate || undefined,
        category: category || undefined,
        assignedTo: assignedTo || undefined,
      };
      onAddTask(updatedTask);
    } else {
      // Create mode: return new task without id
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

      if (category) {
        newTask.category = category;
      }

      if (assignedTo) {
        newTask.assignedTo = assignedTo;
      }

      onAddTask(newTask);

      // Clear form only in create mode
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
      setCategory("");
      setAssignedTo("");
      setTitleError("");
      setShowDetails(false); // Auto-collapse after adding task
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Box
      ref={formRef}
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: "100%" }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label={t("common.newTask")}
            variant="outlined"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) {
                setTitleError("");
                setShowDetails(true); // Auto-expand on typing
              }
            }}
            error={!!titleError}
            helperText={titleError}
            placeholder={t("placeholders.whatNeedsToBeDone")}
            InputProps={
              mode === "create"
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleDetails} edge="end">
                          {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                : undefined
            }
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Collapse in={showDetails} timeout={mode === "edit" ? 0 : undefined}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={t("common.description")}
                  variant="outlined"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder={t("common.addMoreDetails")}
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
                  label={t("common.priority")}
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
                  <MenuItem value="High">{t("common.high")}</MenuItem>
                  <MenuItem value="Medium">{t("common.medium")}</MenuItem>
                  <MenuItem value="Low">{t("common.low")}</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("common.dueDate")}
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
                <TextField
                  fullWidth
                  label={t("common.category")}
                  variant="outlined"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t("placeholders.categoryExample")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label={t("common.assignTo")}
                  variant="outlined"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">
                    <em>{t("common.unassigned")}</em>
                  </MenuItem>
                  {weddingMembers.map((member) => (
                    <MenuItem key={member.userId} value={member.userId}>
                      {member.displayName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {mode === "edit" && (
                <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend">{t("common.status")}</FormLabel>
                    <RadioGroup
                      row
                      value={completed.toString()}
                      onChange={(e) => setCompleted(e.target.value === "true")}
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
              )}

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  {mode === "edit" && onCancel && (
                    <Button
                      onClick={onCancel}
                      variant="outlined"
                      fullWidth
                      disabled={isSubmitting}
                      sx={{ height: "56px" }}
                    >
                      {t("common.cancel")}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : mode === "edit" ? undefined : (
                        <AddIcon />
                      )
                    }
                    sx={{ height: "56px" }}
                  >
                    {isSubmitting
                      ? mode === "edit"
                        ? t("common.save")
                        : t("common.adding")
                      : mode === "edit"
                      ? t("common.save")
                      : t("common.addTask")}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskForm;
