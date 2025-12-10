import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
  ToggleButton,
  ToggleButtonGroup,
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
  Celebration as WeddingIcon,
  Assignment as TaskIcon,
} from "@mui/icons-material";
import { Task, ProducerTask, Wedding } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useWeddingMembers } from "../../hooks/wedding";
import { useCurrentUser } from "src/hooks/auth";

type TaskType = "wedding" | "producer";

interface TaskFormData {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  category: string;
  assignedTo: string;
  completed: boolean;
  // Producer context fields
  formTaskType: "wedding" | "producer";
  selectedWeddingId: string;
}

interface TaskFormProps {
  onAddTask: (task: Omit<Task, "id"> | Task, weddingId?: string) => void;
  onAddProducerTask?: (
    task: Omit<ProducerTask, "id" | "producerIds" | "createdBy" | "createdAt">
  ) => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  initialTask?: Partial<Task>;
  onCancel?: () => void;
  context?: "wedding" | "producer"; // Determines form behavior
  weddings?: Wedding[]; // List of producer's weddings (for producer context)
  taskType?: "wedding" | "producer"; // Task type when editing (to differentiate producer tasks)
}

const TaskForm: React.FC<TaskFormProps> = ({
  onAddTask,
  onAddProducerTask,
  isSubmitting = false,
  mode = "create",
  initialTask,
  onCancel,
  context = "wedding",
  weddings = [],
  taskType: taskTypeProp,
}) => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const formRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(mode === "edit");

  // Initialize default values based on mode and context
  const defaultValues: TaskFormData = {
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    category: "",
    assignedTo: "",
    completed: false,
    formTaskType: "wedding",
    selectedWeddingId: "",
  };

  // Setup react-hook-form
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues:
      mode === "edit" && initialTask
        ? {
            ...defaultValues,
            title: initialTask.title || "",
            description: initialTask.description || "",
            priority: (initialTask.priority as "High" | "Medium" | "Low") || "Medium",
            dueDate: initialTask.dueDate || "",
            category: initialTask.category || "",
            assignedTo: initialTask.assignedTo || "",
            completed: initialTask.completed || false,
            formTaskType: taskTypeProp || "wedding",
            selectedWeddingId: "",
          }
        : defaultValues,
  });

  // Watch form values for conditional rendering
  const formTaskType = watch("formTaskType");
  const selectedWeddingId = watch("selectedWeddingId");
  const titleValue = watch("title");

  // Fetch wedding members based on context
  const weddingIdForMembers =
    context === "producer" && formTaskType === "wedding"
      ? selectedWeddingId
      : undefined;
  const { data: weddingMembers = [] } = useWeddingMembers(weddingIdForMembers);

  // Determine what to show
  const showTaskTypeToggle = context === "producer" && mode === "create";
  const showWeddingSelector =
    context === "producer" && formTaskType === "wedding" && mode === "create";
  const isEditingProducerTask = mode === "edit" && taskTypeProp === "producer";
  const showAssignTo =
    !isEditingProducerTask &&
    (context === "wedding" ||
      (context === "producer" && formTaskType === "wedding"));

  // Auto-expand on typing
  useEffect(() => {
    if (mode === "create" && titleValue?.trim()) {
      setShowDetails(true);
    }
  }, [titleValue, mode]);

  // Click outside detection (only in create mode)
  useEffect(() => {
    if (mode === "create") {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const isInMuiPopover = (target as Element).closest?.(
          '[role="presentation"], .MuiPopover-root, .MuiMenu-root'
        );

        if (
          formRef.current &&
          !formRef.current.contains(target) &&
          !isInMuiPopover &&
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

  // Reset assignedTo when wedding changes in producer context
  useEffect(() => {
    if (context === "producer" && formTaskType === "wedding") {
      setValue("assignedTo", "");
    }
  }, [selectedWeddingId, context, formTaskType, setValue]);

  // Set assignedTo to current user for producer tasks
  useEffect(() => {
    if (formTaskType === "producer" && currentUser?.id) {
      setValue("assignedTo", currentUser.id);
    }
  }, [formTaskType, currentUser, setValue]);

  const onSubmit = (data: TaskFormData) => {
    if (mode === "edit") {
      // Edit mode: return updated task with existing id
      const updatedTask: Task = {
        ...(initialTask as Task),
        title: data.title.trim(),
        description: data.description.trim(),
        priority: data.priority,
        completed: data.completed,
        dueDate: data.dueDate || undefined,
        category: data.category || undefined,
        assignedTo: data.assignedTo || undefined,
      };
      onAddTask(updatedTask);
    } else {
      // Create mode
      if (context === "producer" && data.formTaskType === "producer") {
        // Create producer task (automatically assigned to current user via producerIds)
        if (onAddProducerTask) {
          onAddProducerTask({
            title: data.title.trim(),
            description: data.description.trim(),
            priority: data.priority,
            completed: false,
            dueDate: data.dueDate || undefined,
            category: data.category || undefined,
          });
        }
      } else {
        // Create wedding task
        const newTask: Omit<Task, "id"> = {
          title: data.title.trim(),
          description: data.description.trim(),
          priority: data.priority,
          completed: false,
          createdAt: new Date().toISOString(),
          dueDate: data.dueDate || undefined,
          category: data.category || undefined,
          assignedTo: data.assignedTo || undefined,
        };

        // In producer context, pass the selected wedding ID
        const weddingId =
          context === "producer" ? data.selectedWeddingId : undefined;
        onAddTask(newTask, weddingId);
      }

      // Clear form only in create mode
      reset(defaultValues);
      setShowDetails(false);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Box
      ref={formRef}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: "100%" }}
    >
      <Grid container spacing={2}>
        {/* Task Type Toggle - only in producer context */}
        {showTaskTypeToggle && (
          <Grid size={{ xs: 12 }}>
            <Controller
              name="formTaskType"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  value={field.value}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      field.onChange(newValue);
                    }
                  }}
                  aria-label={t("tasksManagement.taskType")}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <ToggleButton value="wedding" aria-label="wedding task">
                    <WeddingIcon sx={{ mr: 1 }} />
                    {t("tasksManagement.weddingTask")}
                  </ToggleButton>
                  <ToggleButton value="producer" aria-label="producer task">
                    <TaskIcon sx={{ mr: 1 }} />
                    {t("tasksManagement.producerTask")}
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            />
          </Grid>
        )}

        {/* Wedding Selector - only for wedding tasks in producer context */}
        {showWeddingSelector && (
          <Grid size={{ xs: 12 }}>
            <Controller
              name="selectedWeddingId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label={t("tasksManagement.selectWedding")}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WeddingIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">
                    <em>{t("tasksManagement.selectWedding")}</em>
                  </MenuItem>
                  {weddings.map((wedding) => (
                    <MenuItem key={wedding.id} value={wedding.id}>
                      {wedding.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", pt: 1 }}>
            <Controller
              name="title"
              control={control}
              rules={{ required: t("common.taskTitleRequired") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t("common.newTask")}
                  variant="outlined"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  placeholder={t("placeholders.whatNeedsToBeDone")}
                />
              )}
            />
            {mode === "create" && (
              <IconButton
                onClick={toggleDetails}
                sx={{ mt: 1 }}
                aria-label={
                  showDetails ? t("common.collapse") : t("common.expand")
                }
              >
                {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Collapse in={showDetails} timeout={mode === "edit" ? 0 : undefined}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("common.description")}
                      variant="outlined"
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
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label={t("common.priority")}
                      variant="outlined"
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
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("common.dueDate")}
                      type="date"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("common.category")}
                      variant="outlined"
                      placeholder={t("placeholders.categoryExample")}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CategoryIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Assign To - only shown for wedding tasks */}
              {showAssignTo && (
                <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                  <Controller
                    name="assignedTo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label={t("common.assignTo")}
                        variant="outlined"
                        disabled={
                          context === "producer" &&
                          formTaskType === "wedding" &&
                          !selectedWeddingId
                        }
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
                    )}
                  />
                </Grid>
              )}

              {mode === "edit" && (
                <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                  <Controller
                    name="completed"
                    control={control}
                    render={({ field }) => (
                      <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend">
                          {t("common.status")}
                        </FormLabel>
                        <RadioGroup
                          row
                          value={field.value.toString()}
                          onChange={(e) =>
                            field.onChange(e.target.value === "true")
                          }
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
                    )}
                  />
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
                    disabled={
                      isSubmitting ||
                      (context === "producer" &&
                        formTaskType === "wedding" &&
                        !selectedWeddingId &&
                        mode === "create")
                    }
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
