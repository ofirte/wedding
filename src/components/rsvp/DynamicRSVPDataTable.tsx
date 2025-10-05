import React from "react";
import { Box } from "@mui/material";
import DSTable, { Column } from "../common/DSTable";
import { InviteeWithDynamicRSVP } from "./DynamicRSVPTableColumns";

interface DynamicRSVPDataTableProps {
  data: InviteeWithDynamicRSVP[];
  columns: Column<InviteeWithDynamicRSVP>[];
  selectedTemplates: string[];
  onTemplateSelectionChange: (selected: string[]) => void;
  selectedGuestsCount: number;
  onSelectionChange: (selected: InviteeWithDynamicRSVP[]) => void;
  onSendMessage: () => void;
  isLoading?: boolean;
  onFilteredDataChange?: (data: InviteeWithDynamicRSVP[]) => void;
}

/**
 * DynamicRSVPDataTable - Dynamic RSVP data table with configurable columns
 *
 * A simplified table component that displays RSVP data with dynamic columns
 * based on the configured questions in the RSVP form.
 */
const DynamicRSVPDataTable: React.FC<DynamicRSVPDataTableProps> = ({
  data,
  columns,
  onSelectionChange,
  onFilteredDataChange,
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      <DSTable data={data} columns={columns} />
    </Box>
  );
};

export default DynamicRSVPDataTable;
