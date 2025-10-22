import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { TemplateDocument, SelectedTemplate } from "@wedding-plan/types";
import TemplateSelectionDialog from "./TemplateSelectionDialog";
import { useRSVPConfig } from "../../../hooks/rsvp/useRSVPConfig";
import { useTemplates as useWeddingTemplates } from "../../../hooks/rsvp";
import { useGlobalTemplates } from "../../../hooks/globalTemplates";
import { MessageType, getMessageTypes } from "./messageTypes";

export interface SelectedTemplates {
  initialRsvp?: TemplateDocument;
  secondRsvp?: TemplateDocument;
  finalRsvp?: TemplateDocument;
  dayBefore?: TemplateDocument;
  dayAfterThankyou?: TemplateDocument;
}

interface MessagesPlanManagerProps {
  onComplete: (selectedTemplates: SelectedTemplates) => void;
  onBack: () => void;
}

const MessagesPlanManager: React.FC<MessagesPlanManagerProps> = ({
  onComplete,
  onBack,
}) => {
  const { t } = useTranslation();
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplates>(
    {}
  );

  const [activeMessageType, setActiveMessageType] = useState<string | null>(
    null
  );
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Fetch RSVP config to get existing selected templates
  const { data: rsvpConfig } = useRSVPConfig();
  const { data: weddingTemplatesData } = useWeddingTemplates({
    syncApprovalStatus: false,
  });
  const { data: globalTemplatesData } = useGlobalTemplates({
    syncApprovalStatus: false,
  });

  const messageTypes: MessageType[] = useMemo(() => getMessageTypes(t), [t]);

  // Function to find template details from the loaded templates
  const findTemplateById = useMemo(() => {
    return (templateId: string, isGlobal: boolean): TemplateDocument | null => {
      const templates = isGlobal
        ? globalTemplatesData?.templates || []
        : weddingTemplatesData?.templates || [];

      return templates.find((t) => t.id === templateId) || null;
    };
  }, [weddingTemplatesData, globalTemplatesData]);

  // Get templates from RSVP config
  const configuredTemplates = useMemo(() => {
    if (!rsvpConfig?.selectedTemplates) return {};

    const templates: SelectedTemplates = {};

    Object.entries(rsvpConfig.selectedTemplates).forEach(
      ([category, selectedTemplate]) => {
        const template = selectedTemplate as SelectedTemplate;
        const templateDetails = findTemplateById(
          template.templateFireBaseId,
          template.isGlobal
        );

        if (templateDetails) {
          templates[category as keyof SelectedTemplates] = {
            ...templateDetails,
            isGlobal: template.isGlobal,
          };
        }
      }
    );

    return templates;
  }, [rsvpConfig?.selectedTemplates, findTemplateById]);

  // Update local state when configured templates are loaded
  React.useEffect(() => {
    if (configuredTemplates && Object.keys(configuredTemplates).length > 0) {
      setSelectedTemplates((prev) => ({ ...configuredTemplates, ...prev }));
    }
  }, [configuredTemplates]);

  const handleTemplateSelect = (
    messageTypeId: string,
    template: TemplateDocument
  ) => {
    setSelectedTemplates((prev) => ({
      ...prev,
      [messageTypeId]: template,
    }));
    setActiveMessageType(null);
  };

  const handleDialogTemplateSelect = (template: TemplateDocument) => {
    if (activeMessageType) {
      handleTemplateSelect(activeMessageType, template);
    }
    setIsTemplateDialogOpen(false);
    setActiveMessageType(null);
  };

  const handleDialogClose = () => {
    setIsTemplateDialogOpen(false);
    setActiveMessageType(null);
  };

  const handleMessageTypeClick = (messageTypeId: string) => {
    setActiveMessageType(messageTypeId);
    setIsTemplateDialogOpen(true);
  };
  const canComplete =
    Object.keys(selectedTemplates).length === messageTypes.length;

  // Get current message type details for dialog
  const activeMessageTypeDetails = useMemo(() => {
    return messageTypes.find((mt) => mt.id === activeMessageType);
  }, [messageTypes, activeMessageType]);

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        {t("userRsvp.messagesPlan.title")}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("userRsvp.messagesPlan.description")}
      </Typography>

      <Stack spacing={2}>
        {messageTypes.map((messageType) => {
          const selectedTemplate =
            selectedTemplates[messageType.id as keyof SelectedTemplates];
          const isSelected = !!selectedTemplate;

          return (
            <Card
              key={messageType.id}
              sx={{
                border: 2,
                borderColor: isSelected
                  ? `${messageType.color}.main`
                  : "divider",
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ color: `${messageType.color}.main` }}>
                    {messageType.icon}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {messageType.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {messageType.description}
                    </Typography>

                    {selectedTemplate && (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            icon={<CheckCircleIcon />}
                            label={selectedTemplate.friendlyName}
                            color={messageType.color}
                          />
                          {selectedTemplate.isGlobal && (
                            <Chip
                              size="small"
                              label={t("templates.global")}
                              variant="outlined"
                              sx={{ fontSize: "0.65rem" }}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  <Button
                    variant={isSelected ? "outlined" : "contained"}
                    color={messageType.color}
                    onClick={() => handleMessageTypeClick(messageType.id)}
                  >
                    {isSelected
                      ? t("userRsvp.messagesPlan.changeTemplate")
                      : t("userRsvp.messagesPlan.selectTemplate")}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button onClick={onBack} variant="outlined">
          {t("common.back")}
        </Button>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {Object.keys(selectedTemplates).length} / {messageTypes.length}{" "}
            {t("userRsvp.messagesPlan.templatesSelected")}
          </Typography>

          <Button
            onClick={() => onComplete(selectedTemplates)}
            variant="contained"
            disabled={!canComplete}
          >
            {t("userRsvp.messagesPlan.continue")}
          </Button>
        </Stack>
      </Stack>

      {/* Template Selection Dialog */}
      <TemplateSelectionDialog
        open={isTemplateDialogOpen}
        onClose={handleDialogClose}
        onSelect={handleDialogTemplateSelect}
        messageTypeTitle={activeMessageTypeDetails?.title || ""}
        templateCategory={activeMessageType}
      />
    </Box>
  );
};

export default MessagesPlanManager;
