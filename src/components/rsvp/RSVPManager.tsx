import React, { FC, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import {
  Description as DescriptionIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router";
import { useTranslation } from "../../localization/LocalizationContext";
import MessageTemplateTable from "./MessageTemplateTable";
import MessagesLogTab from "./MessagesLogTab";
import RSVPStatusTab from "./RSVPStatusTab";
import RSVPQuestionsManager from "./RSVPQuestionsManager";
import { useRSVPConfig } from "../../hooks/rsvp/useRSVPConfig";

const TabValue = {
  TEMPLATES: "templates",
  SEND: "send",
  MESSAGES_LOG: "messagesLog",
  RSVP_STATUS: "rsvpStatus",
  QUESTIONS: "questions",
} as const;

type TabValueType = (typeof TabValue)[keyof typeof TabValue];

const RSVPTabs = [
  {
    value: TabValue.RSVP_STATUS,
    icon: <AssessmentIcon />,
    labelKey: "rsvp.status",
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
    value: TabValue.MESSAGES_LOG,
    icon: <HistoryIcon />,
    labelKey: "rsvp.messagesLog",
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

  // Get tab from URL query param, default to TEMPLATES if not present or invalid
  const tabFromUrl = searchParams.get("tab") as TabValueType;
  const isValidTab = Object.values(TabValue).includes(tabFromUrl);

  // Only consider config as "not set" if we've actually fetched the data and it's null
  const isNoConfigSet =
    isRsvpConfigFetched && !isRsvpConfigLoading && rsvpConfig == null;
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
        {RSVPTabs.map((tab) => (
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

        {activeTab === TabValue.QUESTIONS && <RSVPQuestionsManager />}

        {activeTab === TabValue.TEMPLATES && <MessageTemplateTable />}

        {activeTab === TabValue.MESSAGES_LOG && <MessagesLogTab />}
      </Box>
    </Box>
  );
};

export default RSVPManager;
