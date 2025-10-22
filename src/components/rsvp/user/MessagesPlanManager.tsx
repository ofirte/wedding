import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import {
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useTemplates as useWeddingTemplates } from "../../../hooks/rsvp";
import { useGlobalTemplates } from "../../../hooks/globalTemplates";
import { TemplateDocument } from "@wedding-plan/types";

interface MessageType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "info";
}

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

  // Fetch both wedding and global templates
  const { data: weddingTemplatesData, isLoading: isWeddingLoading } =
    useWeddingTemplates({
      syncApprovalStatus: false,
    });
  const { data: globalTemplatesData, isLoading: isGlobalLoading } =
    useGlobalTemplates({
      syncApprovalStatus: false,
    });

  const messageTypes: MessageType[] = useMemo(
    () => [
      {
        id: "initialRsvp",
        title: t("userRsvp.messagesPlan.initialRsvp.title"),
        description: t("userRsvp.messagesPlan.initialRsvp.description"),
        icon: <MessageIcon />,
        color: "primary",
      },
      {
        id: "secondRsvp",
        title: t("userRsvp.messagesPlan.secondRsvp.title"),
        description: t("userRsvp.messagesPlan.secondRsvp.description"),
        icon: <MessageIcon />,
        color: "secondary",
      },
      {
        id: "finalRsvp",
        title: t("userRsvp.messagesPlan.finalRsvp.title"),
        description: t("userRsvp.messagesPlan.finalRsvp.description"),
        icon: <MessageIcon />,
        color: "warning",
      },
      {
        id: "dayBefore",
        title: t("userRsvp.messagesPlan.dayBefore.title"),
        description: t("userRsvp.messagesPlan.dayBefore.description"),
        icon: <ScheduleIcon />,
        color: "info",
      },
      {
        id: "dayAfterThankyou",
        title: t("userRsvp.messagesPlan.dayAfterThankyou.title"),
        description: t("userRsvp.messagesPlan.dayAfterThankyou.description"),
        icon: <CheckCircleIcon />,
        color: "success",
      },
    ],
    [t]
  );

  // Combine and categorize templates
  const allTemplates = useMemo(() => {
    const wedding = weddingTemplatesData?.templates || [];
    const global = globalTemplatesData?.templates || [];

    return {
      wedding: wedding.filter((t) => t.approvalStatus === "approved"),
      global: global.filter((t) => t.approvalStatus === "approved"),
    };
  }, [weddingTemplatesData, globalTemplatesData]);

  // Get templates filtered by the active message type category
  const getTemplatesForMessageType = useCallback(
    (messageTypeId: string) => {
      return {
        wedding: allTemplates.wedding.filter(
          (t) => t?.category === messageTypeId
        ),
        global: allTemplates.global.filter(
          (t) => t?.category === messageTypeId
        ),
      };
    },
    [allTemplates]
  );

  const isLoading = isWeddingLoading || isGlobalLoading;

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

  const handleMessageTypeClick = (messageTypeId: string) => {
    setActiveMessageType(
      activeMessageType === messageTypeId ? null : messageTypeId
    );
  };

  const canComplete =
    Object.keys(selectedTemplates).length === messageTypes.length;

  const renderTemplateCard = (
    template: TemplateDocument,
    isGlobal: boolean
  ) => (
    <Card
      key={template.id}
      sx={{
        cursor: "pointer",
        border: 1,
        borderColor: "divider",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 2,
        },
      }}
      onClick={() =>
        activeMessageType && handleTemplateSelect(activeMessageType, template)
      }
    >
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {template.friendlyName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 1,
              }}
            >
              {template.types["twilio/text"]?.body ||
                t("messagesPlan.noPreviewAvailable")}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={
              isGlobal
                ? t("userRsvp.messagesPlan.globalTemplate")
                : t("userRsvp.messagesPlan.weddingTemplate")
            }
            color={isGlobal ? "secondary" : "primary"}
            variant="outlined"
          />
        </Stack>
      </CardContent>
    </Card>
  );

  const renderTemplateSelection = () => {
    if (!activeMessageType) return null;

    const filteredTemplates = getTemplatesForMessageType(activeMessageType);
    const hasTemplates =
      filteredTemplates.wedding.length > 0 ||
      filteredTemplates.global.length > 0;

    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("userRsvp.messagesPlan.selectTemplate")}
        </Typography>

        {!hasTemplates ? (
          <Alert severity="info">
            {t("userRsvp.messagesPlan.noTemplatesAvailable")}
          </Alert>
        ) : (
          <Stack spacing={3}>
            {/* Wedding Templates */}
            {filteredTemplates.wedding.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Chip
                    size="small"
                    label={t("userRsvp.messagesPlan.weddingTemplates")}
                    color="primary"
                  />
                  ({filteredTemplates.wedding.length})
                </Typography>
                <Stack spacing={1}>
                  {filteredTemplates.wedding.map((template) =>
                    renderTemplateCard(template, false)
                  )}
                </Stack>
              </Box>
            )}

            {/* Global Templates */}
            {filteredTemplates.global.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Chip
                    size="small"
                    label={t("userRsvp.messagesPlan.globalTemplates")}
                    color="secondary"
                  />
                  ({filteredTemplates.global.length})
                </Typography>
                <Stack spacing={1}>
                  {filteredTemplates.global.map((template) =>
                    renderTemplateCard(template, true)
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        )}

        <Button
          onClick={() => setActiveMessageType(null)}
          sx={{ mt: 2 }}
          variant="outlined"
        >
          {t("common.cancel")}
        </Button>
      </Paper>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>{t("userRsvp.messagesPlan.loadingTemplates")}</Typography>
      </Box>
    );
  }

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
          const isActive = activeMessageType === messageType.id;

          return (
            <Card
              key={messageType.id}
              sx={{
                border: 2,
                borderColor: isSelected
                  ? `${messageType.color}.main`
                  : "divider",
                backgroundColor: isActive ? "action.hover" : "background.paper",
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
                        <Chip
                          size="small"
                          icon={<CheckCircleIcon />}
                          label={selectedTemplate.friendlyName}
                          color={messageType.color}
                        />
                      </Box>
                    )}
                  </Box>

                  <Button
                    variant={isSelected ? "outlined" : "contained"}
                    color={messageType.color}
                    onClick={() => handleMessageTypeClick(messageType.id)}
                    disabled={isActive}
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

      {renderTemplateSelection()}

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
    </Box>
  );
};

export default MessagesPlanManager;
