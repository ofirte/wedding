import React from "react";
import { Invitee } from "@wedding-plan/types";
import Typography from "@mui/material/Typography";
import { Column } from "../common/DSTable";

export const createColumns = (
  t: (key: string) => string
): Column<Invitee>[] => [
  {
    id: "name",
    label: t("common.name"),
    sortable: true,
    render: (invitee: Invitee) => invitee.name,
  },


  {
    id: "side",
    label: t("guests.side"),
    sortable: true,
    render: (invitee: Invitee) => invitee.side,
    filterConfig: {
      id: "side",
      label: t("guests.side"),
      type: "single",
      options: [
        { value: "חתן", label: t("guests.groom") },
        { value: "כלה", label: t("guests.bride") },
      ],
    },
  },
  {
    id: "relation",
    label: t("guests.relation"),
    sortable: true,
    render: (invitee: Invitee) => invitee.relation,
    filterConfig: {
      id: "relation",
      label: t("guests.relation"),
      type: "multiple",
      options: (data: Invitee[]) => {
        const uniqueRelations = Array.from(
          new Set(data.map((invitee) => invitee.relation))
        ).filter(Boolean);

        return uniqueRelations.map((relation) => ({
          value: relation,
          label: relation,
        }));
      },
    },
  },
  {
    id: "amount",
    label: t("guests.presumedAmount"),
    sortable: true,
    render: (invitee: Invitee) => invitee.amount,
  },

  {
    id: "cellphone",
    label: t("guests.cellphone"),
    sortable: true,
    render: (invitee: Invitee) => invitee.cellphone,
  },
];

// Keep the old export for backward compatibility, but it won't have translations
export const columns = createColumns((key: string) => key);
