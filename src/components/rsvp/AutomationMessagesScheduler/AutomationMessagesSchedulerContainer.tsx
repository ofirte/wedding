import React, { useState, useEffect, useMemo } from "react";
import { Grid, Box, Typography } from "@mui/material";
import { ScheduleOutlined } from "@mui/icons-material";
import AutomationsSidebar from "./AutomationsSidebar";
import AutomationDetails from "./AutomationDetails";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useRSVPConfig, useSendAutomations } from "../../../hooks/rsvp";
import { useUpdateRsvpConfig } from "src/hooks/rsvp/useUpdateRsvpConfig";
import { useParams } from "react-router";
import { SendMessagesAutomation } from "@shared/dist";
import AutomationSetupDone from "./AutomationSetupDone";
import { set } from "lodash";

const AutomationMessagesSchedulerContainer: React.FC = () => {
  const { t } = useTranslation();
  const [selectedAutomationId, setSelectedAutomationId] = useState<
    string | null
  >(null);
  const { data: rsvpConfig, isLoading: isLoadingRsvpConfig } = useRSVPConfig();
  const { weddingId } = useParams();
  const { data: automations = [], isLoading: isLoadingAutomation } =
    useSendAutomations();
  const { mutate: updateRsvpConfig } = useUpdateRsvpConfig();
  const [showAllDone, setShowAllDone] = useState(false);
  // Auto-select first inactive automation on load
  useEffect(() => {
    if (isLoadingRsvpConfig || isLoadingAutomation) return;

    if (!selectedAutomationId && automations.length > 0) {
      if (!rsvpConfig?.isAutomationSetupComplete) {
        const nextInactiveAutomation = getNextInactiveAutomation(automations);
        if (nextInactiveAutomation) {
          setSelectedAutomationId(nextInactiveAutomation?.id);
        } else {
          setShowAllDone(true);
        }
      } else {
        if (
          !!rsvpConfig?.isAutomationSetupComplete &&
          !rsvpConfig.isSetupComplete
        ) {
          setShowAllDone(true);
        } else {
          setSelectedAutomationId(automations[0].id);
        }
      }
    }
  }, [automations, selectedAutomationId]);

  const handleSelectAutomation = (automationId: string) => {
    setSelectedAutomationId(automationId);
  };

  const getNextInactiveAutomation = (
    automations: SendMessagesAutomation[]
  ): SendMessagesAutomation | undefined => {
    const automation = automations
      .sort(
        (a, b) =>
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime()
      )
      .find(
        (automation) =>
          !automation.isActive && automation.id !== selectedAutomationId
      );
    console.log(automation, selectedAutomationId);
    return automation;
  };

  const handleApproveAutomation = () => {
    // Move to next inactive automation
    const nextInactiveAutomation = getNextInactiveAutomation(automations);

    if (nextInactiveAutomation) {
      setSelectedAutomationId(nextInactiveAutomation.id);
    } else {
      updateRsvpConfig({
        id: weddingId!,
        data: {
          isAutomationSetupComplete: true,
        },
      });
      setShowAllDone(true);
    }
  };
  return (
    <Grid container sx={{ height: "100%" }}>
      {/* Sidebar - Automations List */}
      <Grid size={{ xs: 12, md: 4 }} sx={{ height: "100%" }}>
        <AutomationsSidebar
          onSelectAutomation={(automation) =>
            handleSelectAutomation(automation.id)
          }
          selectedAutomationId={selectedAutomationId || undefined}
        />
      </Grid>

      {/* Main Content - Message Scheduler */}
      <Grid
        size={{ xs: 12, md: 8 }}
        sx={{
          borderLeft: { xs: "none", md: "1px solid" },
          borderColor: "divider",
          height: "100%",
          p: 3,
        }}
      >
        {showAllDone && !selectedAutomationId ? (
          <AutomationSetupDone />
        ) : selectedAutomationId ? (
          <AutomationDetails
            automationId={selectedAutomationId}
            onClose={() => setSelectedAutomationId(null)}
            onApproveAutomation={handleApproveAutomation}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <ScheduleOutlined sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              {t("rsvp.selectAutomationToEdit") ||
                "Select an automation to configure"}
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 400 }}>
              {t("rsvp.selectAutomationDescription") ||
                "Choose an automation from the sidebar to edit its schedule, template, and settings."}
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default AutomationMessagesSchedulerContainer;
