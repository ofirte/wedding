import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { CheckCircle, Error, Schedule, Warning } from "@mui/icons-material";
import { format } from "date-fns";
import { useTranslation } from "../../../../localization/LocalizationContext";
import { SendMessagesAutomation } from "@wedding-plan/types";

interface UserOverviewAutomationResultsProps {
  open: boolean;
  onClose: () => void;
  automation: SendMessagesAutomation | null;
}

export const UserOverviewAutomationResults: React.FC<
  UserOverviewAutomationResultsProps
> = ({ open, onClose, automation }) => {
  const { t } = useTranslation();

  if (!automation) return null;

  const getStatusIcon = () => {
    const stats = automation.completionStats;
    switch (automation.status) {
      case "completed":
        return stats?.failedMessages === 0 ? (
          <CheckCircle sx={{ fontSize: 48, color: "success.main" }} />
        ) : (
          <Warning sx={{ fontSize: 48, color: "warning.main" }} />
        );
      case "inProgress":
        return <Schedule sx={{ fontSize: 48, color: "info.main" }} />;
      case "failed":
        return <Error sx={{ fontSize: 48, color: "error.main" }} />;
      case "pending":
        return <Schedule sx={{ fontSize: 48, color: "info.main" }} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    const stats = automation.completionStats;
    switch (automation.status) {
      case "completed":
        return stats?.failedMessages === 0 ? "success" : "warning";
      case "inProgress":
      case "pending":
        return "info";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const renderStatusContent = () => {
    const stats = automation.completionStats;

    switch (automation.status) {
      case "completed":
        if (stats?.failedMessages === 0) {
          return (
            <Card
              elevation={0}
              sx={{
                bgcolor: "success.light",
                color: "success.contrastText",
                mb: 3,
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Box sx={{ mb: 2 }}>{getStatusIcon()}</Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
                  {t("automation.allMessagesSent")}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {t("automation.successMessage", {
                    count: stats?.successfulMessages || 0,
                  })}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Chip
                    avatar={
                      <Avatar sx={{ bgcolor: "success.main", color: "white" }}>
                        ✓
                      </Avatar>
                    }
                    label={`${stats?.successfulMessages || 0} הודעות נשלחו`}
                    sx={{ bgcolor: "white", color: "success.main" }}
                  />
                  <Chip
                    label={format(
                      new Date(stats?.completedAt || ""),
                      "dd/MM/yyyy"
                    )}
                    variant="outlined"
                    sx={{ bgcolor: "white", borderColor: "success.main" }}
                  />
                </Box>
              </CardContent>
            </Card>
          );
        } else {
          return (
            <Card
              elevation={0}
              sx={{
                bgcolor: "warning.light",
                color: "warning.contrastText",
                mb: 3,
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Box sx={{ mb: 2 }}>{getStatusIcon()}</Box>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
                  {t("automation.mostMessagesSent")}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {t("automation.partialSuccessMessage", {
                    successful: stats?.successfulMessages || 0,
                    failed: stats?.failedMessages || 0,
                  })}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                  {t("automation.issuesExplanation")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Chip
                    avatar={
                      <Avatar sx={{ bgcolor: "success.main", color: "white" }}>
                        ✓
                      </Avatar>
                    }
                    label={`${stats?.successfulMessages || 0} הצליחו`}
                    sx={{ bgcolor: "white", color: "success.main" }}
                  />
                  <Chip
                    avatar={
                      <Avatar sx={{ bgcolor: "error.main", color: "white" }}>
                        ✗
                      </Avatar>
                    }
                    label={`${stats?.failedMessages || 0} נכשלו`}
                    sx={{ bgcolor: "white", color: "error.main" }}
                  />
                  <Chip
                    label={format(
                      new Date(stats?.completedAt || ""),
                      "dd/MM/yyyy"
                    )}
                    variant="outlined"
                    sx={{ bgcolor: "white", borderColor: "warning.main" }}
                  />
                </Box>
              </CardContent>
            </Card>
          );
        }

      case "inProgress":
        return (
          <Card
            elevation={0}
            sx={{ bgcolor: "info.light", color: "info.contrastText", mb: 3 }}
          >
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Box sx={{ mb: 2 }}>{getStatusIcon()}</Box>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
                {t("automation.messagesBeingSent")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("automation.inProgressMessage")}
              </Typography>
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: "info.main", color: "white" }}>
                    ⏳
                  </Avatar>
                }
                label="בתהליך עכשיו"
                sx={{ bgcolor: "white", color: "info.main" }}
              />
            </CardContent>
          </Card>
        );

      case "failed":
        return (
          <Card
            elevation={0}
            sx={{ bgcolor: "error.light", color: "error.contrastText", mb: 3 }}
          >
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Box sx={{ mb: 2 }}>{getStatusIcon()}</Box>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
                {t("automation.somethingWentWrong")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {t("automation.failedMessage")}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                {t("automation.contactSupport")}
              </Typography>
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: "error.main", color: "white" }}>
                    ⚠
                  </Avatar>
                }
                label="יצירת קשר עם התמיכה"
                sx={{ bgcolor: "white", color: "error.main" }}
              />
            </CardContent>
          </Card>
        );

      case "pending":
        return (
          <Card
            elevation={0}
            sx={{ bgcolor: "info.light", color: "info.contrastText", mb: 3 }}
          >
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <Box sx={{ mb: 2 }}>{getStatusIcon()}</Box>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
                {t("automation.messageScheduled")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("automation.willBeSentOn")}
              </Typography>
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: "info.main", color: "white" }}>
                    📅
                  </Avatar>
                }
                label={format(
                  new Date(automation.scheduledTime),
                  "dd/MM/yyyy HH:mm"
                )}
                sx={{ bgcolor: "white", color: "info.main" }}
              />
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "background.default",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          pb: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
          📊 {automation.name}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {renderStatusContent()}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            💡 תוכל לראות עוד פרטים בלוח הבקרה של אישורי ההגעה
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color={getStatusColor() as any}
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1.5,
            fontWeight: "bold",
          }}
        >
          {t("common.close")} ✨
        </Button>
      </DialogActions>
    </Dialog>
  );
};
