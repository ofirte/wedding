import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useLeads } from "../../hooks/leads";
import { Lead } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import LeadsTable from "./LeadsTable";
import LeadActivityPanel from "./LeadActivityPanel";
import LeadsStats from "./LeadsStats";

const LeadsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: leads = [], isLoading, error } = useLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);

  const handleOpenActivity = (lead: Lead) => {
    setSelectedLead(lead);
    setActivityPanelOpen(true);
  };

  const handleClosePanel = () => {
    setActivityPanelOpen(false);
    setSelectedLead(null);
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            {t("leads.messages.errorLoading")}: {(error as Error).message}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t("leads.title")}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <LeadsStats leads={leads} />

        {/* Leads Table */}
        <Box sx={{ mt: 2}}>
          <LeadsTable leads={leads} onOpenActivity={handleOpenActivity} />
        </Box>

        {/* Activity Panel */}
        <LeadActivityPanel
          lead={selectedLead}
          open={activityPanelOpen}
          onClose={handleClosePanel}
        />
      </Box>
    </Container>
  );
};

export default LeadsPage;
