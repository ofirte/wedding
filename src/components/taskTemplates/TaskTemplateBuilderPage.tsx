/**
 * TaskTemplateBuilderPage Component
 * Refactored template builder with inline table for tasks
 * Single-panel layout with task library modal
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  TextField,
  Paper,
  Breadcrumbs,
  Link,
  Container,
} from "@mui/material";
import { LibraryBooks as LibraryBooksIcon } from "@mui/icons-material";
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
import DSInlineTable from "../common/DSInlineTable";
import {
  createTemplateTaskColumns,
  DisplayTemplateTask,
} from "./TemplateTaskColumns";
import TaskLibraryModal from "./TaskLibraryModal";
import RelativeDatePopover, { RelativeDateValue } from "./RelativeDatePopover";
import ApplyTaskTemplateDialog from "./ApplyTaskTemplateDialog";

// Generate unique local ID for tasks
let taskIdCounter = 0;
const generateLocalId = () => `task-${Date.now()}-${++taskIdCounter}`;

const TaskTemplateBuilderPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();
  const isEditMode = !!templateId;

  // Form state
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [tasks, setTasks] = useState<DisplayTemplateTask[]>([]);
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");

  // UI state
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState<TaskTemplate | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showApplySuccessSnackbar, setShowApplySuccessSnackbar] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  // Relative date popover state
  const [relativeDatePopoverOpen, setRelativeDatePopoverOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DisplayTemplateTask | null>(null);

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

  // Extract category options from tasks
  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    tasks.forEach((task) => {
      if (task.category) categories.add(task.category);
    });
    taskLibrary.forEach((task) => {
      if (task.category) categories.add(task.category);
    });
    return Array.from(categories);
  }, [tasks, taskLibrary]);

  // Initialize form from template
  useEffect(() => {
    if (isEditMode && templateToEdit) {
      setTemplateName(templateToEdit.name);
      setTemplateDescription(templateToEdit.description || "");
      const tasksWithIds = templateToEdit.tasks.map((task) => ({
        ...task,
        id: generateLocalId(),
      }));
      setTasks(tasksWithIds);
      // Store initial snapshot for dirty checking
      setInitialSnapshot(
        JSON.stringify({
          name: templateToEdit.name,
          description: templateToEdit.description || "",
          tasks: templateToEdit.tasks,
        })
      );
    } else {
      setInitialSnapshot(JSON.stringify({ name: "", description: "", tasks: [] }));
    }
  }, [isEditMode, templateToEdit]);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    const current = JSON.stringify({
      name: templateName,
      description: templateDescription,
      tasks: tasks.map(({ id, ...rest }) => rest),
    });
    return current !== initialSnapshot;
  }, [templateName, templateDescription, tasks, initialSnapshot]);

  // Mutations
  const { mutate: createTemplate, isPending: isCreating } = useCreateTaskTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTaskTemplate();
  const isSubmitting = isCreating || isUpdating;

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Handle cell update from inline table
  const handleCellUpdate = useCallback(
    (rowId: string | number, field: string, value: unknown) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === rowId ? { ...task, [field]: value } : task
        )
      );
    },
    []
  );

  // Handle delete task
  const handleDeleteTask = useCallback((task: DisplayTemplateTask) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  }, []);

  // Handle add new task inline
  const handleAddRow = useCallback(
    (newRow: Omit<DisplayTemplateTask, "id">, onSuccess?: (id: string | number) => void) => {
      const newId = generateLocalId();
      const newTask: DisplayTemplateTask = {
        ...newRow,
        id: newId,
        priority: newRow.priority || "Medium",
      };
      setTasks((prev) => [newTask, ...prev]);
      if (onSuccess) onSuccess(newId);
    },
    []
  );

  // Handle edit relative date
  const handleEditRelativeDate = useCallback(
    (task: DisplayTemplateTask) => {
      setEditingTask(task);
      setRelativeDatePopoverOpen(true);
    },
    []
  );

  // Handle relative date confirm
  const handleRelativeDateConfirm = useCallback(
    (value: RelativeDateValue) => {
      if (!editingTask) return;
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                relativeDueDate: value.amount,
                relativeDueDateUnit: value.unit,
                relativeDueDateDirection: value.direction,
              }
            : task
        )
      );
      setRelativeDatePopoverOpen(false);
      setEditingTask(null);
    },
    [editingTask]
  );

  // Handle add from library
  const handleAddFromLibrary = useCallback((libraryTask: TaskLibraryItem) => {
    const newTask: DisplayTemplateTask = {
      id: generateLocalId(),
      title: libraryTask.title,
      description: libraryTask.description,
      priority: libraryTask.priority,
      category: libraryTask.category,
      relativeDueDate: libraryTask.relativeDueDate,
      relativeDueDateUnit: libraryTask.relativeDueDateUnit,
      relativeDueDateDirection: libraryTask.relativeDueDateDirection,
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    if (!templateName.trim()) {
      setNameError(t("taskTemplates.nameRequired"));
      return false;
    }
    setNameError(null);
    return true;
  }, [templateName, t]);

  // Handle save
  const handleSave = useCallback(
    async (andApply = false) => {
      if (!validateForm()) return;

      // Clean tasks - remove id and undefined fields
      const cleanedTasks = tasks.map(({ id, ...task }) =>
        cleanTaskTemplateItem(task as TaskTemplateItem)
      );

      const templatePayload: Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "createdBy"> = {
        name: templateName.trim(),
        tasks: cleanedTasks,
        ...(templateDescription.trim() && { description: templateDescription.trim() }),
      };

      if (isEditMode && templateToEdit) {
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
              // Update initial snapshot to mark as clean
              setInitialSnapshot(
                JSON.stringify({
                  name: templateName,
                  description: templateDescription,
                  tasks: tasks.map(({ id, ...rest }) => rest),
                })
              );

              if (andApply) {
                setSavedTemplate({
                  ...templateToEdit,
                  ...(templatePayload as Partial<TaskTemplate>),
                  updatedAt: new Date().toISOString(),
                });
                setApplyDialogOpen(true);
              } else {
                setShowSuccessSnackbar(true);
              }
            },
          }
        );
      } else {
        createTemplate(
          { template: templatePayload },
          {
            onSuccess: (newTemplateId) => {
              setInitialSnapshot(
                JSON.stringify({
                  name: templateName,
                  description: templateDescription,
                  tasks: tasks.map(({ id, ...rest }) => rest),
                })
              );

              if (andApply) {
                setSavedTemplate({
                  id: newTemplateId as string,
                  name: templatePayload.name as string,
                  description: templatePayload.description as string | undefined,
                  tasks: cleanedTasks as TaskTemplateItem[],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: "",
                });
                setApplyDialogOpen(true);
              } else {
                setShowSuccessSnackbar(true);
              }
            },
          }
        );
      }
    },
    [
      validateForm,
      tasks,
      templateName,
      templateDescription,
      isEditMode,
      templateToEdit,
      updateTemplate,
      createTemplate,
    ]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      navigate("/weddings/task-templates");
    }
  }, [isDirty, navigate]);

  // Handle apply success
  const handleApplySuccess = useCallback(
    (weddingName: string, taskCount: number) => {
      const message = t("taskTemplates.appliedSuccessfully", {
        count: taskCount,
        weddingName: weddingName,
      });
      setApplySuccessMessage(message);
      setShowApplySuccessSnackbar(true);
    },
    [t]
  );

  // Create columns
  const columns = useMemo(() => {
    return createTemplateTaskColumns(handleDeleteTask, t, {
      categoryOptions,
      onEditRelativeDate: handleEditRelativeDate,
    });
  }, [handleDeleteTask, t, categoryOptions, handleEditRelativeDate]);

  // Default new row values
  const defaultNewRow = useMemo(
    () => ({
      priority: "Medium" as const,
    }),
    []
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>{t("common.loading")}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with breadcrumbs */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2, justifyContent: 'space-between' }}>
        <Breadcrumbs separator={<LocalizedNavigateIcon fontSize="small" />}>
          <Link
            component="button"
            variant="body2"
            onClick={handleCancel}
            color="inherit"
            underline="hover"
            sx={{ cursor: "pointer" }}
          >
            {t("taskTemplates.title")}
          </Link>
          <Typography variant="body2" color="text.primary">
            {templateName || t("taskTemplates.newTemplate")}
          </Typography>
        </Breadcrumbs>
        <Button
            startIcon={<LibraryBooksIcon />}
            onClick={() => setLibraryModalOpen(true)}
            variant="outlined"
            size="small"
          >
            {t("taskTemplates.selectFromPreviousTemplates")}
        </Button>
      </Box>

      {/* Template Config Section */}
        <Box sx={{ mb:2, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            label={t("taskTemplates.templateName")}
            value={templateName}
            onChange={(e) => {
              setTemplateName(e.target.value);
              if (nameError) setNameError(null);
            }}
            error={!!nameError}
            helperText={nameError}
            required
            size="small"
            sx={{ minWidth: 200, flex: { xs: 1, sm: "0 0 250px" } }}
          />
          <TextField
            label={t("taskTemplates.description")}
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            placeholder={t("taskTemplates.descriptionPlaceholder")}
          />
        </Box>

        <DSInlineTable
          columns={columns}
          data={tasks}
          onCellUpdate={handleCellUpdate}
          enableInlineAdd
          addRowPlaceholder={t("taskTemplates.addTask")}
          addRowField="title"
          defaultNewRow={defaultNewRow}
          onAddRow={handleAddRow}
          emptyMessage={t("taskTemplates.noTasksYet")}
          showSearch={false}
          showExport={false}
        />

      {/* Sticky Footer Actions */}
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          zIndex: 1100,
          borderRadius: 0,
        }}
      >
        <Button onClick={handleCancel} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        {isEditMode && (
          <Button
            onClick={() => handleSave(true)}
            variant="outlined"
            disabled={isSubmitting || tasks.length === 0}
          >
            {t("taskTemplates.applyToWedding")}
          </Button>
        )}
        <Button
          onClick={() => handleSave(false)}
          variant="contained"
          disabled={isSubmitting || tasks.length === 0 || !isDirty}
        >
          {isSubmitting ? t("common.saving") : t("common.save")}
        </Button>
      </Paper>

      {/* Task Library Modal */}
      <TaskLibraryModal
        open={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        library={taskLibrary}
        onAddTask={handleAddFromLibrary}
      />

      {/* Relative Date Popover */}
      <RelativeDatePopover
        open={relativeDatePopoverOpen}
        onClose={() => {
          setRelativeDatePopoverOpen(false);
          setEditingTask(null);
        }}
        onConfirm={handleRelativeDateConfirm}
        initialValue={
          editingTask
            ? {
                amount: editingTask.relativeDueDate,
                unit: editingTask.relativeDueDateUnit,
                direction: editingTask.relativeDueDateDirection,
              }
            : undefined
        }
      />

      {/* Apply Template Dialog */}
      {savedTemplate && (
        <ApplyTaskTemplateDialog
          open={applyDialogOpen}
          onClose={() => {
            setApplyDialogOpen(false);
            setSavedTemplate(null);
          }}
          onSuccess={handleApplySuccess}
          template={savedTemplate}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onClose={() => setShowCancelConfirm(false)}>
        <DialogTitle>{t("common.unsavedChanges")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("common.unsavedChangesMessage")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelConfirm(false)}>
            {t("common.continueEditing")}
          </Button>
          <Button
            onClick={() => navigate("/weddings/task-templates")}
            color="error"
            variant="contained"
          >
            {t("common.discardChanges")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccessSnackbar(false)}
          severity="success"
          variant="filled"
        >
          {t("taskTemplates.savedSuccessfully")}
        </Alert>
      </Snackbar>

      {/* Apply Success Snackbar */}
      <Snackbar
        open={showApplySuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowApplySuccessSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowApplySuccessSnackbar(false)}
          severity="success"
          variant="filled"
        >
          {applySuccessMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TaskTemplateBuilderPage;
