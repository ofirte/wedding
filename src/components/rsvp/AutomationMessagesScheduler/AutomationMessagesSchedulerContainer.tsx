import React, { useState, useEffect, useMemo } from "react";
import { Grid, Box, Typography } from "@mui/material";
import { ScheduleOutlined } from "@mui/icons-material";
import AutomationsSidebar from "./AutomationsSidebar";
import AutomationDetails from "./AutomationDetails";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useSendAutomations, useAutomation } from "../../../hooks/rsvp";

const AutomationMessagesSchedulerContainer: React.FC = () => {
  const { t } = useTranslation();
  const [selectedAutomationId, setSelectedAutomationId] = useState<
    string | null
  >(null);
  const { data: automations = [] } = useSendAutomations();

  // Get sorted inactive automations
  const inactiveAutomations = automations
    .filter((auto) => !auto.isActive)
    .sort(
      (a, b) =>
        new Date(a.scheduledTime).getTime() -
        new Date(b.scheduledTime).getTime()
    );

  // Auto-select first inactive automation on load
  useEffect(() => {
    if (!selectedAutomationId && inactiveAutomations.length > 0) {
      setSelectedAutomationId(inactiveAutomations[0].id);
    }
  }, [inactiveAutomations, selectedAutomationId]);

  const handleSelectAutomation = (automationId: string) => {
    setSelectedAutomationId(automationId);
  };

  const handleApproveAutomation = () => {
    // Move to next inactive automation
    const currentIndex = inactiveAutomations.findIndex(
      (auto) => auto.id === selectedAutomationId
    );
    const nextIndex = currentIndex + 1;

    if (nextIndex < inactiveAutomations.length) {
      setSelectedAutomationId(inactiveAutomations[nextIndex].id);
    } else {
      // All automations approved, stay on last one or clear selection
      setSelectedAutomationId(null);
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
        {selectedAutomationId ? (
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
