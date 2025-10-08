import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Language as LanguageIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { TemplateTableRow } from "./TemplateColumns";
import TemplateApprovalWorkflow from "./TemplateApprovalWorkflow";
import TemplateApprovalStatus from "./TemplateApprovalStatus";

type ViewMode = "details" | "approval";

interface TemplateDetailViewProps {
  open: boolean;
  onClose: () => void;
  template: TemplateTableRow | null;
  onDelete?: (templateSid: string) => void;
  isDeleting?: boolean;
}

const TemplateDetailView: React.FC<TemplateDetailViewProps> = ({
  open,
  onClose,
  template,
  onDelete,
  isDeleting = false,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("details");

  // Reset view mode when dialog opens
  React.useEffect(() => {
    if (open) {
      setViewMode("details");
    }
  }, [open]);

  if (!template) {
    return null;
  }

  const handleDelete = () => {
    if (onDelete && template.sid) {
      onDelete(template.sid);
    }
  };

  const handleSwitchToApproval = () => {
    setViewMode("approval");
  };

  const handleBackToDetails = () => {
    setViewMode("details");
  };

  const handleApprovalSuccess = () => {
    // Optionally refresh data or show success state
    setViewMode("details");
  };

  const getTypeIcon = (type: "text" | "media" | "both") => {
    switch (type) {
      case "text":
        return <TextFieldsIcon fontSize="small" />;
      case "media":
        return <ImageIcon fontSize="small" />;
      case "both":
        return (
          <Stack direction="row" spacing={0.5}>
            <TextFieldsIcon fontSize="small" />
            <ImageIcon fontSize="small" />
          </Stack>
        );
      default:
        return <TextFieldsIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "submitted":
      case "received":
        return "info";
      case "pending":
      default:
        return "warning";
    }
  };

  // Extract variables from the template body
  const extractVariables = (body: string): string[] => {
    const matches = body.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map((match) => match.slice(2, -2)) : [];
  };

  const variables = template.body ? extractVariables(template.body) : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="h2">
            {template.friendlyName || t("templates.unnamed")}
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {viewMode === "details" && (
          <Box>
            {/* Header Section with Integrated Metadata */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Chip
                  icon={<LanguageIcon />}
                  label={template.language?.toUpperCase() || "N/A"}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  icon={getTypeIcon(template.type)}
                  label={template.type}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
                <Chip
                  label={template.approvalStatus || "pending"}
                  size="small"
                  color={getStatusColor(template.approvalStatus) as any}
                />
              </Stack>

              {/* Variables in header if they exist */}
              {variables.length > 0 && (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {t("templates.variables")} ({variables.length})
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {variables.map((variable) => (
                      <Chip
                        key={variable}
                        label={`{{${variable}}}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Template Content - Clean, prominent display */}
            <Box sx={{ p: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: "grey.50",
                  border: 1,
                  borderColor: "grey.200",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    lineHeight: 1.6,
                    fontSize: "1rem",
                  }}
                >
                  {template.body || t("templates.noContent")}
                </Typography>
              </Paper>
            </Box>

            {/* Approval Section - Integrated, not separate */}
            <Box sx={{ px: 3, pb: 3 }}>
              <TemplateApprovalStatus
                templateSid={template.sid}
                onSubmitApproval={handleSwitchToApproval}
              />
            </Box>

            {/* Footer with Template ID */}
            <Box
              sx={{ px: 3, pb: 2, borderTop: 1, borderColor: "divider", pt: 2 }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("templates.templateId")}: {template.sid}
              </Typography>
            </Box>
          </Box>
        )}

        {viewMode === "approval" && (
          <TemplateApprovalWorkflow
            templateSid={template.sid}
            templateName={template.friendlyName || t("templates.unnamed")}
            onBack={handleBackToDetails}
            onSuccess={handleApprovalSuccess}
          />
        )}
      </DialogContent>

      <DialogActions>
        {viewMode === "details" && (
          <Stack
            direction="row"
            spacing={2}
            width="100%"
            justifyContent="space-between"
          >
            {/* Left side - Delete button */}
            <Button
              onClick={handleDelete}
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              disabled={isDeleting}
            >
              {isDeleting
                ? t("templates.deleting")
                : t("templates.deleteTemplate")}
            </Button>

            {/* Right side - Close */}
            <Button onClick={onClose} variant="outlined">
              {t("common.close")}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TemplateDetailView;
