import React from "react";
import { Invitee } from "@wedding-plan/types";
import { InlineColumn } from "../common/DSInlineTable";
import { IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DSSelectOption } from "../common/cells/DSSelectCell";

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

export const createInviteeInlineColumns = (
  onDelete: (id: string) => void,
  t: (key: string) => string,
  relationOptions: string[] = []
): InlineColumn<Invitee>[] => {
  return [
    {
      id: "name",
      label: t("common.name"),
      sticky: true,
      sortable: true,
      editable: true,
      editType: "text",
      minWidth: 150,
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
      filterConfig: {
        type: "select",
        options: SIDE_OPTIONS.map((opt) => ({
          ...opt,
          label: t(`guests.${opt.value === "חתן" ? "groom" : "bride"}`),
        })),
      },
    },
    {
      id: "relation",
      label: t("guests.relation"),
      sortable: true,
      editable: true,
      editType: "autocomplete",
      autocompleteOptions: relationOptions,
      minWidth: 120,
      filterConfig: {
        type: "multiselect",
        options: relationOptions.map((r) => ({ value: r, label: r })),
      },
    },
    {
      id: "amount",
      label: t("guests.presumedAmount"),
      sortable: true,
      editable: true,
      editType: "number",
      minWidth: 100,
      filterConfig: {
        type: "number-range",
      },
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
