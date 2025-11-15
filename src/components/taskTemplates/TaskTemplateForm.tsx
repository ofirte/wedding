/**
 * TaskTemplateForm Component
 * Reusable form for creating and editing task templates
 * Uses react-hook-form for state management
 * Uncontrolled component with imperative handle for data access
 */

import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
  MenuItem,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { TaskTemplateItem } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import RelativeDatePicker from "./RelativeDatePicker";

export interface TaskTemplateFormData {
  name: string;
  description: string;
  tasks: TaskTemplateItem[];
}

export interface TaskTemplateFormProps {
  initialData?: Partial<TaskTemplateFormData>;
  onSave?: () => void;
  onSaveAndApply?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export interface TaskTemplateFormHandle {
  getFormData: () => TaskTemplateFormData;
  validateForm: () => Promise<boolean>;
  addTask: (task: TaskTemplateItem) => void;
}

const TaskTemplateForm = forwardRef<TaskTemplateFormHandle, TaskTemplateFormProps>(
  ({ initialData, onSave, onSaveAndApply, onCancel, isSubmitting = false }, ref) => {
    const { t } = useTranslation();

    const {
      register,
      control,
      formState: { errors },
      getValues,
      trigger,
    } = useForm<TaskTemplateFormData>({
      defaultValues: {
        name: initialData?.name || "",
        description: initialData?.description || "",
        tasks: initialData?.tasks || [],
      },
    });

    const { fields, append, remove } = useFieldArray({
      control,
      name: "tasks",
    });

    // Track expanded accordion panels
    const [expandedPanel, setExpandedPanel] = useState<number | null>(null);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      getFormData: () => getValues(),
      validateForm: async () => {
        return await trigger();
      },
      addTask: (task: TaskTemplateItem) => {
        append(task);
        // Expand the newly added task
        setExpandedPanel(fields.length);
      },
    }));

    const handleAddTask = () => {
      const newTask: TaskTemplateItem = {
        title: "",
        description: "",
        priority: "Medium",
        category: "",
      };
      append(newTask);
      // Expand the newly added task
      setExpandedPanel(fields.length);
    };

    const handleAccordionChange =
      (index: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedPanel(isExpanded ? index : null);
      };

    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Fixed Header - Template Fields */}
        <Box sx={{ flexShrink: 0, px: 0, pt: 1, pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Template Name */}
            <TextField
              fullWidth
              label={t("taskTemplates.templateName")}
              {...register("name", {
                required: t("taskTemplates.nameRequired"),
                validate: (value) =>
                  value.trim().length > 0 || t("taskTemplates.nameRequired"),
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
              required
            />

            {/* Template Description */}
            <TextField
              fullWidth
              label={t("taskTemplates.description")}
              {...register("description")}
              multiline
              rows={2}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Scrollable Tasks Section */}
        <Box sx={{ flexGrow: 1, overflow: "auto", mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">{t("taskTemplates.tasks")}</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddTask}
              variant="outlined"
              size="small"
              type="button"
            >
              {t("taskTemplates.addTask")}
            </Button>
          </Box>

          {errors.tasks && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {errors.tasks.message}
            </Typography>
          )}

          {/* Task List */}
          {fields.map((field, index) => (
            <Accordion
              key={field.id}
              expanded={expandedPanel === index}
              onChange={handleAccordionChange(index)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <DragIcon color="disabled" />
                  <Controller
                    name={`tasks.${index}.title`}
                    control={control}
                    render={({ field }) => (
                      <Typography>
                        {field.value || t("taskTemplates.untitledTask")} ({index + 1})
                      </Typography>
                    )}
                  />
                  <Box sx={{ ml: "auto" }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(index);
                      }}
                      color="error"
                      type="button"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Task Title */}
                  <TextField
                    fullWidth
                    size="small"
                    label={t("common.title")}
                    {...register(`tasks.${index}.title`, {
                      required: t("taskTemplates.allTasksMustHaveTitles"),
                      validate: (value) =>
                        value.trim().length > 0 ||
                        t("taskTemplates.allTasksMustHaveTitles"),
                    })}
                    error={!!errors.tasks?.[index]?.title}
                    helperText={errors.tasks?.[index]?.title?.message}
                    required
                  />

                  {/* Task Description */}
                  <TextField
                    fullWidth
                    size="small"
                    label={t("common.description")}
                    {...register(`tasks.${index}.description`)}
                    multiline
                    rows={2}
                  />

                  {/* Priority */}
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label={t("common.priority")}
                    {...register(`tasks.${index}.priority`)}
                  >
                    <MenuItem value="Low">{t("common.low")}</MenuItem>
                    <MenuItem value="Medium">{t("common.medium")}</MenuItem>
                    <MenuItem value="High">{t("common.high")}</MenuItem>
                  </TextField>

                  {/* Category */}
                  <TextField
                    fullWidth
                    size="small"
                    label={t("common.category")}
                    {...register(`tasks.${index}.category`)}
                  />

                  {/* Relative Due Date */}
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {t("taskTemplates.relativeDueDate")}
                    </Typography>
                    <Controller
                      name={`tasks.${index}.relativeDueDate`}
                      control={control}
                      render={({ field: amountField }) => (
                        <Controller
                          name={`tasks.${index}.relativeDueDateUnit`}
                          control={control}
                          render={({ field: unitField }) => (
                            <Controller
                              name={`tasks.${index}.relativeDueDateDirection`}
                              control={control}
                              render={({ field: directionField }) => (
                                <RelativeDatePicker
                                  amount={amountField.value}
                                  unit={unitField.value}
                                  direction={directionField.value}
                                  onAmountChange={amountField.onChange}
                                  onUnitChange={unitField.onChange}
                                  onDirectionChange={directionField.onChange}
                                />
                              )}
                            />
                          )}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          {fields.length === 0 && (
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: "action.hover",
              }}
            >
              <Typography color="text.secondary">
                {t("taskTemplates.noTasksYet")}
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddTask}
                sx={{ mt: 2 }}
                type="button"
              >
                {t("taskTemplates.addFirstTask")}
              </Button>
            </Paper>
          )}
        </Box>

        {/* Fixed Footer - Form Actions */}
        <Box
          sx={{
            flexShrink: 0,
            pt: 3,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            {onCancel && (
              <Button onClick={onCancel} disabled={isSubmitting} type="button">
                {t("common.cancel")}
              </Button>
            )}
            {onSaveAndApply && (
              <Button
                onClick={onSaveAndApply}
                type="button"
                variant="outlined"
                disabled={isSubmitting || fields.length === 0}
              >
                {t("taskTemplates.applyToWedding")}
              </Button>
            )}
            {onSave && (
              <Button
                onClick={onSave}
                type="button"
                variant="contained"
                disabled={isSubmitting || fields.length === 0}
              >
                {isSubmitting ? t("common.saving") : t("common.save")}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );
  }
);

TaskTemplateForm.displayName = "TaskTemplateForm";

export default TaskTemplateForm;
