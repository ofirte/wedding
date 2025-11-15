/**
 * TaskTemplateManager Component
 * Main page for producers to manage their task templates
 */

import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Container,
  Paper,
  Typography,
  Fab,
  IconButton,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Launch as ApplyIcon,
} from "@mui/icons-material";
import { TaskTemplate } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import {
  useTaskTemplates,
  useDeleteTaskTemplate,
} from "../../hooks/taskTemplates";
import DSTable from "../common/DSTable";
import ApplyTaskTemplateDialog from "./ApplyTaskTemplateDialog";
import { formatRelativeDueDate } from "../../utils/taskTemplateUtils";

const TaskTemplateManager: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  // State for success feedback
  const [showApplySuccessSnackbar, setShowApplySuccessSnackbar] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState("");

  // Fetch templates
  const { data: templates = [], isLoading } = useTaskTemplates();

  // Delete mutation
  const { mutate: deleteTemplate } = useDeleteTaskTemplate();

  // Handlers
  const handleEdit = (template: TaskTemplate) => {
    navigate(`/weddings/task-templates/edit/${template.id}`);
  };

  const handleCreate = () => {
    navigate("/weddings/task-templates/create");
  };

  const handleApply = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setApplyDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t("taskTemplates.confirmDelete"))) {
      deleteTemplate({ id });
    }
  };

  const handleCloseApplyDialog = () => {
    setApplyDialogOpen(false);
    setSelectedTemplate(null);
  };

  // Handle successful template application
  const handleApplySuccess = (weddingName: string, taskCount: number) => {
    const message = t("taskTemplates.appliedSuccessfully", {
      count: taskCount,
      weddingName: weddingName
    });
    setApplySuccessMessage(message);
    setShowApplySuccessSnackbar(true);
  };

  // Table columns
  const columns = [
    {
      id: "name",
      label: t("taskTemplates.templateName"),
      sortable: true,
      mobileLabel: t("taskTemplates.templateName"),
      showOnMobileCard: true,
      render: (template: TaskTemplate) => (
        <Typography variant="body2" fontWeight={500}>
          {template.name}
        </Typography>
      ),
    },
    {
      id: "description",
      label: t("taskTemplates.description"),
      sortable: false,
      hideOnMobile: true,
      render: (template: TaskTemplate) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {template.description || t("common.noDescription")}
        </Typography>
      ),
    },
    {
      id: "taskCount",
      label: t("taskTemplates.numberOfTasks"),
      sortable: true,
      mobileLabel: t("taskTemplates.tasks"),
      showOnMobileCard: true,
      render: (template: TaskTemplate) => (
        <Chip
          label={template.tasks.length}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      id: "createdAt",
      label: t("common.createdAt"),
      sortable: true,
      mobileLabel: t("common.createdAt"),
      showOnMobileCard: true,
      render: (template: TaskTemplate) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(template.createdAt).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: t("common.actions"),
      sortable: false,
      mobileLabel: t("common.actions"),
      showOnMobileCard: true,
      render: (template: TaskTemplate) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={t("taskTemplates.applyToWedding")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleApply(template);
              }}
              color="primary"
            >
              <ApplyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("common.delete")}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(template.id);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box >
        {/* Page Header */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t("taskTemplates.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("taskTemplates.subtitle")}
          </Typography>
        </Box>

        {/* Templates Table */}

          <DSTable
            columns={columns}
            data={templates}
            onRowClick={handleEdit}
            showExport={true}
            exportFilename="task-templates"
            mobileCardTitle={(template) => template.name}
          />


        {/* Floating Action Button for Creating Templates */}
        <Fab
          color="primary"
          aria-label={t("taskTemplates.createTemplateAriaLabel")}
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
          }}
          onClick={handleCreate}
        >
          <AddIcon />
        </Fab>

        {/* Apply Template Dialog */}
        {selectedTemplate && (
          <ApplyTaskTemplateDialog
            open={applyDialogOpen}
            onClose={handleCloseApplyDialog}
            onSuccess={handleApplySuccess}
            template={selectedTemplate}
          />
        )}

        {/* Apply Success Snackbar */}
        <Snackbar
          open={showApplySuccessSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowApplySuccessSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setShowApplySuccessSnackbar(false)}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {applySuccessMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default TaskTemplateManager;
