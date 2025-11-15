import React from "react";
import { Box, Typography, Paper, Avatar, Stack, Chip } from "@mui/material";
import { WhatsApp, Schedule } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { Invitee, TemplateDocument, Wedding } from "@wedding-plan/types";
import { format } from "date-fns";
import { enUS, he } from "date-fns/locale";
import { useWeddingDetails } from "../../hooks/wedding/useWeddingDetails";
import {
  populateVariables,
  replaceVariables,
} from "../../utils/messageVariables";

interface WhatsAppTemplatePreviewProps {
  template: TemplateDocument;
  scheduledTime?: Date;
  automationName?: string;
  showHeader?: boolean;
}

const WhatsAppTemplatePreview: React.FC<WhatsAppTemplatePreviewProps> = ({
  template,
  scheduledTime,
  automationName,
  showHeader = true,
}) => {
  const { language } = useTranslation();
  const locale = language === "he" ? he : enUS;
  const isRtl = language === "he";
  const templateText = template.types?.["twilio/text"]?.body || "";
  // Get real wedding data but use dummy guest
  const { data: wedding } = useWeddingDetails();
  const dummyWedding: Wedding = {
    id: "dummy-wedding",
    brideName: language === "he" ? "שרה לוי" : "Sarah Levi",
    groomName: language === "he" ? "יוסי כהן" : "Yossi Cohen",
    name: "",
    venueName: language === "he" ? "גן האירועים שלנו" : "Our Event Garden",
    date: new Date(),
    createdAt: new Date(),
    startTime: "18:00",
    userIds: [],
  };
  const weddingData: Wedding = wedding || dummyWedding;
  // Create dummy guest for preview
  const dummyGuest: Invitee = {
    id: "preview-guest",
    name: language === "he" ? "דנה כהן" : "Dana Cohen",
    cellphone: "+972-50-123-4567",
    rsvp: "",
    percentage: 0,
    side: "",
    relation: "",
    amount: 0,
    amountConfirm: 0,
  };
  const variables = populateVariables(dummyGuest, weddingData);
  const message = replaceVariables(templateText, variables);

  return (
    <Paper
      elevation={2}
      sx={{
        maxWidth: 580,
        height: 300, // Fixed height
        mx: "auto",
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: "#e5ddd5", // More authentic WhatsApp chat background
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showHeader && (
        <Box
          sx={{
            backgroundColor: "#128c7e", // Darker WhatsApp green
            color: "white",
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Avatar
            sx={{
              backgroundColor: "rgba(255,255,255,0.15)",
              width: 36,
              height: 36,
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            <WhatsApp fontSize="small" />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              noWrap
              sx={{ fontSize: "0.9rem" }}
            >
              {language === "he" ? "מערכת החתונה" : "Wedding System"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontSize: "0.75rem" }}
            >
              {language === "he" ? "מקוון" : "online"}
            </Typography>
          </Box>
          {scheduledTime && (
            <Chip
              icon={<Schedule sx={{ fontSize: "0.8rem" }} />}
              label={format(scheduledTime, "MMM d, HH:mm", { locale })}
              size="small"
              sx={{
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "white",
                fontSize: "0.7rem",
                "& .MuiChip-icon": { color: "white" },
              }}
            />
          )}
        </Box>
      )}

      <Box
        sx={{
          p: 2.5,
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: "2px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "2px",
          },
        }}
      >
        {/* Message timestamp header */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Chip
            label={format(new Date(), "MMM d, yyyy", { locale })}
            size="small"
            sx={{
              backgroundColor: "rgba(0,0,0,0.06)",
              color: "rgba(0,0,0,0.6)",
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Message bubble */}
        <Box
          sx={{
            display: "flex",
            justifyContent: isRtl ? "flex-start" : "flex-end",
            mb: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              backgroundColor: "#dcf8c6", // WhatsApp outgoing message green
              borderRadius: "18px",
              borderBottomRightRadius: isRtl ? "18px" : "4px",
              borderBottomLeftRadius: isRtl ? "4px" : "18px",
              p: 2,
              maxWidth: "80%",
              position: "relative",
              boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
              "&::after": !isRtl
                ? {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    right: "-6px",
                    width: 0,
                    height: 0,
                    border: "6px solid transparent",
                    borderTopColor: "#dcf8c6",
                    borderBottom: "none",
                    borderRight: "none",
                  }
                : {},
              "&::before": isRtl
                ? {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "-6px",
                    width: 0,
                    height: 0,
                    border: "6px solid transparent",
                    borderTopColor: "#dcf8c6",
                    borderBottom: "none",
                    borderLeft: "none",
                  }
                : {},
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.4,
                fontSize: "0.9rem",
                color: "#303030",
              }}
            >
              {message}
            </Typography>

            {/* Message timestamp and status */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mt: 1,
                gap: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(0,0,0,0.45)",
                  fontSize: "0.7rem",
                  lineHeight: 1,
                }}
              >
                {format(new Date(), "HH:mm", { locale })}
              </Typography>
              {/* WhatsApp double checkmarks */}
              <Box
                sx={{
                  color: "#4fc3f7",
                  fontSize: "0.8rem",
                  lineHeight: 1,
                }}
              >
                ✓✓
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Template info footer */}
        <Box sx={{ textAlign: "center", opacity: 0.7 }}>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
          >
            <Chip
              size="small"
              label={template?.language?.toUpperCase() || "EN"}
              sx={{
                fontSize: "0.65rem",
                height: 20,
                backgroundColor: "rgba(0,0,0,0.05)",
                color: "rgba(0,0,0,0.6)",
              }}
            />
            {template?.category && (
              <>
                <Box sx={{ color: "rgba(0,0,0,0.3)" }}>•</Box>
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.65rem", color: "rgba(0,0,0,0.6)" }}
                >
                  {template.category}
                </Typography>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default WhatsAppTemplatePreview;
