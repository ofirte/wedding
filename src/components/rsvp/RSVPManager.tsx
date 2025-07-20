import React, { FC, useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import {
  Description as DescriptionIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import MessageTemplateTable from "./MessageTemplateTable";

const TabValue = {
  TEMPLATES: "templates",
  SEND: "send",
} as const;

type TabValue = (typeof TabValue)[keyof typeof TabValue];

const RSVPTabs = [
  {
    value: TabValue.TEMPLATES,
    icon: <DescriptionIcon />,
    labelKey: "rsvp.templates",
  },
  {
    value: TabValue.SEND,
    icon: <SendIcon />,
    labelKey: "rsvp.sendRSVP",
  },
] as const;

const RSVPManager: FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>(TabValue.TEMPLATES);
  const { t } = useTranslation();
  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

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

        {activeTab === TabValue.SEND && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("rsvp.sendRSVP")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send messages interface will be displayed here
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RSVPManager;
