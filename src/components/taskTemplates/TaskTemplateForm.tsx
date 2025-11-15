/**
 * TaskTemplateForm Component
 * Reusable form for creating and editing task templates
 * Uses react-hook-form for state management
 * Uncontrolled component with imperative handle for data access
 */

import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  IconButton,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { useForm, useFieldArray } from "react-hook-form";
import { TaskTemplateItem } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import TaskTemplateListItem from "./TaskTemplateListItem";

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
  disableSave?: boolean;
}

export interface TaskTemplateFormHandle {
  getFormData: () => TaskTemplateFormData;
  validateForm: () => Promise<boolean>;
  addTask: (task: TaskTemplateItem) => void;
  isDirty: () => boolean;
  resetForm: () => void;
}

const TaskTemplateForm = forwardRef<TaskTemplateFormHandle, TaskTemplateFormProps>(
  ({ initialData, onSave, onSaveAndApply, onCancel, isSubmitting = false, disableSave = false }, ref) => {
    const { t } = useTranslation();
    const isTemplateNew = !initialData;
    const {
      register,
      control,
      formState: { errors, isDirty },
      getValues,
      trigger,
      reset,
    } = useForm<TaskTemplateFormData>({
      defaultValues: {
        name: initialData?.name || "",
        description: initialData?.description || "",
        tasks: initialData?.tasks || [],
      },
    });

    // Reset form when initialData changes to ensure isDirty is false on load
    useEffect(() => {
      reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        tasks: initialData?.tasks || [],
      });
    }, [initialData, reset]);

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
      isDirty: () => isDirty,
      resetForm: () => {
        const currentValues = getValues();
        reset(currentValues);
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
          {/* Back Button and Breadcrumbs */}
          {onCancel && (
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={onCancel}
                disabled={isSubmitting}
                size="small"
              >
                <ArrowBackIcon />
              </IconButton>
              <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={onCancel}
                  color="inherit"
                  underline="hover"
                  sx={{ cursor: "pointer" }}
                >
                  {t("taskTemplates.title")}
                </Link>
                <Typography variant="body2" color="text.primary">
                  {getValues("name") || t("taskTemplates.newTemplate")}
                </Typography>
              </Breadcrumbs>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Template Name and Action Buttons */}
            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}>
              <TextField
                sx={{
                  width: "50%",
                }}
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
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                {onSaveAndApply && (
                  <Button
                    onClick={onSaveAndApply}
                    type="button"
                    variant="outlined"
                    disabled={isSubmitting || fields.length === 0 || (!disableSave || isTemplateNew) }
                  >
                    {t("taskTemplates.applyToWedding")}
                  </Button>
                )}
                {onSave && (
                  <Button
                    onClick={onSave}
                    type="button"
                    variant="contained"
                    disabled={isSubmitting || fields.length === 0 || disableSave}
                  >
                    {isSubmitting ? t("common.saving") : t("common.save")}
                  </Button>
                )}
              </Box>
            </Box>
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
            <TaskTemplateListItem
              key={field.id}
              index={index}
              fieldId={field.id}
              isExpanded={expandedPanel === index}
              onAccordionChange={handleAccordionChange(index)}
              onDelete={() => remove(index)}
              control={control}
              register={register}
              errors={errors}
            />
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


      </Box>
    );
  }
);

TaskTemplateForm.displayName = "TaskTemplateForm";

export default TaskTemplateForm;
