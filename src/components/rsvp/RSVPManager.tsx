import React, { FC, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import {
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router";
import { useTranslation } from "../../localization/LocalizationContext";
import MessagesLogTab from "./MessagesLogTab";
import RSVPStatusTab from "./rsvpStatus/RSVPStatusTab";
import { useRSVPConfig } from "../../hooks/rsvp/useRSVPConfig";
import RsvpFormManagementContainer from "./RsvpFormManagementV2/rsvpFormManagementContainer";
import AutomationMessagesSchedulerContainer from "./AutomationMessagesScheduler/AutomationMessagesSchedulerContainer";
import { useIsAdmin } from "../../hooks/auth/useUserClaims";

const TabValue = {
  TEMPLATES: "templates",
  SEND: "send",
  SEND_AUTOMATION: "sendAutomation",
  MESSAGES_LOG: "messagesLog",
  RSVP_STATUS: "rsvpStatus",
  QUESTIONS: "questions",
} as const;

type TabValueType = (typeof TabValue)[keyof typeof TabValue];

const getRSVPTabs = (isAdmin: boolean) =>
  [
    {
      value: TabValue.RSVP_STATUS,
      icon: <AssessmentIcon />,
      labelKey: "rsvp.status",
      isHidden: false,
    },
    {
      value: TabValue.QUESTIONS,
      icon: <SettingsIcon />,
      labelKey: "rsvp.questions",
      isHidden: false,
    },
    {
      value: TabValue.SEND_AUTOMATION,
      icon: <ScheduleIcon />,
      labelKey: "rsvp.sendAutomations",
      isHidden: false,
    },
    {
      value: TabValue.MESSAGES_LOG,
      icon: <HistoryIcon />,
      labelKey: "rsvp.messagesLog",
      isHidden: !isAdmin,
    },
  ] as const;

const RSVPManager: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    data: rsvpConfig,
    isLoading: isRsvpConfigLoading,
    isFetched: isRsvpConfigFetched,
  } = useRSVPConfig();
  const { t } = useTranslation();
  const { isAdmin } = useIsAdmin();

  // Get tabs with isHidden computed based on user role
  const rsvpTabs = getRSVPTabs(isAdmin);

  // Filter tabs based on user role
  const visibleTabs = rsvpTabs.filter((tab) => !tab.isHidden);

  // Get tab from URL query param, default to TEMPLATES if not present or invalid
  const tabFromUrl = searchParams.get("tab") as TabValueType;
  const isValidTab = visibleTabs.some((tab) => tab.value === tabFromUrl);

  // Only consider config as "not set" if we've actually fetched the data and it's null
  const isNoConfigSet =
    isRsvpConfigFetched && !isRsvpConfigLoading && rsvpConfig === null;

  const activeTab = isNoConfigSet
    ? TabValue.QUESTIONS
    : isValidTab
    ? tabFromUrl
    : TabValue.RSVP_STATUS;
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
    if (tabFromUrl !== TabValue.QUESTIONS && isNoConfigSet) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("tab", TabValue.QUESTIONS);
      setSearchParams(newSearchParams, { replace: true });
    }
    if (!tabFromUrl || !isValidTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("tab", TabValue.RSVP_STATUS);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [tabFromUrl, isValidTab, searchParams, setSearchParams, isNoConfigSet]);

  // Show loading while we're still fetching the initial data
  if (isRsvpConfigLoading || !isRsvpConfigFetched) {
    return <div>Loading...</div>;
  }
  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="RSVP management tabs"
      >
        {visibleTabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            iconPosition="start"
            label={t(tab.labelKey)}
            disabled={tab.value !== TabValue.QUESTIONS && isNoConfigSet}
          />
        ))}
      </Tabs>

      <Box sx={{ minHeight: 400 }}>
        {activeTab === TabValue.RSVP_STATUS && <RSVPStatusTab />}

        {activeTab === TabValue.QUESTIONS && <RsvpFormManagementContainer />}
        {activeTab === TabValue.SEND_AUTOMATION && (
          <AutomationMessagesSchedulerContainer />
        )}
        {activeTab === TabValue.MESSAGES_LOG && <MessagesLogTab />}
      </Box>
    </Box>
  );
};

export default RSVPManager;
