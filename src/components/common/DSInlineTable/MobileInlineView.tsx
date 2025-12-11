import React, { useState, useCallback, memo, useRef, forwardRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Collapse,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  Zoom,
  Autocomplete,
} from "@mui/material";
import { Virtuoso } from "react-virtuoso";
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { responsivePatterns, touchConfig } from "../../../utils/ResponsiveUtils";
import { InlineColumn } from "./types";

interface MobileInlineViewProps<T extends { id: string | number }> {
  data: T[];
  columns: InlineColumn<T>[];
  onCellUpdate: (rowId: string | number, columnId: string, value: any) => Promise<void>;
  mobileCardTitle?: (row: T) => string;
  onRowSelect?: (row: T, isSelected: boolean) => void;
  selectedRows?: T[];
  showSelectColumn?: boolean;
  emptyMessage?: string;
  // Add row props
  enableInlineAdd?: boolean;
  addRowPlaceholder?: string;
  onAddRow?: (value: string) => void;
}

interface EditDialogState<T extends { id: string | number }> {
  open: boolean;
  row: T | null;
  column: InlineColumn<T> | null;
  value: any;
}

const MobileInlineView = <T extends { id: string | number }>({
  data,
  columns,
  onCellUpdate,
  mobileCardTitle,
  onRowSelect,
  selectedRows = [],
  showSelectColumn = false,
  emptyMessage,
  enableInlineAdd = false,
  addRowPlaceholder,
  onAddRow,
}: MobileInlineViewProps<T>) => {
  const { t } = useTranslation();
  const [expandedCards, setExpandedCards] = useState<Set<string | number>>(new Set());
  const [editDialog, setEditDialog] = useState<EditDialogState<T>>({
    open: false,
    row: null,
    column: null,
    value: "",
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addValue, setAddValue] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  const toggleCardExpansion = useCallback((id: string | number) => {
    setExpandedCards((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const isRowSelected = useCallback(
    (row: T) => selectedRows.some((selectedRow) => selectedRow.id === row.id),
    [selectedRows]
  );

  // Get visible columns for mobile
  const getDisplayColumns = useCallback(() => {
    return columns.filter((col) => col.editable !== undefined || col.render);
  }, [columns]);

  // Get primary columns (first 2 for quick view)
  const getPrimaryColumns = useCallback(() => {
    return getDisplayColumns().slice(0, 2);
  }, [getDisplayColumns]);

  // Get secondary columns (rest for expanded view)
  const getSecondaryColumns = useCallback(() => {
    return getDisplayColumns().slice(2);
  }, [getDisplayColumns]);

  // Open edit dialog
  const handleOpenEdit = useCallback((row: T, column: InlineColumn<T>) => {
    const value = column.getValue ? column.getValue(row) : (row as any)[column.id];
    setEditDialog({
      open: true,
      row,
      column,
      value: value ?? "",
    });
  }, []);

  // Close edit dialog
  const handleCloseEdit = useCallback(() => {
    setEditDialog({ open: false, row: null, column: null, value: "" });
  }, []);

  // Save edit
  const handleSaveEdit = useCallback(async () => {
    if (!editDialog.row || !editDialog.column) return;

    let valueToSave = editDialog.value;

    // Convert to number if needed
    if (editDialog.column.editType === "number") {
      valueToSave = editDialog.value === "" ? 0 : Number(editDialog.value);
    }

    await onCellUpdate(editDialog.row.id, editDialog.column.id, valueToSave);
    handleCloseEdit();
  }, [editDialog, onCellUpdate, handleCloseEdit]);

  // Handle add dialog
  const handleOpenAdd = useCallback(() => {
    setAddDialogOpen(true);
    setAddValue("");
    setTimeout(() => addInputRef.current?.focus(), 100);
  }, []);

  const handleCloseAdd = useCallback(() => {
    setAddDialogOpen(false);
    setAddValue("");
  }, []);

  const handleConfirmAdd = useCallback(() => {
    if (!addValue.trim() || !onAddRow) return;
    onAddRow(addValue.trim());
    handleCloseAdd();
  }, [addValue, onAddRow, handleCloseAdd]);

  // Render cell value for display
  const renderCellValue = useCallback(
    (column: InlineColumn<T>, row: T) => {
      // Use custom render if available
      if (column.render) {
        const rendered = column.render(row);
        if (React.isValidElement(rendered)) {
          return rendered;
        }
        return (
          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            {String(rendered)}
          </Typography>
        );
      }

      // Get raw value
      const value = column.getValue ? column.getValue(row) : (row as any)[column.id];

      // Format based on type
      if (column.editType === "select" && column.editOptions) {
        const option = column.editOptions.find((opt) => opt.value === value);
        const displayLabel = option?.label ?? value;
        const color = column.editColorMap?.[value];

        if (color) {
          return (
            <Chip
              size="small"
              label={displayLabel}
              sx={{
                bgcolor: `${color}20`,
                color: color,
                fontWeight: 500,
              }}
            />
          );
        }
        return (
          <Typography variant="body2" fontWeight="medium">
            {displayLabel}
          </Typography>
        );
      }

      if (typeof value === "number") {
        return (
          <Typography variant="body2" fontWeight="medium">
            {value.toLocaleString()}
          </Typography>
        );
      }

      return (
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {value ?? "-"}
        </Typography>
      );
    },
    []
  );

  // Render edit input based on column type
  const renderEditInput = useCallback(() => {
    const { column, value } = editDialog;
    if (!column) return null;

    switch (column.editType) {
      case "select":
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{column.label}</InputLabel>
            <Select
              value={value}
              label={column.label}
              onChange={(e) =>
                setEditDialog((prev) => ({ ...prev, value: e.target.value }))
              }
              autoFocus
            >
              {column.editOptions?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "autocomplete":
        return (
          <Autocomplete
            freeSolo
            options={column.autocompleteOptions || []}
            value={value}
            onInputChange={(_, newValue) =>
              setEditDialog((prev) => ({ ...prev, value: newValue }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={column.label}
                fullWidth
                autoFocus
                sx={{ mt: 2 }}
              />
            )}
          />
        );

      case "number":
        return (
          <TextField
            fullWidth
            type="number"
            label={column.label}
            value={value}
            onChange={(e) =>
              setEditDialog((prev) => ({ ...prev, value: e.target.value }))
            }
            autoFocus
            sx={{ mt: 2 }}
            inputProps={{ inputMode: "numeric" }}
          />
        );

      case "date":
        return (
          <TextField
            fullWidth
            type="date"
            label={column.label}
            value={value}
            onChange={(e) =>
              setEditDialog((prev) => ({ ...prev, value: e.target.value }))
            }
            autoFocus
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            label={column.label}
            value={value}
            onChange={(e) =>
              setEditDialog((prev) => ({ ...prev, value: e.target.value }))
            }
            autoFocus
            multiline={String(value).length > 50}
            rows={String(value).length > 50 ? 3 : 1}
            sx={{ mt: 2 }}
          />
        );
    }
  }, [editDialog]);

  // Render a single field row
  const renderFieldRow = useCallback(
    (column: InlineColumn<T>, row: T, showDivider: boolean) => {
      const isEditable = column.editable;

      return (
        <Box key={column.id}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: touchConfig.minTouchTarget,
              py: 0.5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                minWidth: 80,
                pr: 2,
              }}
            >
              {column.label}
            </Typography>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              {renderCellValue(column, row)}
              {isEditable && (
                <IconButton
                  size="small"
                  onClick={() => handleOpenEdit(row, column)}
                  sx={{
                    ml: 0.5,
                    color: "primary.main",
                    opacity: 0.6,
                    "&:hover": { opacity: 1 },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          {showDivider && <Divider sx={{ opacity: 0.3 }} />}
        </Box>
      );
    },
    [renderCellValue, handleOpenEdit]
  );

  // Render a single card
  const renderCard = useCallback(
    (row: T) => {
      const isExpanded = expandedCards.has(row.id);
      const isSelected = isRowSelected(row);
      const primaryColumns = getPrimaryColumns();
      const secondaryColumns = getSecondaryColumns();
      const hasSecondaryFields = secondaryColumns.length > 0;

      const title = mobileCardTitle
        ? mobileCardTitle(row)
        : `${t("common.item")} ${row.id}`;

      return (
        <Card
          key={row.id}
          sx={{
            mb: 2,
            borderLeft: isSelected ? 4 : 0,
            borderLeftColor: "primary.main",
            transition: "all 0.2s ease-in-out",
            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            {/* Header with title and selection */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {showSelectColumn && onRowSelect && (
                <IconButton
                  size="small"
                  onClick={() => onRowSelect(row, !isSelected)}
                  sx={{ mr: 1, minHeight: touchConfig.minTouchTarget }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: isSelected ? "primary.main" : "grey.300",
                      fontSize: "0.875rem",
                    }}
                  >
                    {isSelected ? <CheckIcon fontSize="small" /> : ""}
                  </Avatar>
                </IconButton>
              )}

              <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
                {title}
              </Typography>

              {hasSecondaryFields && (
                <IconButton
                  size="small"
                  onClick={() => toggleCardExpansion(row.id)}
                  sx={{
                    minHeight: touchConfig.minTouchTarget,
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease-in-out",
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              )}
            </Box>

            {/* Primary fields - always visible */}
            <Stack spacing={0.5}>
              {primaryColumns.map((column, index) =>
                renderFieldRow(column, row, index < primaryColumns.length - 1)
              )}
            </Stack>

            {/* Secondary fields - collapsible */}
            {hasSecondaryFields && (
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.5}>
                  {secondaryColumns.map((column, index) =>
                    renderFieldRow(column, row, index < secondaryColumns.length - 1)
                  )}
                </Stack>
              </Collapse>
            )}

            {/* Expand indicator */}
            {hasSecondaryFields && !isExpanded && (
              <Box sx={{ textAlign: "center", mt: 1.5 }}>
                <Chip
                  size="small"
                  label={`+${secondaryColumns.length} ${t("common.more")}`}
                  variant="outlined"
                  onClick={() => toggleCardExpansion(row.id)}
                  sx={{ cursor: "pointer" }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      );
    },
    [
      expandedCards,
      isRowSelected,
      getPrimaryColumns,
      getSecondaryColumns,
      mobileCardTitle,
      showSelectColumn,
      onRowSelect,
      toggleCardExpansion,
      renderFieldRow,
      t,
    ]
  );

  // Empty state
  if (data.length === 0 && !enableInlineAdd) {
    return (
      <Box
        sx={{
          ...responsivePatterns.sectionPadding,
          textAlign: "center",
          py: 8,
        }}
      >
        <Typography color="text.secondary" variant="h6">
          {emptyMessage || t("common.noDataAvailable")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", pb: enableInlineAdd ? 10 : 0 }}>
      {/* Selection summary */}
      {selectedRows.length > 0 && (
        <Box sx={{ mb: 2, px: 1 }}>
          <Chip
            label={t("common.selected", { count: selectedRows.length })}
            color="primary"
            variant="filled"
            size="small"
          />
        </Box>
      )}

      {/* Virtualized Cards list */}
      <Virtuoso
        style={{ height: "calc(100vh - 200px)" }}
        data={data}
        overscan={5}
        itemContent={(_index, row) => renderCard(row)}
        components={{
          List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
            (props, ref) => <Box {...props} ref={ref} sx={{ px: 1 }} />
          ),
          Footer: () =>
            enableInlineAdd ? <Box sx={{ height: 80 }} /> : null,
        }}
      />

      {/* Floating Add Button */}
      {enableInlineAdd && onAddRow && (
        <Zoom in>
          <Fab
            color="primary"
            onClick={handleOpenAdd}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            m: 2,
            width: "calc(100% - 32px)",
            maxWidth: "400px",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editDialog.column?.label}
        </DialogTitle>
        <DialogContent>{renderEditInput()}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEdit} startIcon={<CloseIcon />}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={<CheckIcon />}
          >
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseAdd}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            m: 2,
            width: "calc(100% - 32px)",
            maxWidth: "400px",
          },
        }}
      >
        <DialogTitle>{addRowPlaceholder || t("common.addNew")}</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={addInputRef}
            fullWidth
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmAdd();
              }
            }}
            placeholder={addRowPlaceholder}
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAdd} startIcon={<CloseIcon />}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirmAdd}
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!addValue.trim()}
          >
            {t("common.add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(MobileInlineView) as typeof MobileInlineView;
