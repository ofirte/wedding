import React from "react";
import { Select, MenuItem, Chip } from "@mui/material";
import { Lead, LeadStatus, LeadStatusColors } from "@wedding-plan/types";
import { useTranslation } from "../../../localization/LocalizationContext";

interface StatusCellProps {
  lead: Lead;
  onStatusChange: (lead: Lead, newStatus: LeadStatus) => void;
}

const ALL_STATUSES: LeadStatus[] = [
  "new",
  "initial_contact",
  "qualified",
  "proposal_sent",
  "contract_offered",
  "signed",
  "deposit_paid",
  "active_client",
  "done",
  "lost",
];

export const StatusCell: React.FC<StatusCellProps> = ({ lead, onStatusChange }) => {
  const { t } = useTranslation();

  return (
    <Select
      value={lead.status}
      onChange={(e) => onStatusChange(lead, e.target.value as LeadStatus)}
      size="small"
      variant="standard"
      disableUnderline
      fullWidth
      sx={{
        "& .MuiSelect-select": {
          py: 0.5,
          px: 1.5,
          backgroundColor: LeadStatusColors[lead.status],
          color: "white",
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "0.813rem",
          transition: "all 0.2s ease",
          "&:hover": {
            opacity: 0.9,
          },
        },
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {ALL_STATUSES.map((status) => (
        <MenuItem
          key={status}
          value={status}
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <Chip
            label={t(`leads.statuses.${status}`)}
            size="small"
            sx={{
              backgroundColor: LeadStatusColors[status],
              color: "white",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 24,
            }}
          />
        </MenuItem>
      ))}
    </Select>
  );
};
