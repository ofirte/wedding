import React from "react";
import { Invitee } from "@wedding-plan/types";
import { InlineColumn } from "../common/DSInlineTable";
import { IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DSSelectOption } from "../common/cells/DSSelectCell";

// RSVP status options
export const RSVP_OPTIONS: DSSelectOption<string>[] = [
  { value: "Confirmed", label: "Confirmed", color: "#4CAF50" },
  { value: "Pending", label: "Pending", color: "#FF9800" },
  { value: "Declined", label: "Declined", color: "#F44336" },
];

// RSVP color map
export const RSVP_COLORS: Record<string, string> = {
  Confirmed: "#4CAF50",
  Pending: "#FF9800",
  Declined: "#F44336",
};

// Side options
export const SIDE_OPTIONS: DSSelectOption<string>[] = [
  { value: "חתן", label: "חתן", color: "#2196F3" },
  { value: "כלה", label: "כלה", color: "#E91E63" },
];

// Side color map
export const SIDE_COLORS: Record<string, string> = {
  חתן: "#2196F3",
  כלה: "#E91E63",
};

// Percentage options
export const PERCENTAGE_OPTIONS: DSSelectOption<string>[] = [
  { value: "25", label: "25%", color: "#F44336" },
  { value: "50", label: "50%", color: "#FF9800" },
  { value: "75", label: "75%", color: "#8BC34A" },
  { value: "100", label: "100%", color: "#4CAF50" },
];

export const PERCENTAGE_COLORS: Record<string, string> = {
  "25": "#F44336",
  "50": "#FF9800",
  "75": "#8BC34A",
  "100": "#4CAF50",
};

export const createInviteeInlineColumns = (
  onDelete: (id: string) => void,
  t: (key: string) => string,
  relationOptions: string[] = []
): InlineColumn<Invitee>[] => {
  // Build relation options dynamically from existing data
  const dynamicRelationOptions: DSSelectOption<string>[] = relationOptions.map(
    (relation) => ({
      value: relation,
      label: relation,
    })
  );

  return [
    {
      id: "name",
      label: t("common.name"),
      sortable: true,
      editable: true,
      editType: "text",
      minWidth: 150,
    },
    {
      id: "rsvp",
      label: t("guests.rsvpStatus"),
      sortable: true,
      editable: true,
      editType: "select",
      editOptions: RSVP_OPTIONS.map((opt) => ({
        ...opt,
        label: t(`guests.${opt.value.toLowerCase()}`),
      })),
      editColorMap: RSVP_COLORS,
      minWidth: 120,
    },
    {
      id: "percentage",
      label: t("guests.attendance"),
      sortable: true,
      editable: true,
      editType: "select",
      editOptions: PERCENTAGE_OPTIONS,
      editColorMap: PERCENTAGE_COLORS,
      getValue: (row: Invitee) => String(row.percentage),
      minWidth: 100,
    },
    {
      id: "side",
      label: t("guests.side"),
      sortable: true,
      editable: true,
      editType: "select",
      editOptions: SIDE_OPTIONS.map((opt) => ({
        ...opt,
        label: t(`guests.${opt.value === "חתן" ? "groom" : "bride"}`),
      })),
      editColorMap: SIDE_COLORS,
      minWidth: 100,
    },
    {
      id: "relation",
      label: t("guests.relation"),
      sortable: true,
      editable: true,
      editType: dynamicRelationOptions.length > 0 ? "select" : "text",
      editOptions:
        dynamicRelationOptions.length > 0 ? dynamicRelationOptions : undefined,
      minWidth: 120,
    },
    {
      id: "amount",
      label: t("guests.presumedAmount"),
      sortable: true,
      editable: true,
      editType: "number",
      minWidth: 100,
    },
    {
      id: "amountConfirm",
      label: t("guests.amountConfirm"),
      sortable: true,
      editable: false,
      render: (invitee: Invitee) => (
        <Typography>
          {invitee.rsvpStatus?.attendance
            ? invitee.rsvpStatus?.amount
            : invitee.rsvpStatus?.attendance === false
            ? 0
            : "-"}
        </Typography>
      ),
      minWidth: 100,
    },
    {
      id: "cellphone",
      label: t("guests.cellphone"),
      sortable: true,
      editable: true,
      editType: "text",
      minWidth: 120,
    },
    {
      id: "actions",
      label: t("common.actions"),
      sortable: false,
      editable: false,
      render: (item: Invitee) => (
        <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
          <DeleteIcon />
        </IconButton>
      ),
      width: 60,
    },
  ];
};
