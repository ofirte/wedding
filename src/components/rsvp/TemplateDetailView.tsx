import React from "react";
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
  Send as SendIcon,
  Language as LanguageIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { TemplateTableRow } from "./TemplateColumns";

interface TemplateDetailViewProps {
  open: boolean;
  onClose: () => void;
  template: TemplateTableRow | null;
  onDelete?: (templateSid: string) => void;
  onSubmitForApproval?: (templateSid: string) => void;
  isDeleting?: boolean;
}

const TemplateDetailView: React.FC<TemplateDetailViewProps> = ({
  open,
  onClose,
  template,
  onDelete,
  onSubmitForApproval,
  isDeleting = false,
}) => {
  const { t } = useTranslation();

  if (!template) {
    return null;
  }

  const handleDelete = () => {
    if (onDelete && template.sid) {
      onDelete(template.sid);
    }
  };

  const handleSubmitForApproval = () => {
    if (onSubmitForApproval && template.sid) {
      onSubmitForApproval(template.sid);
    }
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

      <DialogContent>
        <Stack spacing={3}>
          {/* Template Metadata */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t("templates.templateInfo")}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
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
          </Box>

          {/* Template Content */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t("templates.messageContent")}
            </Typography>
            <Paper elevation={1} sx={{ p: 2, backgroundColor: "grey.50" }}>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  lineHeight: 1.6,
                }}
              >
                {template.body || t("templates.noContent")}
              </Typography>
            </Paper>
          </Box>

          {/* Variables */}
          {variables.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
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

          {/* Template ID Info */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t("templates.templateId")}: {template.sid}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
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
            startIcon={isDeleting ? undefined : <DeleteIcon />}
            disabled={isDeleting}
          >
            {isDeleting
              ? t("templates.deleting")
              : t("templates.deleteTemplate")}
          </Button>

          {/* Right side - Submit for approval and close */}
          <Stack direction="row" spacing={1}>
            <Button
              onClick={handleSubmitForApproval}
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              disabled={
                template.approvalStatus === "submitted" ||
                template.approvalStatus === "approved"
              }
            >
              {t("templates.submitForApproval")}
            </Button>
            <Button onClick={onClose} variant="outlined">
              {t("common.close")}
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateDetailView;
