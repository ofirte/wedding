import React from "react";
import { Column } from "../common/DSTable";
import { Chip, Box, Typography } from "@mui/material";
import { ContentInsight } from "../../api/rsvp/rsvpApi";

// Extend ContentInsight to include id for DSTable compatibility
export type MessageTemplateRow = ContentInsight & {
  id: string;
  sid: string;
  friendlyName: string;
  language: string;
  dateCreated: Date | string;
  variables?: Record<string, any>;
  types?: Record<string, any>;
};

// Helper function to extract body text from template types
const getTemplateBody = (
  template: ContentInsight,
  t: (key: string) => string
): string => {
  if (!template.types) return t("common.noBodyAvailable");

  // Look for WhatsApp template body
  const whatsappType =
    template.types["twilio/text"] || template.types["whatsapp"];
  if (
    whatsappType &&
    typeof whatsappType === "object" &&
    whatsappType !== null
  ) {
    const body = (whatsappType as any).body;
    if (body) return body;
  }

  // Fallback to any available body
  const firstType = Object.values(template.types)[0];
  if (firstType && typeof firstType === "object" && "body" in firstType) {
    return (firstType as any).body || t("common.noBodyAvailable");
  }

  return t("common.noBodyAvailable");
};

// Helper function to extract variables from template
const getTemplateVariables = (template: ContentInsight): string[] => {
  if (!template.variables || typeof template.variables !== "object") {
    return [];
  }

  return Object.keys(template.variables);
};

// Helper function to format date
const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date.toString();
  }
};

export const createMessageTemplateColumns = (
  t: (key: string) => string
): Column<MessageTemplateRow>[] => [
  {
    id: "name",
    label: t("rsvp.dateCreated"),
    sortable: true,
    render: (template: MessageTemplateRow) => (
      <Box>
        <Typography variant="body2" fontWeight="medium">
          {template.friendlyName || t("common.unnamedTemplate")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {template.language || t("common.unknown")}
        </Typography>
      </Box>
    ),
    sortFn: (a, b) =>
      (a.friendlyName || "").localeCompare(b.friendlyName || ""),
  },
  {
    id: "body",
    label: t("rsvp.messageBody"),
    sortable: false,
    render: (template: MessageTemplateRow) => (
      <Typography
        variant="body2"
        sx={{
          maxWidth: "300px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={getTemplateBody(template, t)}
      >
        {getTemplateBody(template, t)}
      </Typography>
    ),
  },
  {
    id: "variables",
    label: t("rsvp.variables"),
    sortable: false,
    render: (template: MessageTemplateRow) => {
      const variables = getTemplateVariables(template);

      if (variables.length === 0) {
        return (
          <Typography variant="caption" color="text.secondary">
            {t("common.noVariables")}
          </Typography>
        );
      }

      return (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            maxWidth: "200px",
          }}
        >
          {variables.slice(0, 3).map((variable, index) => (
            <Chip
              key={index}
              label={variable}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.75rem", height: "20px" }}
            />
          ))}
          {variables.length > 3 && (
            <Chip
              label={`+${variables.length - 3}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.75rem", height: "20px" }}
            />
          )}
        </Box>
      );
    },
  },
  {
    id: "createdAt",
    label: "Created",
    sortable: true,
    render: (template: MessageTemplateRow) => (
      <Typography variant="body2">
        {formatDate(template.dateCreated)}
      </Typography>
    ),
    sortFn: (a, b) =>
      new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime(),
  },
];
