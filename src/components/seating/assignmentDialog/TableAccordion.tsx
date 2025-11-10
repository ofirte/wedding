import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { useDrop } from "react-dnd";
import { Table } from "../../../../shared/src/models/seating";
import { Invitee } from "../../../../shared/src/models/invitee";
import { useTranslation } from "src/localization/LocalizationContext";
import { getGuestAmount } from "../../../utils/seatingUtils";
import TableAccordionHeader from "./TableAccordionHeader";

interface TableAccordionProps {
  table: Table;
  assignedGuestIds: string[];
  getGuest: (guestId: string) => Invitee | undefined;
  onRemoveGuest: (guestId: string, tableId: string) => void;
  onDropGuest: (guestId: string, tableId: string) => void;
  onUpdateTableName: (tableId: string, name: string) => void;
  isOverCapacity: boolean;
}

const TableAccordion: React.FC<TableAccordionProps> = ({
  table,
  assignedGuestIds,
  getGuest,
  onRemoveGuest,
  onDropGuest,
  onUpdateTableName,
  isOverCapacity,
}) => {
  const { t } = useTranslation();

  const [{ isOver }, drop] = useDrop({
    accept: "GUEST",
    drop: (item: { guest: Invitee; guestId?: string }) => {
      // Support both formats: GuestChip passes { guest }, others might pass { guestId }
      const guestId = item.guestId || item.guest?.id;
      if (guestId) {
        onDropGuest(guestId, table.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Calculate actual assigned count based on guest amounts
  const assignedCount = assignedGuestIds.reduce((sum, guestId) => {
    const guest = getGuest(guestId);
    return sum + (guest ? getGuestAmount(guest) : 0);
  }, 0);

  return (
    <Accordion defaultExpanded={assignedGuestIds.length > 0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <TableAccordionHeader
          table={table}
          assignedCount={assignedCount}
          isOverCapacity={isOverCapacity}
          onUpdateName={onUpdateTableName}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Box
          ref={drop as any}
          sx={{
            minHeight: 80,
            p: 1,
            border: 1,
            borderColor: isOver ? "primary.main" : "divider",
            borderRadius: 1,
            bgcolor: isOver ? "primary.lighter" : "transparent",
          }}
        >
          {isOverCapacity && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              {t("seating.assignmentDialog.overCapacity")}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {assignedGuestIds.map((guestId) => {
              const guest = getGuest(guestId);
              if (!guest) return null;

              const guestAmount = getGuestAmount(guest);
              const label = guestAmount > 1 ? `${guest.name} (+${guestAmount})` : guest.name;

              return (
                <Chip
                  key={guestId}
                  label={label}
                  size="small"
                  onDelete={() => onRemoveGuest(guestId, table.id)}
                />
              );
            })}
            {assignedGuestIds.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {t("seating.assignmentDialog.dropGuestsHere")}
              </Typography>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default TableAccordion;
