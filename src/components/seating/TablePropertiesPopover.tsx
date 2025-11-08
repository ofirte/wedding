import React, { useState, useMemo } from "react";
import {
  Popover,
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Chip,
  Autocomplete,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Table, Invitee } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { getUnassignedGuests } from "../../api/seating/seatingApi";

interface TablePropertiesPopoverProps {
  table: Table | null;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onUpdate: (tableId: string, updates: Partial<Table>) => void;
  onDelete: (tableId: string) => void;
  onAssignGuest: (guestId: string, tableId: string) => void;
  onRemoveGuest: (guestId: string, tableId: string) => void;
  allTables: Table[];
  allInvitees: Invitee[];
}

const TablePropertiesPopover: React.FC<TablePropertiesPopoverProps> = ({
  table,
  anchorEl,
  onClose,
  onUpdate,
  onDelete,
  onAssignGuest,
  onRemoveGuest,
  allTables,
  allInvitees,
}) => {
  const { t } = useTranslation();

  const [editedNumber, setEditedNumber] = useState<number | string>(
    table?.number || 1
  );
  const [editedName, setEditedName] = useState<string>(table?.name || "");
  const [editedCapacity, setEditedCapacity] = useState<number>(
    table?.capacity || 8
  );
  const [editedShape, setEditedShape] = useState<
    "round" | "rectangular" | "square"
  >(table?.shape || "round");

  // Update local state when table changes
  React.useEffect(() => {
    if (table) {
      setEditedNumber(table.number);
      setEditedName(table.name || "");
      setEditedCapacity(table.capacity);
      setEditedShape(table.shape);
    }
  }, [table]);

  // Get assigned guests for this table
  const assignedGuests = useMemo(() => {
    if (!table) return [];
    return allInvitees.filter((inv) => table.assignedGuests.includes(inv.id));
  }, [table, allInvitees]);

  // Get unassigned guests
  const unassignedGuests = useMemo(
    () => getUnassignedGuests(allInvitees, allTables),
    [allInvitees, allTables]
  );

  if (!table) return null;

  const handleUpdate = (updates: Partial<Table>) => {
    onUpdate(table.id, updates);
  };

  const handleNumberChange = (value: number | string) => {
    setEditedNumber(value);
    handleUpdate({ number: value });
  };

  const handleNameChange = (value: string) => {
    setEditedName(value);
    handleUpdate({ name: value });
  };

  const handleCapacityChange = (value: number) => {
    setEditedCapacity(value);
    handleUpdate({ capacity: value });
  };

  const handleShapeChange = (value: "round" | "rectangular" | "square") => {
    setEditedShape(value);
    handleUpdate({ shape: value });
  };

  const handleDeleteClick = () => {
    if (
      table.assignedGuests.length > 0 &&
      !window.confirm(t("seating.setup.deleteWithGuests"))
    ) {
      return;
    }
    if (window.confirm(t("seating.setup.deleteConfirm"))) {
      onDelete(table.id);
      onClose();
    }
  };

  const isAtCapacity = table.assignedGuests.length >= table.capacity;

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      sx={{ ml: 2 }}
    >
      <Box sx={{ width: 320, p: 2 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Typography variant="h6">Table {table.number}</Typography>

          <Divider />

          {/* Quick Edit Fields */}
          <TextField
            label={t("seating.setup.tableNumber")}
            type="number"
            value={editedNumber}
            onChange={(e) =>
              handleNumberChange(
                e.target.value === ""
                  ? ""
                  : Math.max(1, Number(e.target.value))
              )
            }
            size="small"
            fullWidth
          />

          <TextField
            label={t("seating.setup.tableName")}
            value={editedName}
            onChange={(e) => handleNameChange(e.target.value)}
            size="small"
            fullWidth
            placeholder={t("seating.setup.tableNamePlaceholder")}
            helperText={t("seating.setup.tableNameHelper")}
          />

          <TextField
            label={t("seating.setup.capacity")}
            type="number"
            value={editedCapacity}
            onChange={(e) =>
              handleCapacityChange(Math.max(1, Number(e.target.value)))
            }
            size="small"
            fullWidth
            inputProps={{ min: 1 }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>{t("seating.setup.shape")}</InputLabel>
            <Select
              value={editedShape}
              onChange={(e) =>
                handleShapeChange(
                  e.target.value as "round" | "rectangular" | "square"
                )
              }
              label={t("seating.setup.shape")}
            >
              <MenuItem value="round">
                {t("seating.setup.shapes.round")}
              </MenuItem>
              <MenuItem value="rectangular">
                {t("seating.setup.shapes.rectangular")}
              </MenuItem>
              <MenuItem value="square">
                {t("seating.setup.shapes.square")}
              </MenuItem>
            </Select>
          </FormControl>

          <Divider />

          {/* Assigned Guests */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("seating.assignment.assigned")} ({table.assignedGuests.length}/
              {table.capacity})
            </Typography>

            <Box
              sx={{
                maxHeight: 200,
                overflow: "auto",
                bgcolor: "grey.50",
                borderRadius: 1,
                p: 1,
              }}
            >
              {assignedGuests.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ py: 2 }}
                >
                  {t("seating.assignment.noGuestsAssigned")}
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {assignedGuests.map((guest) => (
                    <Chip
                      key={guest.id}
                      label={guest.name}
                      size="small"
                      onDelete={() => onRemoveGuest(guest.id, table.id)}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Box>

          {/* Add Guest Dropdown */}
          <Autocomplete
            options={unassignedGuests}
            getOptionLabel={(guest) => `${guest.name} (${guest.relation})`}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("seating.actions.addGuest")}
                size="small"
              />
            )}
            onChange={(_, guest) => {
              if (guest) {
                onAssignGuest(guest.id, table.id);
              }
            }}
            disabled={isAtCapacity}
            value={null}
          />

          {isAtCapacity && (
            <Typography variant="caption" color="warning.main">
              {t("seating.assignment.tableCapacityReached")}
            </Typography>
          )}

          <Divider />

          {/* Delete Button */}
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            {t("seating.setup.deleteTable")}
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};

export default TablePropertiesPopover;
