import React from "react";
import { TableHead, TableRow, TableCell } from "@mui/material";
import { LEADS_TABLE_COLUMNS } from "../config/leadsTableColumns";

interface LeadsTableHeaderProps {
  t: (key: string) => string;
}

const headerCellStyle = {
  backgroundColor: "#F8F9FA",
  fontWeight: 700,
  fontSize: "0.75rem",
  textTransform: "uppercase" as const,
  color: "text.secondary",
  letterSpacing: "0.5px",
  borderBottom: "2px solid",
  borderColor: "divider",
};

export const LeadsTableHeader: React.FC<LeadsTableHeaderProps> = ({ t }) => {
  return (
    <TableHead>
      <TableRow>
        {LEADS_TABLE_COLUMNS.map((column) => (
          <TableCell
            key={column.field}
            sx={{
              ...headerCellStyle,
              minWidth: column.minWidth,
              width: column.width,
              ...(column.sticky && {
                position: "sticky",
                left: 0,
                zIndex: 3,
                borderRight: "2px solid",
                borderRightColor: "divider",
                boxShadow: "2px 0 4px rgba(0, 0, 0, 0.05)",
              }),
            }}
          >
            {t(column.translationKey)}
          </TableCell>
        ))}
        <TableCell
          sx={{
            ...headerCellStyle,
            width: 100,
          }}
        >
          {t("leads.columns.actions")}
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
