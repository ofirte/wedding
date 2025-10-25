import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,

  IconButton,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { TemplateDocument, TemplatesCategories } from "@wedding-plan/types";
import {
  useUpdateRsvpConfigSelectedTemplates,
} from "../../../hooks/rsvp";
import { useGlobalTemplates } from "../../../hooks/globalTemplates";
import { usePreviewText } from "../../../hooks/common";
import PreviewWhatsappMessage from "./PreviewWhatsappMessage";
import { useWeddingTemplates } from "../../../hooks/templates/useWeddingTemplates";

interface TemplateSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: TemplateDocument) => void;
  messageTypeTitle: string;
  templateCategory: string | null;
}

const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
  messageTypeTitle,
  templateCategory,
}) => {
  const { t, language } = useTranslation();

  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateDocument | null>(null);

  // Hook to update RSVP config with selected template
  const { mutate: updateSelectedTemplate, isPending: isUpdating } =
    useUpdateRsvpConfigSelectedTemplates();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch both wedding and global templates
  const { data: weddingTemplatesData, isLoading: isWeddingLoading } =
    useWeddingTemplates({
      syncApprovalStatus: false,
    });
  const { data: globalTemplatesData, isLoading: isGlobalLoading } =
    useGlobalTemplates({
      syncApprovalStatus: false,
    });

  // Filter templates by category and approval status
  const filteredTemplates = useMemo(() => {
    if (!templateCategory) {
      return { wedding: [], global: [] };
    }

    const wedding = (weddingTemplatesData?.templates || []).filter(
      (t) =>
        (t.approvalStatus === "approved" && t?.category === templateCategory) ||
        true
    );
    const global = (globalTemplatesData?.templates || []).filter(
      (t) =>
        (t.approvalStatus === "approved" && t?.category === templateCategory) ||
        true
    );

    return { wedding, global };
  }, [weddingTemplatesData, globalTemplatesData, templateCategory]);

  // Combine all templates into a single array
  const allTemplates = useMemo(
    () => [
      ...filteredTemplates.wedding.map((t) => ({ ...t, isGlobal: false })),
      ...filteredTemplates.global.map((t) => ({ ...t, isGlobal: true })),
    ],
    [filteredTemplates]
  );

  const isLoading = isWeddingLoading || isGlobalLoading;

  const currentTemplate = allTemplates[currentIndex];
  console.log(allTemplates)
  // Generate preview text with populated variables
  const templateBody = currentTemplate?.types["twilio/text"]?.body || "";
  const previewText = usePreviewText({ messageText: templateBody, language });


  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allTemplates.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < allTemplates.length - 1 ? prev + 1 : 0));
  };

  const handleSelect = () => {
    if (currentTemplate && templateCategory) {
      console.log("Selected template:", currentTemplate);
      // Update RSVP config with selected template
      updateSelectedTemplate({
        category: templateCategory as TemplatesCategories,
        templateFireBaseId: currentTemplate.id,
        templateSid: currentTemplate.sid,
        isGlobal: currentTemplate.isGlobal,
      });

      // Call the external onSelect callback
      onSelect(currentTemplate);
    }
  };

  const handleClose = () => {
    setCurrentIndex(0);
    setSelectedTemplate(null);
    onClose();
  };
  const NextArrowIcon = language === "he" ? ArrowBackIcon : ArrowForwardIcon;
  const PreviousArrowIcon =
    language === "he" ? ArrowForwardIcon : ArrowBackIcon;

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: "80vh", maxHeight: 700 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">
              {t("userRsvp.messagesPlan.selectTemplate")} - {messageTypeTitle}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {currentIndex + 1} / {allTemplates.length}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between "
          p={2}
        >
          <IconButton
            onClick={handlePrevious}
            disabled={allTemplates.length <= 1}
            size="small"
          >
            <PreviousArrowIcon />
          </IconButton>
          <Stack sx={{ height: "100%" }}>
            {/* Template Content */}
            <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
              <Stack spacing={3}>
                {/* WhatsApp Preview */}
                <Box>
                  <PreviewWhatsappMessage
                    message={previewText || t("templates.noContent")}
                    senderName="Wedding Planner"
                  />
                </Box>
              </Stack>
            </Box>
          </Stack>

          <IconButton
            onClick={handleNext}
            disabled={allTemplates.length <= 1}
            size="small"
          >
            <NextArrowIcon />
          </IconButton>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSelect}
          variant="contained"
          disabled={!currentTemplate || isUpdating}
          startIcon={<CheckCircleIcon />}
        >
          {isUpdating
            ? t("common.saving")
            : t("userRsvp.messagesPlan.selectTemplate")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSelectionDialog;
