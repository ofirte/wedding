import React from "react";
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
  Badge,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { responsivePatterns } from "../../utils/ResponsiveUtils";
import { Column } from "./DSTable";

export interface MobileTableViewProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  renderMobileCard?: (row: T) => React.ReactNode;
  mobileCardTitle?: (row: T) => string;
  onRowSelect?: (row: T, isSelected: boolean) => void;
  selectedRows?: T[];
  showSelectColumn?: boolean;
}

const MobileTableView = <T extends { id: string | number }>({
  data,
  columns,
  renderMobileCard,
  mobileCardTitle,
  onRowSelect,
  selectedRows = [],
  showSelectColumn = false,
}: MobileTableViewProps<T>) => {
  const { t } = useTranslation();
  const [expandedCards, setExpandedCards] = React.useState<
    Set<string | number>
  >(new Set());

  const toggleCardExpansion = (id: string | number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const isRowSelected = (row: T) =>
    selectedRows.some((selectedRow) => selectedRow.id === row.id);

  const getDisplayColumns = () => {
    return columns.filter((col) => col.showOnMobileCard !== false);
  };

  const getPrimaryColumns = () => {
    return getDisplayColumns().slice(0, 2); // Show first 2 columns by default
  };

  const getSecondaryColumns = () => {
    return getDisplayColumns().slice(2); // Rest in expanded view
  };

  const renderFieldValue = (column: Column<T>, row: T) => {
    const value = column.render(row);

    // Handle different value types for better presentation
    if (React.isValidElement(value)) {
      return value;
    }

    if (typeof value === "boolean") {
      return (
        <Chip
          size="small"
          variant="outlined"
          label={value ? t("common.yes") : t("common.no")}
          color={value ? "success" : "default"}
          icon={<CircleIcon sx={{ fontSize: "8px !important" }} />}
        />
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
        {value}
      </Typography>
    );
  };

  const renderMobileCardDefault = (row: T) => {
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
          "&:hover": {
            boxShadow: 3,
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent sx={responsivePatterns.cardPadding}>
          {/* Header with title and selection */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            {showSelectColumn && onRowSelect && (
              <IconButton
                size="small"
                onClick={() => onRowSelect(row, !isSelected)}
                sx={{ mr: 1 }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: isSelected ? "primary.main" : "grey.300",
                  }}
                >
                  {isSelected ? "✓" : ""}
                </Avatar>
              </IconButton>
            )}

            <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
              {title}
            </Typography>

            {hasSecondaryFields && (
              <IconButton
                size="small"
                onClick={() => toggleCardExpansion(row.id)}
                sx={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
          </Box>

          {/* Primary fields - always visible */}
          <Stack spacing={1.5}>
            {primaryColumns.map((column) => (
              <Box key={column.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    minHeight: 24,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 500,
                      minWidth: 80,
                      pr: 2,
                      textTransform: "capitalize",
                    }}
                  >
                    {column.mobileLabel || column.label}
                  </Typography>
                  <Box sx={{ flex: 1, textAlign: "right" }}>
                    {renderFieldValue(column, row)}
                  </Box>
                </Box>
                {primaryColumns.indexOf(column) < primaryColumns.length - 1 && (
                  <Divider sx={{ mt: 1, opacity: 0.3 }} />
                )}
              </Box>
            ))}
          </Stack>

          {/* Secondary fields - collapsible */}
          {hasSecondaryFields && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {secondaryColumns.map((column) => (
                  <Box
                    key={column.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      minHeight: 24,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontWeight: 500,
                        minWidth: 80,
                        pr: 2,
                        textTransform: "capitalize",
                      }}
                    >
                      {column.mobileLabel || column.label}
                    </Typography>
                    <Box sx={{ flex: 1, textAlign: "right" }}>
                      {renderFieldValue(column, row)}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Collapse>
          )}

          {/* Show indicator for additional fields */}
          {hasSecondaryFields && !isExpanded && (
            <Box sx={{ textAlign: "center", mt: 1 }}>
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
  };

  if (data.length === 0) {
    return (
      <Box
        sx={{
          ...responsivePatterns.sectionPadding,
          textAlign: "center",
          py: 8,
        }}
      >
        <Typography color="text.secondary" variant="h6">
          {t("common.noDataAvailable")}
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
          {t("common.noDataDescription")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={responsivePatterns.sectionPadding}>
      {/* Summary header */}
      {selectedRows.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Badge badgeContent={selectedRows.length} color="primary">
            <Chip
              label={`${selectedRows.length} ${t("common.selected")}`}
              color="primary"
              variant="outlined"
            />
          </Badge>
        </Box>
      )}

      {/* Cards list */}
      <Stack spacing={0}>
        {data.map((row) =>
          renderMobileCard
            ? renderMobileCard(row)
            : renderMobileCardDefault(row)
        )}
      </Stack>
    </Box>
  );
};

export default MobileTableView;
