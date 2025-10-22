import React from "react";
import { Box, Typography, Avatar, Stack } from "@mui/material";

interface PreviewWhatsappMessageProps {
  message: string;
  senderName?: string;
  timestamp?: string;
}

const PreviewWhatsappMessage: React.FC<PreviewWhatsappMessageProps> = ({
  message,
  senderName = "Wedding Planner",
  timestamp,
}) => {

  // Format current time as default timestamp
  const defaultTimestamp = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Box
      sx={{
        backgroundColor: "#e3f2fd", // WhatsApp-like background
        p: 2,
        borderRadius: 2,
        maxWidth: "400px",
        mx: "auto",
        position: "relative",
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      {/* WhatsApp Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "primary.main",
            fontSize: "0.875rem",
          }}
        >
          {senderName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="body2" fontWeight="500" color="text.primary">
          {senderName}
        </Typography>
      </Stack>

      {/* Message Bubble */}
      <Box
        sx={{
          backgroundColor: "#dcf8c6", // WhatsApp sender bubble color
          borderRadius: "18px 18px 4px 18px",
          p: 2,
          position: "relative",
          boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            right: -6,
            width: 0,
            height: 0,
            border: "6px solid transparent",
            borderTopColor: "#dcf8c6",
            borderRight: 0,
            borderBottom: 0,
            marginLeft: "-6px",
            marginBottom: "-6px",
          },
        }}
      >
        {/* Message Text */}
        <Typography
          variant="body1"
          sx={{
            color: "#303030",
            fontSize: "14px",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            mb: 1,
          }}
        >
          {message}
        </Typography>

        {/* Timestamp and Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 0.5,
            mt: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#667781",
              fontSize: "11px",
              lineHeight: 1,
            }}
          >
            {timestamp || defaultTimestamp}
          </Typography>
          {/* WhatsApp checkmarks */}
          <Box
            sx={{
              color: "#4fc3f7",
              fontSize: "12px",
              lineHeight: 1,
              ml: 0.5,
            }}
          >
            ✓✓
          </Box>
        </Box>
      </Box>

      {/* WhatsApp-style typing indicator decoration */}
      <Box
        sx={{
          mt: 1,
          display: "flex",
          justifyContent: "center",
          opacity: 0.6,
        }}
      >
        <Typography variant="caption" color="text.secondary" fontSize="10px">
          Preview Message
        </Typography>
      </Box>
    </Box>
  );
};

export default PreviewWhatsappMessage;
