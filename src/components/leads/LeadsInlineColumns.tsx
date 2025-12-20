import React from "react";
import { Lead, LeadStatus, LeadPaymentStatus, LeadSource } from "@wedding-plan/types";
import { InlineColumn } from "../common/DSInlineTable";
import { DSSelectOption } from "../common/cells/DSSelectCell";
import { LeadStatusColors, LeadPaymentStatusColors, LeadSourceColors } from "./leadsUtils";
import { IconButton, Tooltip, Box } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";
import { MemoizedNotesCell } from "../common/DSInlineTable/cells";

// Status options
const ALL_STATUSES: LeadStatus[] = [
  "new",
  "initial_contact",
  "contract_suggested",
  "contract_signed",
  "done",
  "lost",
];

// Payment status options
const ALL_PAYMENT_STATUSES: LeadPaymentStatus[] = [
  "awaiting_payment",
  "advance_paid",
  "paid_in_full",
];

// Source options
const ALL_SOURCES: LeadSource[] = [
  "website",
  "referral",
  "instagram",
  "facebook",
  "google",
  "wedding_fair",
  "direct",
  "other",
];

// Create select options with translations
export const createStatusOptions = (
  t: (key: string) => string
): DSSelectOption<string>[] =>
  ALL_STATUSES.map((status) => ({
    value: status,
    label: t(`leads.statuses.${status}`),
  }));

export const createPaymentStatusOptions = (
  t: (key: string) => string
): DSSelectOption<string>[] =>
  ALL_PAYMENT_STATUSES.map((status) => ({
    value: status,
    label: t(`leads.paymentStatuses.${status}`),
  }));

export const createSourceOptions = (
  t: (key: string) => string
): DSSelectOption<string>[] =>
  ALL_SOURCES.map((source) => ({
    value: source,
    label: t(`leads.sources.${source}`),
  }));

export const createLeadsInlineColumns = (
  serviceOptions: string[],
  onOpenActivity: (lead: Lead) => void,
  onOpenNotes: (lead: Lead) => void,
  onDelete: (id: string) => void,
  t: (key: string) => string
): InlineColumn<Lead>[] => [
  {
    id: "name",
    label: t("leads.columns.name"),
    sticky: true,
    sortable: true,
    editable: true,
    editType: "text",
    minWidth: 200,
  },
  {
    id: "email",
    label: t("leads.columns.email"),
    sortable: true,
    editable: true,
    editType: "text",
    minWidth: 200,
  },
  {
    id: "phone",
    label: t("leads.columns.phone"),
    sortable: true,
    editable: true,
    editType: "text",
    minWidth: 150,
  },
  {
    id: "weddingDate",
    label: t("leads.columns.weddingDate"),
    sortable: true,
    editable: true,
    editType: "date",
    minWidth: 150,
  },
  {
    id: "status",
    label: t("leads.columns.status"),
    sortable: true,
    editable: true,
    editType: "select",
    editOptions: createStatusOptions(t),
    editColorMap: LeadStatusColors,
    minWidth: 160,
    filterConfig: {
      type: "multiselect",
      options: createStatusOptions(t),
    },
  },
  {
    id: "paymentStatus",
    label: t("leads.columns.paymentStatus"),
    sortable: true,
    editable: true,
    editType: "select",
    editOptions: createPaymentStatusOptions(t),
    editColorMap: LeadPaymentStatusColors,
    getValue: (lead) => lead.paymentStatus || "awaiting_payment",
    minWidth: 150,
    filterConfig: {
      type: "multiselect",
      options: createPaymentStatusOptions(t),
    },
  },
  {
    id: "source",
    label: t("leads.columns.source"),
    sortable: true,
    editable: true,
    editType: "select",
    editOptions: createSourceOptions(t),
    editColorMap: LeadSourceColors,
    getValue: (lead) => lead.source || "website",
    minWidth: 150,
    filterConfig: {
      type: "multiselect",
      options: createSourceOptions(t),
    },
  },
  {
    id: "budget",
    label: t("leads.columns.budget"),
    sortable: true,
    editable: true,
    editType: "number",
    minWidth: 130,
  },
  {
    id: "quotation",
    label: t("leads.columns.quotation"),
    sortable: true,
    editable: true,
    editType: "number",
    minWidth: 130,
  },
  {
    id: "advanceAmount",
    label: t("leads.columns.advanceAmount"),
    sortable: true,
    editable: true,
    editType: "number",
    minWidth: 130,
  },
  {
    id: "service",
    label: t("leads.columns.service"),
    sortable: true,
    editable: true,
    editType: "autocomplete",
    autocompleteOptions: serviceOptions,
    minWidth: 180,
    filterConfig: {
      type: "multiselect",
      options: (data: Lead[]) => {
        const uniqueServices = Array.from(
          new Set(data.map((lead) => lead.service).filter(Boolean))
        ) as string[];
        return uniqueServices.map((service) => ({
          value: service,
          label: service,
        }));
      },
    },
  },
  {
    id: "followUpDate",
    label: t("leads.columns.followUp"),
    sortable: true,
    editable: true,
    editType: "date",
    minWidth: 150,
  },
  {
    id: "notes",
    label: t("leads.columns.notes"),
    sortable: false,
    editable: false,
    minWidth: 180,
    render: (lead) => (
      <MemoizedNotesCell
        value={lead.notes}
        onOpenEditor={() => onOpenNotes(lead)}
        addTooltip={t("leads.notesDrawer.addNotes")}
        editTooltip={t("leads.notesDrawer.editNotes")}
      />
    ),
  },
  {
    id: "actions",
    label: "",
    sortable: false,
    editable: false,
    render: (lead) => (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title={t("leads.actions.viewActivity")}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActivity(lead);
            }}
            sx={{ color: "text.secondary" }}
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("common.delete")}>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lead.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    width: 90,
  },
];
