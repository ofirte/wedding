import React, { useState, useCallback } from "react";
import { Box, TableSortLabel, IconButton, Badge } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  InlineColumn,
  Order,
  ResolvedColumnFilterConfig,
  ColumnFilterState,
  FilterType,
} from "./types";
import ColumnFilterPopover from "./ColumnFilterPopover";

interface ColumnHeaderCellProps<T extends { id: string | number }> {
  column: InlineColumn<T>;
  orderBy: string;
  order: Order;
  onRequestSort: (columnId: string) => void;
  filterConfig?: ResolvedColumnFilterConfig<T>;
  filterState?: ColumnFilterState;
  isFilterActive: boolean;
  onFilterChange: (
    columnId: string,
    type: FilterType,
    value: ColumnFilterState["value"]
  ) => void;
  onFilterClear: (columnId: string) => void;
}

const ColumnHeaderCell = <T extends { id: string | number }>({
  column,
  orderBy,
  order,
  onRequestSort,
  filterConfig,
  filterState,
  isFilterActive,
  onFilterChange,
  onFilterClear,
}: ColumnHeaderCellProps<T>) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const handleFilterClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setFilterAnchorEl(event.currentTarget);
    },
    []
  );

  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  const handleSortClick = useCallback(() => {
    if (column.sortable) {
      onRequestSort(column.id);
    }
  }, [column.id, column.sortable, onRequestSort]);

  const handleFilterChange = useCallback(
    (type: FilterType, value: ColumnFilterState["value"]) => {
      onFilterChange(column.id, type, value);
    },
    [column.id, onFilterChange]
  );

  const handleFilterClear = useCallback(() => {
    onFilterClear(column.id);
  }, [column.id, onFilterClear]);

  const showFilterIcon = !!filterConfig;
  const showSortLabel = column.sortable;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          column.align === "right"
            ? "flex-end"
            : column.align === "center"
            ? "center"
            : "flex-start",
        gap: 0,
        width: "100%",
      }}
    >
      {/* Sort Label or plain text */}
      {showSortLabel ? (
        <TableSortLabel
          active={orderBy === column.id}
          direction={orderBy === column.id ? order : "asc"}
          onClick={handleSortClick}
          sx={{
            flexShrink: 0,
            // Always show the sort icon, not just on hover
            "& .MuiTableSortLabel-icon": {
              opacity: 1,
            },
          }}
        >
          {column.label}
        </TableSortLabel>
      ) : (
        <Box component="span" sx={{ flexShrink: 0 }}>
          {column.label}
        </Box>
      )}

      {/* Filter Icon with active indicator */}
      {showFilterIcon && (
        <>
          <IconButton
            size="small"
            onClick={handleFilterClick}
            sx={{
              p: 0.25,
              ml: 0,
            }}
          >
            <Badge
              color="primary"
              variant="dot"
              invisible={!isFilterActive}
              sx={{
                "& .MuiBadge-badge": {
                  width: 8,
                  height: 8,
                  minWidth: 8,
                  borderRadius: "50%",
                },
              }}
            >
              <FilterListIcon
                fontSize="small"
                sx={{
                  fontSize: "1rem",
                  color: isFilterActive ? "primary.main" : "action.active",
                }}
              />
            </Badge>
          </IconButton>

          <ColumnFilterPopover
            open={Boolean(filterAnchorEl)}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            filterConfig={filterConfig}
            filterState={filterState}
            onFilterChange={handleFilterChange}
            onFilterClear={handleFilterClear}
          />
        </>
      )}
    </Box>
  );
};

export default ColumnHeaderCell;
