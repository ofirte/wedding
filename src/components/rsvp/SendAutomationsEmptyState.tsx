import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";

interface SendAutomationsEmptyStateProps {
  onCreateClick: () => void;
}

/**
 * SendAutomationsEmptyState - Empty state with plus button for creating first automation
 *
 * Tells the story: "You haven't created any send automations yet"
 */
const SendAutomationsEmptyState: React.FC<SendAutomationsEmptyStateProps> = ({
  onCreateClick,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          textAlign="center"
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
            onClick={onCreateClick}
          >
            <AddIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>
          
          <Typography variant="h5" gutterBottom>
            {t("rsvp.noAutomationsTitle")}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            {t("rsvp.noAutomationsDescription")}
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
            size="large"
          >
            {t("rsvp.createFirstAutomation")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SendAutomationsEmptyState;