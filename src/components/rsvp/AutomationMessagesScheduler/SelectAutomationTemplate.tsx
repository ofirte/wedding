import React, { FC, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useAllWeddingAvailableTemplates } from "../../../hooks/templates/useAllWeddingAvailableTemplates";
import WhatsAppTemplatePreview from "../../templates/WhatsAppTemplatePreview";
import { LocalizedArrowIcon } from "src/components/common";

interface SelectAutomationTemplateProps {
  onSelectTemplate: (templateId: string) => void;
}

const SelectAutomationTemplate: FC<SelectAutomationTemplateProps> = ({
  onSelectTemplate,
}) => {
  const { t } = useTranslation();
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

  // Fetch all available templates (both global and wedding)
  const { data: templates, isLoading } = useAllWeddingAvailableTemplates();

  // Filter out templates without required content
  const validTemplates = useMemo(() => {
    if (!templates) return [];

    return templates.filter((template) => {
      const hasContent =
        template?.types?.["twilio/text"]?.body || template?.friendlyName;
      return hasContent && template.sid;
    });
  }, [templates]);

  const currentTemplate = validTemplates[currentTemplateIndex];

  const handlePreviousTemplate = () => {
    setCurrentTemplateIndex((prev) =>
      prev > 0 ? prev - 1 : validTemplates.length - 1
    );
  };

  const handleNextTemplate = () => {
    setCurrentTemplateIndex((prev) =>
      prev < validTemplates.length - 1 ? prev + 1 : 0
    );
  };

  const handleSelectTemplate = () => {
    if (currentTemplate?.sid) {
      onSelectTemplate(currentTemplate.sid);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {t("common.loading")}
        </Typography>
      </Box>
    );
  }

  if (!validTemplates.length) {
    return (
      <Alert severity="info" sx={{ mx: 2 }}>
        <Typography variant="body2">
          {t("rsvp.noTemplatesAvailable")}
        </Typography>
      </Alert>
    );
  }

  return (
    <Stack spacing={3} sx={{ px: 2, py: 2 }}>
      {/* Template Navigation Controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <IconButton
          onClick={handlePreviousTemplate}
          disabled={validTemplates.length <= 1}
          size="large"
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { bgcolor: "grey.300", color: "grey.500" },
          }}
        >
          <LocalizedArrowIcon direction="previous" />
        </IconButton>
        {currentTemplate && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <WhatsAppTemplatePreview
              template={currentTemplate}
              showHeader={true}
            />
          </Box>
        )}
        <IconButton
          onClick={handleNextTemplate}
          disabled={validTemplates.length <= 1}
          size="large"
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { bgcolor: "grey.300", color: "grey.500" },
          }}
        >
          <LocalizedArrowIcon direction="next" />
        </IconButton>
      </Box>

      {/* Select Template Button */}
      <Box sx={{ textAlign: "center", pt: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSelectTemplate}
          startIcon={<CheckCircleIcon />}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
            },
          }}
        >
          {t("rsvp.selectTemplate")}
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, fontStyle: "italic" }}
        >
          {t("rsvp.selectTemplateHint")}
        </Typography>
      </Box>
    </Stack>
  );
};

export default SelectAutomationTemplate;
