import React from "react";
import { Select, MenuItem, Chip } from "@mui/material";
import { Lead, LeadSource } from "@wedding-plan/types";
import { useTranslation } from "../../../localization/LocalizationContext";
import { LEAD_SOURCE_COLORS } from "../config/leadsTableColumns";

interface SourceCellProps {
  lead: Lead;
  onSourceChange: (lead: Lead, newSource: LeadSource) => void;
}

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

export const SourceCell: React.FC<SourceCellProps> = ({ lead, onSourceChange }) => {
  const { t } = useTranslation();
  const sourceValue = lead.source || "website";

  return (
    <Select
      value={sourceValue}
      onChange={(e) => onSourceChange(lead, e.target.value as LeadSource)}
      size="small"
      variant="standard"
      disableUnderline
      fullWidth
      sx={{
        "& .MuiSelect-select": {
          py: 0.5,
          px: 1.5,
          backgroundColor: LEAD_SOURCE_COLORS[sourceValue],
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
      {ALL_SOURCES.map((source) => (
        <MenuItem
          key={source}
          value={source}
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <Chip
            label={t(`leads.sources.${source}`)}
            size="small"
            sx={{
              backgroundColor: LEAD_SOURCE_COLORS[source],
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
