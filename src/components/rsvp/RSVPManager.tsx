import React, { FC, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import {
  Description as DescriptionIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router";
import { useTranslation } from "../../localization/LocalizationContext";
import MessageTemplateTable from "./MessageTemplateTable";
import MessagesLogTab from "./MessagesLogTab";
import RSVPStatusTab from "./RSVPStatusTab";

const TabValue = {
  TEMPLATES: "templates",
  SEND: "send",
  MESSAGES_LOG: "messagesLog",
  RSVP_STATUS: "rsvpStatus",
} as const;

type TabValue = (typeof TabValue)[keyof typeof TabValue];

const RSVPTabs = [
  {
    value: TabValue.RSVP_STATUS,
    icon: <AssessmentIcon />,
    labelKey: "rsvp.status",
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
  const { t } = useTranslation();

  // Get tab from URL query param, default to TEMPLATES if not present or invalid
  const tabFromUrl = searchParams.get("tab") as TabValue;
  const isValidTab = Object.values(TabValue).includes(tabFromUrl);
  const activeTab = isValidTab ? tabFromUrl : TabValue.RSVP_STATUS;

  // Update URL when tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
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
  }, []);

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
        {activeTab === TabValue.TEMPLATES && <MessageTemplateTable />}

        {activeTab === TabValue.MESSAGES_LOG && <MessagesLogTab />}

        {activeTab === TabValue.RSVP_STATUS && <RSVPStatusTab />}
      </Box>
    </Box>
  );
};

export default RSVPManager;
