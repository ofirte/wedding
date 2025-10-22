import React, { FC, useEffect } from "react";
import { Box, Tabs, Tab, CircularProgress, Typography } from "@mui/material";
import {
  Description as DescriptionIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useRSVPConfig } from "../../../hooks/rsvp/useRSVPConfig";
import UserRSVPManager from "./UserRSVPManager";
import RSVPStatusTab from "../RSVPStatusTab";
import RSVPQuestionsManager from "../RSVPQuestionsManager";
import TemplatesManager from "../TemplatesManager";
import SendAutomationsManager from "../SendAutomationsManager";
import MessagesLogTab from "../MessagesLogTab";
import RSVPFormBuilder from "./RSVPFormBuilder";
import MessagesPlanManager from "./MessagesPlanManager";
import AutomationScheduler from "./AutomationScheduler";

const TabValue = {
  RSVP_STATUS: "rsvpStatus",
  QUESTIONS: "questions",
  TEMPLATES: "templates",
  SEND_AUTOMATION: "sendAutomation",
  MESSAGES_LOG: "messagesLog",
} as const;

type TabValueType = (typeof TabValue)[keyof typeof TabValue];

const RSVPTabs = [
  {
    value: TabValue.RSVP_STATUS,
    icon: <AssessmentIcon />,
    labelKey: "rsvpStatusTab.title",
  },
  {
    value: TabValue.QUESTIONS,
    icon: <SettingsIcon />,
    labelKey: "rsvp.questions",
  },
  {
    value: TabValue.TEMPLATES,
    icon: <DescriptionIcon />,
    labelKey: "rsvp.templates",
  },
  {
    value: TabValue.SEND_AUTOMATION,
    icon: <ScheduleIcon />,
    labelKey: "rsvp.sendAutomations",
  },
] as const;

/**
 * UserRSVPWrapper - Conditional wrapper for RSVP management
 *
 * If setup is not complete: Shows the setup wizard (UserRSVPManager)
 * If setup is complete: Shows the management tabs interface
 */
const UserRSVPWrapper: FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    data: rsvpConfig,
    isLoading: isRsvpConfigLoading,
    isFetched: isRsvpConfigFetched,
  } = useRSVPConfig();

  // Get tab from URL query param, default to RSVP_STATUS if not present or invalid
  const tabFromUrl = searchParams.get("tab") as TabValueType;
  const isValidTab = Object.values(TabValue).includes(tabFromUrl);
  const activeTab = isValidTab ? tabFromUrl : TabValue.RSVP_STATUS;

  // Update URL when tab changes
  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: TabValueType
  ) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", newValue);
    setSearchParams(newSearchParams);
  };

  // Set initial tab in URL if not present
  useEffect(() => {
    if (!tabFromUrl || !isValidTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("tab", TabValue.RSVP_STATUS);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [tabFromUrl, isValidTab, searchParams, setSearchParams]);

  // Show loading while we're still fetching the initial data
  if (isRsvpConfigLoading || !isRsvpConfigFetched) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t("common.loading")}</Typography>
      </Box>
    );
  }

  // No config exists or setup is not complete - show setup wizard
  if (!rsvpConfig || !rsvpConfig.isSetupComplete) {
    return <UserRSVPManager />;
  }

  // Setup is complete - show tabs interface
  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="RSVP management tabs"
      >
        {RSVPTabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            iconPosition="start"
            label={t(tab.labelKey)}
          />
        ))}
      </Tabs>

      <Box sx={{ minHeight: 400 }}>
        {activeTab === TabValue.RSVP_STATUS && <RSVPStatusTab />}
        {activeTab === TabValue.QUESTIONS && (
          <RSVPFormBuilder onComplete={() => {}} isCompleted={true} />
        )}
        {activeTab === TabValue.TEMPLATES && (
          <MessagesPlanManager onComplete={() => {}} />
        )}
        {activeTab === TabValue.SEND_AUTOMATION && <AutomationScheduler />}
      </Box>
    </Box>
  );
};

export default UserRSVPWrapper;
