import { SendMessagesAutomation } from "@wedding-plan/types";
import { FC, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useUpdateSendAutomation } from "../../../hooks/rsvp";
import SelectAutomationTemplate from "./SelectAutomationTemplate";
import TimeSentSelector from "./TimeSentSelector";

type SetupAutomationProps = {
  automation: SendMessagesAutomation;
  onApproveAutomation?: () => void;
};

const SetupAutomation: FC<SetupAutomationProps> = ({
  automation,
  onApproveAutomation,
}) => {
  const { t } = useTranslation();
  const [isTemplateApproved, setIsTemplateApproved] = useState(
    automation.messageTemplateId ? true : false
  );
  const [isTimeApproved, setIsTimeApproved] = useState(
    automation.scheduledTime ? true : false
  );
  const [manualTemplateExpanded, setManualTemplateExpanded] = useState<
    boolean | null
  >(null);
  const [manualTimeExpanded, setManualTimeExpanded] = useState<boolean | null>(
    null
  );

  const { mutate: updateAutomation, isPending: isUpdating } =
    useUpdateSendAutomation({
      onSuccess: (_, variables) => {
        if (variables.isActive) onApproveAutomation?.();
      },
    });

  // Compute accordion states with manual override support
  const autoTemplateExpanded =
    !isTemplateApproved || (!isTemplateApproved && isTimeApproved);
  const autoTimeExpanded = isTemplateApproved;

  const templateAccordionExpanded =
    manualTemplateExpanded !== null
      ? manualTemplateExpanded
      : autoTemplateExpanded;
  const timeAccordionExpanded =
    manualTimeExpanded !== null ? manualTimeExpanded : autoTimeExpanded;

  const handleApproveTemplate = (templateId: string) => {
    if (!templateId) return;

    setIsTemplateApproved(true);
    // Reset manual overrides to allow auto-expansion
    setManualTemplateExpanded(null);
    setManualTimeExpanded(null);

    // Update automation with template information
    updateAutomation({
      id: automation.id,
      messageTemplateId: templateId,
    });
  };

  const handleApproveTimeSent = (sendingTime: Date) => {
    if (!sendingTime) return;

    setIsTimeApproved(true);
    // Reset manual overrides to allow auto-expansion
    setManualTemplateExpanded(null);
    setManualTimeExpanded(false);

    // Update automation with scheduling information (convert to UTC)
    updateAutomation({
      id: automation.id,
      scheduledTime: sendingTime,
    });
  };

  const handleApproveAutomation = () => {
    if (!isTemplateApproved || !isTimeApproved) return;

    updateAutomation({
      id: automation.id,
      isActive: true,
    });
  };

  const handleTemplateAccordionChange = (
    _: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setManualTemplateExpanded(isExpanded);
  };

  const handleTimeAccordionChange = (
    _: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setManualTimeExpanded(isExpanded);
  };

  return (
    <Box sx={{ mx: "auto" }}>
      <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              p: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t("rsvp.setupAutomation")}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t("rsvp.configureAutomatedMessageSettings")}
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Template Selection Accordion */}
            <Accordion
              elevation={0}
              expanded={templateAccordionExpanded}
              onChange={handleTemplateAccordionChange}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                mb: 2,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: "8px 8px 0 0",
                  minHeight: 60,
                  "&.Mui-expanded": {
                    minHeight: 60,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <MessageIcon color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight="medium">
                      {t("rsvp.selectMessageTemplate")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("rsvp.chooseTemplateForAutomatedMessages")}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: 0,
                  maxHeight: "50vh", // Use viewport height to adapt to available space
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(0,0,0,0.3)",
                    borderRadius: "3px",
                  },
                }}
              >
                <SelectAutomationTemplate
                  onSelectTemplate={handleApproveTemplate}
                />
              </AccordionDetails>
            </Accordion>

            {/* Scheduling Accordion */}
            <Accordion
              elevation={0}
              expanded={timeAccordionExpanded}
              onChange={handleTimeAccordionChange}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                mb: 3,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: "8px 8px 0 0",
                  minHeight: 60,
                  "&.Mui-expanded": {
                    minHeight: 60,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ScheduleIcon color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight="medium">
                      {t("rsvp.scheduleDeliveryTime")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("rsvp.setAutomatedMessageSendTime")}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: 3,
                  maxHeight: "30vh", // Use viewport height to adapt to available space
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(0,0,0,0.2)",
                    borderRadius: "3px",
                  },
                }}
              >
                <TimeSentSelector
                  onSelectTime={handleApproveTimeSent}
                  initialValue={
                    automation.scheduledTime
                      ? new Date(automation.scheduledTime)
                      : undefined
                  }
                />
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 3 }} />

            {/* Approve Button */}
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleApproveAutomation}
                disabled={!isTemplateApproved || !isTimeApproved || isUpdating}
                startIcon={<CheckCircleIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                  },
                  "&:disabled": {
                    background: "grey.300",
                    color: "grey.500",
                  },
                }}
              >
                {t("rsvp.approveScheduleAutomation")}
              </Button>

              {(!isTemplateApproved || !isTimeApproved) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, fontStyle: "italic" }}
                >
                  {t("rsvp.approveBothTemplateAndSchedule")}
                </Typography>
              )}

              {isUpdating && (
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ mt: 1, fontStyle: "italic" }}
                >
                  {t("rsvp.updatingAutomation")}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SetupAutomation;
