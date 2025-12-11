import React, { useState } from "react";
import { Box } from "@mui/material";
import { useRSVPConfig } from "../../../hooks/rsvp";
import AutomationSetupDone from "./AutomationSetupDone";
import AutomationTimelineReview from "./AutomationTimelineReview";
import AutomationsDashboard from "./AutomationsDashboard/AutomationsDashboard";

const AutomationMessagesSchedulerContainer: React.FC = () => {
  const { data: rsvpConfig, isLoading: isLoadingRsvpConfig } = useRSVPConfig();
  const [showAllDone, setShowAllDone] = useState(false);

  if (isLoadingRsvpConfig) {
    return null;
  }

  // After full setup is complete, show the dashboard for managing automations
  if (rsvpConfig?.isSetupComplete) {
    return (
      <Box sx={{ height: "100%", overflow: "auto" }}>
        <AutomationsDashboard />
      </Box>
    );
  }

  // During setup: show completion screen if automation setup is done, otherwise show review
  const isAutomationSetupDone =
    showAllDone || rsvpConfig?.isAutomationSetupComplete;

  return (
    <Box sx={{ height: "100%", overflow: "auto" }}>
      {isAutomationSetupDone ? (
        <AutomationSetupDone />
      ) : (
        <AutomationTimelineReview onComplete={() => setShowAllDone(true)} />
      )}
    </Box>
  );
};

export default AutomationMessagesSchedulerContainer;
