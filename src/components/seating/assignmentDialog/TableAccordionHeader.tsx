import React, { useState, useRef, useEffect } from "react";
import { Box, Chip, IconButton, TextField, Typography } from "@mui/material";
import { Table } from "../../../../shared/src/models/seating";
import { Edit } from "@mui/icons-material";
import { useTranslation } from "src/localization/LocalizationContext";

interface TableAccordionHeaderProps {
  table: Table;
  assignedCount: number;
  isOverCapacity: boolean;
  onUpdateName: (tableId: string, name: string) => void;
}

const TableAccordionHeader: React.FC<TableAccordionHeaderProps> = ({
  table,
  assignedCount,
  isOverCapacity,
  onUpdateName,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(table.name || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editedName !== table.name) {
      onUpdateName(table.id, editedName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditedName(table.name || "");
      setIsEditing(false);
    }
  };

  const displayText = table.name
    ? `${t("seating.table.defaultName", { number: table.number })} - ${table.name}`
    : t("seating.table.defaultName", { number: table.number });

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
      {isEditing ? (
        <TextField
          inputRef={inputRef}
          size="small"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder={t("seating.table.defaultName", { number: table.number })}
          sx={{ flex: 1, maxWidth: 300 }}
        />
      ) : (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <Typography fontWeight="medium">{displayText}</Typography>
          <IconButton size="small" onClick={handleStartEdit} sx={{ ml: 1 }}>
            <Edit fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Chip
        label={`${assignedCount}/${table.capacity}`}
        size="small"
        color={
          isOverCapacity
            ? "error"
            : assignedCount === table.capacity
            ? "warning"
            : "default"
        }
      />
      {table.isVIP && <Chip label={t("seating.setup.vipTable")} size="small" color="secondary" />}
    </Box>
  );
};

export default TableAccordionHeader;
