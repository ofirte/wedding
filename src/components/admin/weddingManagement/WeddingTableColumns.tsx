import React from "react";
import { IconButton } from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { Column } from "src/components/common/DSTable";
import { Wedding } from "@wedding-plan/types";

// Extend Wedding to include id field required by DSTable
export type WeddingTableData = Wedding & { id: string };

type TFunction = (
  key: string,
  variables?: Record<string, string | number>
) => string;

interface WeddingTableColumnsOptions {
  t: TFunction;
  onAddUserToWedding: (wedding: Wedding) => void;
  isUpdating?: boolean;
}

/**
 * Creates column configuration for the wedding management table
 */
export const createWeddingTableColumns = ({
  t,
  onAddUserToWedding,
  isUpdating = false,
}: WeddingTableColumnsOptions): Column<WeddingTableData>[] => [
  {
    id: "name",
    label: t("weddingManagement.weddingName"),
    render: (wedding) => wedding.name || t("common.notAvailable"),
    sortable: true,
    sortFn: (a, b) => (a.name || "").localeCompare(b.name || ""),
    filterConfig: {
      id: "name",
      type: "single",
      label: t("weddingManagement.filterByName"),
      options: (data) => {
        const names = data
          .map((wedding: WeddingTableData) => wedding.name || "")
          .filter((name: string) => name)
          .sort();
        const uniqueNames = Array.from(new Set(names));
        return uniqueNames.map((name: string) => ({
          value: name,
          label: name,
        }));
      },
    },
  },
  {
    id: "couple",
    label: t("weddingManagement.couple"),
    render: (wedding) => {
      const bride = wedding.brideName || "";
      const groom = wedding.groomName || "";
      if (bride && groom) {
        return `${bride} & ${groom}`;
      } else if (bride || groom) {
        return bride || groom;
      }
      return t("common.notAvailable");
    },
    sortable: true,
    sortFn: (a, b) => {
      const coupleA = `${a.brideName || ""} & ${a.groomName || ""}`;
      const coupleB = `${b.brideName || ""} & ${b.groomName || ""}`;
      return coupleA.localeCompare(coupleB);
    },
  },
  {
    id: "date",
    label: t("weddingManagement.weddingDate"),
    render: (wedding) =>
      wedding.date
        ? new Date(wedding.date).toLocaleDateString()
        : t("common.notAvailable"),
    sortable: true,
    sortFn: (a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateA - dateB;
    },
  },
  {
    id: "members",
    label: t("weddingManagement.members"),
    render: (wedding) => {
      const memberCount = wedding.members
        ? Object.keys(wedding.members).length
        : 0;
      return memberCount.toString();
    },
    sortable: true,
    sortFn: (a, b) => {
      const countA = a.members ? Object.keys(a.members).length : 0;
      const countB = b.members ? Object.keys(b.members).length : 0;
      return countA - countB;
    },
  },
  {
    id: "invitationCode",
    label: t("weddingManagement.invitationCode"),
    render: (wedding) => wedding.invitationCode || t("common.notAvailable"),
    sortable: true,
    sortFn: (a, b) =>
      (a.invitationCode || "").localeCompare(b.invitationCode || ""),
  },
  {
    id: "createdAt",
    label: t("weddingManagement.createdAt"),
    render: (wedding) =>
      wedding.createdAt
        ? new Date(wedding.createdAt).toLocaleDateString()
        : t("common.notAvailable"),
    sortable: true,
    sortFn: (a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    },
  },
  {
    id: "actions",
    label: t("common.actions"),
    render: (wedding) => (
      <IconButton
        onClick={() => onAddUserToWedding(wedding)}
        size="small"
        disabled={isUpdating}
        aria-label={`Add user to wedding ${wedding.name}`}
      >
        <PersonAddIcon />
      </IconButton>
    ),
    hideOnMobile: false,
    showOnMobileCard: true,
  },
];
