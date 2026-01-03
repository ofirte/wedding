/**
 * Column definitions for the Template Task inline table
 */

import { TaskTemplateItem } from "@wedding-plan/types";
import { InlineColumn } from "../common/DSInlineTable";
import { IconButton, Box, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { DSSelectOption } from "../common/cells/DSSelectCell";

// Extended type for display with ID for table operations
export interface DisplayTemplateTask extends TaskTemplateItem {
  id: string; // Unique ID for table operations (localId)
}

// Priority options
export const PRIORITY_OPTIONS: DSSelectOption<string>[] = [
  { value: "High", label: "High", color: "#f44336" },
  { value: "Medium", label: "Medium", color: "#ff9800" },
  { value: "Low", label: "Low", color: "#4caf50" },
];

// Priority colors map
export const PRIORITY_COLORS: Record<string, string> = {
  High: "#f44336",
  Medium: "#ff9800",
  Low: "#4caf50",
};

// Priority sort order: High → Medium → Low (0 = highest priority)
const PRIORITY_SORT_ORDER: Record<string, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

// Format relative due date for display
export const formatRelativeDueDate = (
  task: DisplayTemplateTask,
  t: (key: string) => string
): string => {
  if (
    task.relativeDueDate === undefined ||
    !task.relativeDueDateUnit ||
    !task.relativeDueDateDirection
  ) {
    return "-";
  }

  const amount = task.relativeDueDate;
  const unit = t(`taskTemplates.${task.relativeDueDateUnit}`);
  const direction = t(`taskTemplates.${task.relativeDueDateDirection}`);

  return `${amount} ${unit} ${direction}`;
};

interface ColumnOptions {
  categoryOptions?: string[];
  onEditRelativeDate?: (task: DisplayTemplateTask, anchorEl: HTMLElement) => void;
}

export const createTemplateTaskColumns = (
  onDelete: (task: DisplayTemplateTask) => void,
  t: (key: string) => string,
  options: ColumnOptions = {}
): InlineColumn<DisplayTemplateTask>[] => {
  const { categoryOptions = [], onEditRelativeDate } = options;

  const columns: InlineColumn<DisplayTemplateTask>[] = [
    // Title (main field for inline add)
    {
      id: "title",
      label: t("tasks.title"),
      sticky: true,
      sortable: true,
      editable: true,
      editType: "text",
      width: 200,
      minWidth: 200,
      filterConfig: { type: "text" },
      render: (row: DisplayTemplateTask) => (
        <Tooltip title={row.title && row.title.length > 20 ? row.title : ""}>
          <Box
            component="span"
            sx={{
              display: "block",
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.title || "-"}
          </Box>
        </Tooltip>
      ),
    },
    // Description
    {
      id: "description",
      label: t("common.description"),
      sortable: true,
      editable: true,
      editType: "text",
      width: 220,
      minWidth: 220,
      filterConfig: { type: "text" },
      render: (row: DisplayTemplateTask) => (
        <Tooltip
          title={row.description && row.description.length > 25 ? row.description : ""}
        >
          <Box
            component="span"
            sx={{
              display: "block",
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.description || "-"}
          </Box>
        </Tooltip>
      ),
    },
    // Priority
    {
      id: "priority",
      label: t("common.priority"),
      sortable: true,
      getSortValue: (row: DisplayTemplateTask) => PRIORITY_SORT_ORDER[row.priority] ?? 999,
      editable: true,
      editType: "select",
      editOptions: PRIORITY_OPTIONS.map((opt) => ({
        ...opt,
        label: t(`tasks.priority.${opt.value.toLowerCase()}`),
      })),
      editColorMap: PRIORITY_COLORS,
      width: 120,
      minWidth: 120,
      filterConfig: {
        type: "select",
        options: PRIORITY_OPTIONS.map((opt) => ({
          ...opt,
          label: t(`tasks.priority.${opt.value.toLowerCase()}`),
        })),
      },
    },
    // Category
    {
      id: "category",
      label: t("common.category"),
      sortable: true,
      editable: true,
      editType: "autocomplete",
      autocompleteOptions: categoryOptions,
      width: 130,
      minWidth: 130,
      render: (row: DisplayTemplateTask) =>
        row.category ? (
          <Box
            component="span"
            sx={{
              display: "block",
              maxWidth: 110,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.category}
          </Box>
        ) : (
          "-"
        ),
      filterConfig:
        categoryOptions.length > 0
          ? {
              type: "multiselect",
              options: categoryOptions.map((c) => ({ value: c, label: c })),
            }
          : undefined,
    },
    // Relative Due Date (custom cell with popover)
    {
      id: "relativeDueDate",
      label: t("taskTemplates.relativeDueDate"),
      sortable: true,
      editable: false, // Not inline editable - uses popover
      width: 160,
      minWidth: 160,
      getSortValue: (row: DisplayTemplateTask) => {
        if (
          row.relativeDueDate === undefined ||
          !row.relativeDueDateUnit ||
          !row.relativeDueDateDirection
        ) {
          return Infinity;
        }
        // Convert to days for sorting
        const multiplier =
          row.relativeDueDateUnit === "months"
            ? 30
            : row.relativeDueDateUnit === "weeks"
            ? 7
            : 1;
        const sign = row.relativeDueDateDirection === "before" ? -1 : 1;
        return row.relativeDueDate * multiplier * sign;
      },
      render: (row: DisplayTemplateTask) => {
        const displayText = formatRelativeDueDate(row, t);
        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              cursor: onEditRelativeDate ? "pointer" : "default",
            }}
            onClick={(e) => {
              if (onEditRelativeDate) {
                e.stopPropagation();
                onEditRelativeDate(row, e.currentTarget as HTMLElement);
              }
            }}
          >
            {onEditRelativeDate && (
              <EditIcon
                sx={{
                  fontSize: 16,
                  color: "action.active",
                  opacity: 0.6,
                  "&:hover": { opacity: 1 },
                }}
              />
            )}
            <Box
              component="span"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayText}
            </Box>
          </Box>
        );
      },
    },
    // Actions column - use getValue to prevent trying to access row["actions"]
    {
      id: "actions",
      label: "",
      sortable: false,
      editable: false,
      align: "center",
      getValue: () => "", // Explicitly return empty to prevent accessing row.actions
      render: (row: DisplayTemplateTask) => (
        <IconButton
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
      width: 60,
      minWidth: 60,
    },
  ];

  return columns;
};
