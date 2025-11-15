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
  Snackbar,
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
  template: TaskTemplate;
}

const ApplyTaskTemplateDialog: React.FC<ApplyTaskTemplateDialogProps> = ({
  open,
  onClose,
  template,
}) => {
  const { t } = useTranslation();
  const [selectedWeddingId, setSelectedWeddingId] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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
    if (!selectedWeddingId) return;

    applyTemplate(
      {
        templateId: template.id,
        weddingId: selectedWeddingId,
      },
      {
        onSuccess: () => {
          setShowSuccessAlert(true);
          setSelectedWeddingId("");
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
    <>
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
                                      task.relativeDueDateDirection
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

      {/* Success Snackbar */}
      <Snackbar
      open={showSuccessAlert}
      autoHideDuration={6000}
      onClose={() => setShowSuccessAlert(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessAlert(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {t("taskTemplates.appliedSuccessfully", { count: template.tasks.length })}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ApplyTaskTemplateDialog;
