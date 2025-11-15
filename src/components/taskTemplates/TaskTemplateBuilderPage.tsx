/**
 * TaskTemplateBuilderPage Component
 * Full-page template builder with task library
 * Replaces the dialog-based approach with a two-panel layout
 */

import React, { useState, useMemo, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "../../localization/LocalizationContext";
import {
  useTaskTemplates,
  useCreateTaskTemplate,
  useUpdateTaskTemplate,
} from "../../hooks/taskTemplates";
import { TaskTemplateItem, TaskTemplate } from "@wedding-plan/types";
import {
  cleanTaskTemplateItem,
  buildTaskLibraryFromTemplates,
  TaskLibraryItem,
} from "../../utils/taskTemplateUtils";
import TaskLibraryPanel from "./TaskLibraryPanel";
import TemplateBuilderPanel from "./TemplateBuilderPanel";
import { TaskTemplateFormData, TaskTemplateFormHandle } from "./TaskTemplateForm";
import ApplyTaskTemplateDialog from "./ApplyTaskTemplateDialog";

const TaskTemplateBuilderPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();
  const isEditMode = !!templateId;

  // Ref to access form data
  const formRef = useRef<TaskTemplateFormHandle>(null);

  // Fetch all templates (for library and for editing)
  const { data: allTemplates = [], isLoading } = useTaskTemplates();

  // Get template being edited
  const templateToEdit = useMemo(() => {
    return isEditMode
      ? allTemplates.find((t) => t.id === templateId)
      : undefined;
  }, [isEditMode, templateId, allTemplates]);

  // Build task library from all templates
  const taskLibrary = useMemo(() => {
    return buildTaskLibraryFromTemplates(allTemplates);
  }, [allTemplates]);

  // Prepare initial data for form
  const initialData = useMemo<Partial<TaskTemplateFormData>>(() => {
    if (isEditMode && templateToEdit) {
      return {
        name: templateToEdit.name,
        description: templateToEdit.description || "",
        tasks: [...templateToEdit.tasks],
      };
    }
    return {
      name: "",
      description: "",
      tasks: [],
    };
  }, [isEditMode, templateToEdit]);

  // State for apply dialog
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState<TaskTemplate | null>(null);

  // Mutations
  const { mutate: createTemplate, isPending: isCreating } =
    useCreateTaskTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } =
    useUpdateTaskTemplate();

  const isSubmitting = isCreating || isUpdating;

  // Handle adding task from library
  const handleAddFromLibrary = (task: TaskLibraryItem) => {
    if (!formRef.current) return;

    // Add task to form via imperative handle
    const newTask: TaskTemplateItem = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      relativeDueDate: task.relativeDueDate,
      relativeDueDateUnit: task.relativeDueDateUnit,
      relativeDueDateDirection: task.relativeDueDateDirection,
    };

    formRef.current.addTask(newTask);
  };

  // Handle save (called from save button)
  const handleSave = async (andApply = false) => {
    if (!formRef.current) return;

    // Validate form first
    const isValid = await formRef.current.validateForm();
    if (!isValid) return;

    // Get form data
    const formData = formRef.current.getFormData();

    // Clean tasks - remove undefined fields
    const cleanedTasks = formData.tasks.map(cleanTaskTemplateItem);

    // Build template data without undefined fields
    const templatePayload: any = {
      name: formData.name.trim(),
      tasks: cleanedTasks,
    };

    // Only add description if it has a value
    if (formData.description.trim()) {
      templatePayload.description = formData.description.trim();
    }

    if (isEditMode && templateToEdit) {
      // Update existing template
      updateTemplate(
        {
          id: templateToEdit.id,
          data: {
            ...templatePayload,
            updatedAt: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            if (andApply) {
              // Use the existing template with updated data
              setSavedTemplate({
                ...templateToEdit,
                ...templatePayload,
                updatedAt: new Date().toISOString(),
              });
              setApplyDialogOpen(true);
            } else {
              navigate("/weddings/task-templates");
            }
          },
        }
      );
    } else {
      // Create new template
      createTemplate(
        { template: templatePayload },
        {
          onSuccess: (templateId) => {
            if (andApply) {
              // Construct the template object
              setSavedTemplate({
                id: templateId as string,
                ...templatePayload,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as TaskTemplate);
              setApplyDialogOpen(true);
            } else {
              navigate("/weddings/task-templates");
            }
          },
        }
      );
    }
  };

  // Handle save and apply
  const handleSaveAndApply = () => {
    handleSave(true);
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/weddings/task-templates");
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>{t("common.loading")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Two-Panel Layout - Fixed Left, Flex Right */}
      <Box sx={{ flexGrow: 1, overflow: "hidden", display: "flex" }}>
        {/* Left Panel - Task Library (Fixed Width) */}
        <Box
          sx={{
            width: 320,
            borderRight: 1,
            borderColor: "divider",
            overflow: "auto",
            flexShrink: 0,
          }}
        >
          <TaskLibraryPanel
            library={taskLibrary}
            onAddTask={handleAddFromLibrary}
          />
        </Box>

        {/* Right Panel - Template Form (Flex Fill) */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <TemplateBuilderPanel
            ref={formRef}
            initialData={initialData}
            onSave={() => handleSave(false)}
            onSaveAndApply={handleSaveAndApply}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </Box>
      </Box>

      {/* Apply Template Dialog */}
      {savedTemplate && (
        <ApplyTaskTemplateDialog
          open={applyDialogOpen}
          onClose={() => {
            setApplyDialogOpen(false);
            setSavedTemplate(null);
            navigate("/weddings/task-templates");
          }}
          template={savedTemplate}
        />
      )}
    </Box>
  );
};

export default TaskTemplateBuilderPage;
