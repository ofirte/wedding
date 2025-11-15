/**
 * ApplyTaskTemplateDialog Component
 * Dialog for applying a task template to a wedding
 * Shows preview of tasks with calculated due dates
 */

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from "@mui/material";
import { TaskTemplate } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useCurrentUser } from "../../hooks/auth/useCurrentUser";
import { useWeddingsDetails } from "../../hooks/wedding/useWeddingsDetails";
import { useApplyTaskTemplate } from "../../hooks/taskTemplates";
import { previewAbsoluteDueDate, formatRelativeDueDate } from "../../utils/taskTemplateUtils";

interface ApplyTaskTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (weddingName: string, taskCount: number) => void;
  template: TaskTemplate;
}

const ApplyTaskTemplateDialog: React.FC<ApplyTaskTemplateDialogProps> = ({
  open,
  onClose,
  onSuccess,
  template,
}) => {
  const { t } = useTranslation();
  const [selectedWeddingId, setSelectedWeddingId] = useState("");

  // Fetch user's weddings
  const { data: currentUser } = useCurrentUser();
  const { data: weddings = [], isLoading: isLoadingWeddings } = useWeddingsDetails(
    currentUser?.weddingIds || []
  );

  // Apply mutation
  const { mutate: applyTemplate, isPending: isApplying } = useApplyTaskTemplate();

  // Get selected wedding
  const selectedWedding = useMemo(() => {
    return weddings.find((w) => w.id === selectedWeddingId);
  }, [weddings, selectedWeddingId]);

  // Calculate preview tasks
  const previewTasks = useMemo(() => {
    if (!selectedWedding) return [];

    return template.tasks.map((task) => {
      const dueDate = previewAbsoluteDueDate(task, selectedWedding.date);
      return {
        ...task,
        calculatedDueDate: dueDate,
      };
    });
  }, [template.tasks, selectedWedding]);

  // Check if wedding has a date
  const weddingHasDate = selectedWedding?.date !== undefined;

  // Handle apply
  const handleApply = () => {
    if (!selectedWeddingId || !selectedWedding) return;

    // Save wedding name before resetting state
    const weddingName = selectedWedding.name;

    applyTemplate(
      {
        templateId: template.id,
        weddingId: selectedWeddingId,
      },
      {
        onSuccess: () => {
          setSelectedWeddingId("");
          // Call parent's onSuccess callback with wedding name and task count
          if (onSuccess) {
            onSuccess(weddingName, template.tasks.length);
          }
          // Close the dialog
          onClose();
        },
        onError: (error, data) => {
          console.log("ApplyTaskTemplateDialog - handleApply - onError", error, data);
          console.error("Error applying task template:", error);
        }
      }
    );
  };

  // Handle close
  const handleClose = () => {
    if (!isApplying) {
      onClose();
      setSelectedWeddingId("");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{t("taskTemplates.applyTemplate")}</DialogTitle>

        <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Template Info */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("taskTemplates.template")}
            </Typography>
            <Typography variant="h6">{template.name}</Typography>
            {template.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {template.description}
              </Typography>
            )}
            <Chip
              label={`${template.tasks.length} ${t("taskTemplates.tasks").toLowerCase()}`}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Wedding Selector */}
          {isLoadingWeddings ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TextField
              fullWidth
              select
              label={t("taskTemplates.selectWedding")}
              value={selectedWeddingId}
              onChange={(e) => setSelectedWeddingId(e.target.value)}
              required
            >
              {weddings.length === 0 ? (
                <MenuItem value="" disabled>
                  {t("taskTemplates.noWeddingsAvailable")}
                </MenuItem>
              ) : (
                weddings.map((wedding) => (
                  <MenuItem key={wedding.id} value={wedding.id}>
                    {wedding.name} - {new Date(wedding.date).toLocaleDateString()}
                  </MenuItem>
                ))
              )}
            </TextField>
          )}

          {/* Warning if no date set */}
          {selectedWedding && !weddingHasDate && (
            <Alert severity="warning">
              {t("taskTemplates.weddingHasNoDate")}
            </Alert>
          )}

          {/* Preview Section */}
          {selectedWedding && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("taskTemplates.preview")}
              </Typography>
              <List dense sx={{ bgcolor: "action.hover", borderRadius: 1 }}>
                {previewTasks.map((task, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box component="span">
                          {task.calculatedDueDate ? (
                            <>
                              {t("common.dueDate")}:{" "}
                              {task.calculatedDueDate.toLocaleDateString()}
                              {task.relativeDueDate &&
                                task.relativeDueDateUnit &&
                                task.relativeDueDateDirection && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    ({formatRelativeDueDate(
                                      task.relativeDueDate,
                                      task.relativeDueDateUnit,
                                      task.relativeDueDateDirection,
                                      t
                                    )})
                                  </Typography>
                                )}
                            </>
                          ) : (
                            t("common.noDueDate")
                          )}
                        </Box>
                      }
                    />
                    <Chip
                      label={task.priority}
                      size="small"
                      color={
                        task.priority === "High"
                          ? "error"
                          : task.priority === "Medium"
                          ? "warning"
                          : "default"
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
        </DialogContent>

        <DialogActions>
        <Button onClick={handleClose} disabled={isApplying}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={!selectedWeddingId || isApplying}
        >
          {isApplying ? t("common.applying") : t("taskTemplates.apply")}
        </Button>
        </DialogActions>
      </Dialog>
  );
};

export default ApplyTaskTemplateDialog;
