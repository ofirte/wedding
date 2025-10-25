import React from "react";
import { Column } from "../common/DSTable";
import { Chip, Typography, Stack } from "@mui/material";
import {
  Language as LanguageIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { stripWeddingIdFromTemplateName } from "../../utils/templatesUtils";

export interface TemplateTableRow {
  id: string;
  sid: string;
  friendlyName: string;
  language: string;
  type: "text" | "media" | "both";
  approvalStatus?:
    | "pending"
    | "approved"
    | "rejected"
    | "submitted"
    | "received";
  body?: string;
  dateCreated: string;
}

const getTypeIcon = (type: "text" | "media" | "both") => {
  switch (type) {
    case "text":
      return <TextFieldsIcon fontSize="small" />;
    case "media":
      return <ImageIcon fontSize="small" />;
    case "both":
      return (
        <Stack direction="row" spacing={0.5}>
          <TextFieldsIcon fontSize="small" />
          <ImageIcon fontSize="small" />
        </Stack>
      );
    default:
      return <TextFieldsIcon fontSize="small" />;
  }
};


const getApprovalStatusColor = (
  status?: string
): "success" | "error" | "warning" | "info" | "default" => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "submitted":
    case "received":
      return "info";
    case "pending":
    default:
      return "warning";
  }
};

export const createTemplateColumns = (
  t: (key: string) => string,
  onTemplateClick?: (template: TemplateTableRow) => void
): Column<TemplateTableRow>[] => [
  {
    id: "friendlyName",
    label: t("templates.name"),
    sortable: true,
    render: (template: TemplateTableRow) => (
      <Typography
        variant="body2"
        fontWeight="medium"
        sx={{
          cursor: onTemplateClick ? "pointer" : "default",
          color: onTemplateClick ? "primary.main" : "inherit",
          "&:hover": onTemplateClick
            ? {
                textDecoration: "underline",
                opacity: 0.8,
              }
            : {},
        }}
        onClick={() => onTemplateClick?.(template)}
      >
        {template.friendlyName || t("templates.unnamed")}
      </Typography>
    ),
  },
  {
    id: "language",
    label: t("templates.language"),
    sortable: true,
    render: (template: TemplateTableRow) => (
      <Chip
        icon={<LanguageIcon />}
        label={template.language?.toUpperCase() || "N/A"}
        size="small"
        variant="outlined"
        color="primary"
      />
    ),
    filterConfig: {
      id: "language",
      label: t("templates.language"),
      type: "multiple",
      options: (data: TemplateTableRow[]) => {
        const uniqueLanguages = Array.from(
          new Set(data.map((item) => item.language))
        ).filter(Boolean);
        return uniqueLanguages.map((lang) => ({
          value: lang,
          label: lang.toUpperCase(),
        }));
      },
    },
  },
  {
    id: "type",
    label: t("templates.type"),
    sortable: true,
    render: (template: TemplateTableRow) => getTypeIcon(template.type),
    filterConfig: {
      id: "type",
      label: t("templates.type"),
      type: "multiple",
      options: [
        { value: "text", label: t("templates.textType") },
        { value: "media", label: t("templates.mediaType") },
        { value: "both", label: t("templates.bothTypes") },
      ],
    },
  },
  {
    id: "approvalStatus",
    label: t("templates.eligibility"),
    sortable: true,
    render: (template: TemplateTableRow) => (
      <Chip
        label={template.approvalStatus || "pending"}
        color={getApprovalStatusColor(template.approvalStatus)}
        size="small"
        sx={{ minWidth: 80 }}
      />
    ),
    filterConfig: {
      id: "approvalStatus",
      label: t("templates.eligibility"),
      type: "multiple",
      options: [
        { value: "approved", label: t("templates.approved") },
        { value: "pending", label: t("templates.pending") },
        { value: "submitted", label: t("templates.submitted") },
        { value: "received", label: t("templates.received") },
        { value: "rejected", label: t("templates.rejected") },
      ],
    },
  },
];

// Transform function to convert combined template data to TemplateTableRow
export const transformTemplateData = (templates: any[]): TemplateTableRow[] => {
  return templates.map((template) => {
    const hasText = !!template.types?.["twilio/text"];
    const hasMedia = !!template.types?.["twilio/media"];

    let type: "text" | "media" | "both";
    if (hasText && hasMedia) {
      type = "both";
    } else if (hasMedia) {
      type = "media";
    } else {
      type = "text";
    }

    // Extract variables from text body
    const textContent = template.types?.["twilio/text"] as any;
    const body = textContent?.body || "";

    return {
      id: template.sid || "",
      sid: template.sid || "",
      friendlyName: stripWeddingIdFromTemplateName(template.friendlyName || ""),
      language: template.language || "",
      type,
      // Use Firebase approval status if available, otherwise default to pending
      approvalStatus: template.approvalStatus || "pending",
      body,
      dateCreated: template.dateCreated || "",
    };
  });
};
