import React from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FilterList as FilterListIcon } from "@mui/icons-material";
import { Invitee } from "../../../../shared/src/models/invitee";
import { Table } from "../../../../shared/src/models/seating";
import { useTranslation } from "src/localization/LocalizationContext";
import UnassignedGuestItem from "./UnassignedGuestItem";

interface UnassignedGuestsListProps {
  filteredGuests: Invitee[];
  selectedGuests: Set<string>;
  searchQuery: string;
  relationFilter: string;
  sideFilter: string;
  relations: string[];
  sides: string[];
  unassignedCount: number;
  bulkAssignTableId: string;
  tables: Table[];
  assignments: Map<string, string[]>;
  onSearchChange: (query: string) => void;
  onRelationFilterChange: (relation: string) => void;
  onSideFilterChange: (side: string) => void;
  onToggleGuest: (guestId: string) => void;
  onSelectAll: () => void;
  onBulkAssign: () => void;
  onBulkAssignTableChange: (tableId: string) => void;
}

const UnassignedGuestsList: React.FC<UnassignedGuestsListProps> = ({
  filteredGuests,
  selectedGuests,
  searchQuery,
  relationFilter,
  sideFilter,
  relations,
  sides,
  unassignedCount,
  bulkAssignTableId,
  tables,
  assignments,
  onSearchChange,
  onRelationFilterChange,
  onSideFilterChange,
  onToggleGuest,
  onSelectAll,
  onBulkAssign,
  onBulkAssignTableChange,
}) => {
  const { t } = useTranslation();
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  return (
    <Box
      sx={{
        width: 320,
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t("seating.assignmentDialog.unassigned")} ({unassignedCount})
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            color={relationFilter !== "all" || sideFilter !== "all" ? "primary" : "default"}
          >
            <FilterListIcon />
          </IconButton>
        </Box>

        <Stack spacing={1.5}>
          <TextField
            size="small"
            placeholder={t("seating.assignmentDialog.search")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            fullWidth
          />

          <Button
            size="small"
            onClick={onSelectAll}
            disabled={filteredGuests.length === 0}
          >
            {selectedGuests.size === filteredGuests.length
              ? t("seating.assignmentDialog.deselectAll")
              : t("seating.assignmentDialog.selectAll")}
          </Button>
        </Stack>

        {/* Filter Popover */}
        <Popover
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Box sx={{ p: 2, width: 250 }}>
            <Stack spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>
                  {t("seating.assignmentDialog.relation")}
                </InputLabel>
                <Select
                  value={relationFilter}
                  onChange={(e) => onRelationFilterChange(e.target.value)}
                  label={t("seating.assignmentDialog.relation")}
                >
                  <MenuItem value="all">
                    {t("seating.assignmentDialog.all")}
                  </MenuItem>
                  {relations.map((rel) => (
                    <MenuItem key={rel} value={rel}>
                      {rel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>{t("seating.assignmentDialog.side")}</InputLabel>
                <Select
                  value={sideFilter}
                  onChange={(e) => onSideFilterChange(e.target.value)}
                  label={t("seating.assignmentDialog.side")}
                >
                  <MenuItem value="all">
                    {t("seating.assignmentDialog.all")}
                  </MenuItem>
                  {sides.map((side) => (
                    <MenuItem key={side} value={side}>
                      {side}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
        </Popover>
      </Box>

      {/* Guest List */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        <Stack spacing={1}>
          {filteredGuests.map((guest) => (
            <UnassignedGuestItem
              key={guest.id}
              guest={guest}
              isSelected={selectedGuests.has(guest.id)}
              onToggle={onToggleGuest}
            />
          ))}
          {filteredGuests.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
            >
              {t("seating.assignmentDialog.noUnassignedGuests")}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Bulk Assign Controls */}
      {selectedGuests.size > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="body2" gutterBottom>
            {t("seating.assignmentDialog.selectedCount", {
              count: selectedGuests.size,
            })}
          </Typography>
          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select
                value={bulkAssignTableId}
                onChange={(e) => onBulkAssignTableChange(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  {t("seating.assignmentDialog.selectTable")}
                </MenuItem>
                {tables.map((table) => {
                  const assigned = assignments.get(table.id) || [];
                  return (
                    <MenuItem key={table.id} value={table.id}>
                      {table.name || t("seating.table.defaultName", { number: table.number })} (
                      {assigned.length}/{table.capacity})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              onClick={onBulkAssign}
              disabled={!bulkAssignTableId}
            >
              {t("seating.assignmentDialog.assign")}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default UnassignedGuestsList;
