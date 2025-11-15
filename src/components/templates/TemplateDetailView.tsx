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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { TemplateTableRow } from "./TemplateColumns";
import TemplateApprovalWorkflow from "./TemplateApprovalWorkflow";
import TemplateApprovalStatus from "./TemplateApprovalStatus";
import { useUpdateTemplate } from "../../hooks/templates";
import {
  TEMPLATE_CATEGORY_OPTIONS,
  getCategoryLabel,
} from "../../utils/templatesUtils";
import { TemplatesCategories } from "@wedding-plan/types";
import { useParams } from "react-router";
import WhatsAppTemplatePreview from "./WhatsAppTemplatePreview";

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
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    TemplatesCategories | ""
  >("");
  const [showRawTemplate, setShowRawTemplate] = useState(false);
  const { weddingId } = useParams<{ weddingId: string }>();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();

  // Reset view mode when dialog opens
  React.useEffect(() => {
    if (open) {
      setViewMode("details");
      setIsEditingCategory(false);
      setEditingCategory(template?.category || "");
      setShowRawTemplate(false);
    }
  }, [open, template]);

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

  const handleEditCategory = () => {
    setEditingCategory(template?.category || "");
    setIsEditingCategory(true);
  };

  const handleSaveCategory = () => {
    if (!template) return;

    updateTemplate(
      {
        templateId: template.id,
        updates: { category: editingCategory || undefined },
        weddingId,
      },
      {
        onSuccess: () => {
          setIsEditingCategory(false);
        },
      }
    );
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(template?.category || "");
    setIsEditingCategory(false);
  };

  const handleToggleRawTemplate = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: boolean
  ) => {
    if (newValue !== null) {
      setShowRawTemplate(newValue);
    }
  };




  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box sx={{ display: "flex", gap: 2 }}>
            <Typography variant="h5" component="h2">
              {template.friendlyName || t("templates.unnamed")}
            </Typography>
            <Box sx={{ mb: 2 }}>
              {isEditingCategory ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>{t("templates.category")}</InputLabel>
                    <Select
                      value={editingCategory}
                      onChange={(e) =>
                        setEditingCategory(
                          e.target.value as TemplatesCategories | ""
                        )
                      }
                      label={t("templates.category")}
                      disabled={isUpdating}
                    >
                      <MenuItem value="">
                        <em>{t("templates.uncategorized")}</em>
                      </MenuItem>
                      {TEMPLATE_CATEGORY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(option.translationKey)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    onClick={handleSaveCategory}
                    color="primary"
                    size="small"
                    disabled={isUpdating}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleCancelEditCategory}
                    size="small"
                    disabled={isUpdating}
                  >
                    <CancelIcon />
                  </IconButton>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={getCategoryLabel(template.category, t)}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                  <IconButton
                    onClick={handleEditCategory}
                    size="small"
                    disabled={viewMode !== "details"}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {viewMode === "details" && (
          <Box>
            {/* Template Content - Clean, prominent display */}
            <Box sx={{ p: 3 }}>
              {/* Toggle between preview and raw template */}
              <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                <ToggleButtonGroup
                  value={showRawTemplate}
                  exclusive
                  onChange={handleToggleRawTemplate}
                  size="small"
                >
                  <ToggleButton value={false}>
                    <PreviewIcon sx={{ mr: 1 }} />
                    {t("templates.preview")}
                  </ToggleButton>
                  <ToggleButton value={true}>
                    <CodeIcon sx={{ mr: 1 }} />
                    {t("templates.rawTemplate")}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {showRawTemplate ? (
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
                      fontFamily: "monospace",
                      lineHeight: 1.6,
                      fontSize: "0.875rem",
                      color: "text.primary",
                    }}
                  >
                    {template.body || t("templates.noContent")}
                  </Typography>
                </Paper>
              ) : (
                <WhatsAppTemplatePreview template={template} />
              )}
            </Box>

            {/* Approval Section - Integrated, not separate */}
            <Box sx={{ px: 3, pb: 3 }}>
              <TemplateApprovalStatus
                templateSid={template.sid}
                onSubmitApproval={handleSwitchToApproval}
              />
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
              disabled={isDeleting || isUpdating}
            >
              {isDeleting
                ? t("templates.deleting")
                : t("templates.deleteTemplate")}
            </Button>

            {/* Right side - Close */}
            <Button onClick={onClose} variant="outlined" disabled={isUpdating}>
              {t("common.close")}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TemplateDetailView;
