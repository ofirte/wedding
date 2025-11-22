import { Lead, LeadSource } from "@wedding-plan/types";

export interface ColumnConfig {
  field: keyof Lead;
  translationKey: string;
  minWidth?: number;
  width?: number;
  sticky?: boolean;
  editable?: boolean;
}

export const LEADS_TABLE_COLUMNS: ColumnConfig[] = [
  {
    field: "name",
    translationKey: "leads.columns.name",
    minWidth: 200,
    sticky: true,
    editable: true,
  },
  {
    field: "email",
    translationKey: "leads.columns.email",
    minWidth: 200,
    editable: true,
  },
  {
    field: "phone",
    translationKey: "leads.columns.phone",
    minWidth: 150,
    editable: true,
  },
  {
    field: "weddingDate",
    translationKey: "leads.columns.weddingDate",
    minWidth: 150,
    editable: true,
  },

  {
    field: "status",
    translationKey: "leads.columns.status",
    minWidth: 160,
    editable: true,
  },
  {
    field: "source",
    translationKey: "leads.columns.source",
    minWidth: 150,
    editable: true,
  },
    {
    field: "budget",
    translationKey: "leads.columns.budget",
    minWidth: 130,
    editable: true,
  },
  {
    field: "service",
    translationKey: "leads.columns.service",
    minWidth: 180,
    editable: true,
  },
  {
    field: "followUpDate",
    translationKey: "leads.columns.followUp",
    minWidth: 150,
    editable: true,
  },
];

/**
 * Color coding for lead sources (for UI badges)
 */
export const LEAD_SOURCE_COLORS: Record<LeadSource, string> = {
  website: "#2196F3",
  referral: "#4CAF50",
  instagram: "#E91E63",
  facebook: "#1976D2",
  google: "#FF9800",
  wedding_fair: "#9C27B0",
  direct: "#00BCD4",
  other: "#9E9E9E",
};
