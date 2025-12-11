import React from "react";
import { Box, Button, Collapse, IconButton, Paper, Typography } from "@mui/material";
import { TemplateDocument } from "@wedding-plan/types";
import WhatsAppTemplatePreview from "../../../../templates/WhatsAppTemplatePreview";
import { LocalizedArrowIcon } from "../../../../common";

interface MessagePreviewSectionProps {
  showPreview: boolean;
  onTogglePreview: () => void;
  template: TemplateDocument | undefined;
  availableTemplates: TemplateDocument[];
  effectiveTime: Date;
  isEditing: boolean;
  onTemplateChange: (templateId: string) => void;
  t: (key: string) => string;
}

export const MessagePreviewSection: React.FC<MessagePreviewSectionProps> = ({
  showPreview,
  onTogglePreview,
  template,
  availableTemplates,
  effectiveTime,
  isEditing,
  onTemplateChange,
  t,
}) => {
  const hasMultipleTemplates = availableTemplates.length > 1;
  const currentTemplateIndex = template
    ? availableTemplates.findIndex((t) => t.id === template.id)
    : 0;

  const handlePreviousTemplate = () => {
    if (currentTemplateIndex > 0) {
      onTemplateChange(availableTemplates[currentTemplateIndex - 1].id);
    }
  };

  const handleNextTemplate = () => {
    if (currentTemplateIndex < availableTemplates.length - 1) {
      onTemplateChange(availableTemplates[currentTemplateIndex + 1].id);
    }
  };

  return (
    <>
      <Button
        variant="text"
        size="small"
        onClick={onTogglePreview}
        sx={{ textTransform: "none" }}
      >
        {showPreview
          ? t("rsvp.hideMessage") || "Hide Message"
          : t("rsvp.viewMessage") || "View Message"}
      </Button>

      <Collapse in={showPreview}>
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
          {/* Previous Arrow - only show in edit mode with multiple templates */}
          {isEditing && hasMultipleTemplates && (
            <IconButton
              onClick={handlePreviousTemplate}
              disabled={currentTemplateIndex === 0}
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
                "&:disabled": { bgcolor: "grey.300", color: "grey.500" },
              }}
            >
              <LocalizedArrowIcon direction="previous" />
            </IconButton>
          )}

          {/* Message Preview */}
          <Box sx={{ flex: 1 }}>
            {template ? (
              <WhatsAppTemplatePreview
                template={template}
                scheduledTime={effectiveTime}
                showHeader={false}
              />
            ) : (
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "grey.50",
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary">
                  {t("rsvp.noTemplateAssigned") || "No template assigned"}
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Next Arrow - only show in edit mode with multiple templates */}
          {isEditing && hasMultipleTemplates && (
            <IconButton
              onClick={handleNextTemplate}
              disabled={currentTemplateIndex === availableTemplates.length - 1}
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
                "&:disabled": { bgcolor: "grey.300", color: "grey.500" },
              }}
            >
              <LocalizedArrowIcon direction="next" />
            </IconButton>
          )}
        </Box>
      </Collapse>
    </>
  );
};
