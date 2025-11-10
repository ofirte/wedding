import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Table } from "../../../../shared/src/models/seating";
import { Invitee } from "../../../../shared/src/models/invitee";
import { useTranslation } from "src/localization/LocalizationContext";
import { getGuestAmount } from "../../../utils/seatingUtils";
import TableAccordion from "./TableAccordion";

interface TablesAssignmentListProps {
  tables: Table[];
  assignments: Map<string, string[]>;
  getGuest: (guestId: string) => Invitee | undefined;
  onRemoveGuest: (guestId: string, tableId: string) => void;
  onDropGuest: (guestId: string, tableId: string) => void;
  onUpdateTableName: (tableId: string, name: string) => void;
}

const TablesAssignmentList: React.FC<TablesAssignmentListProps> = ({
  tables,
  assignments,
  getGuest,
  onRemoveGuest,
  onDropGuest,
  onUpdateTableName,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t("seating.assignmentDialog.tablesAndAssignments")}
      </Typography>

      <Stack spacing={1}>
        {tables.map((table) => {
          const tableGuests = assignments.get(table.id) || [];
          // Calculate used capacity based on actual guest amounts
          const usedCapacity = tableGuests.reduce((sum, guestId) => {
            const guest = getGuest(guestId);
            return sum + (guest ? getGuestAmount(guest) : 0);
          }, 0);
          const isOverCapacity = usedCapacity > table.capacity;

          return (
            <TableAccordion
              key={table.id}
              table={table}
              assignedGuestIds={tableGuests}
              getGuest={getGuest}
              onRemoveGuest={onRemoveGuest}
              onDropGuest={onDropGuest}
              onUpdateTableName={onUpdateTableName}
              isOverCapacity={isOverCapacity}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default TablesAssignmentList;
