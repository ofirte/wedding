import React from "react";
import { Task, TaskStatus } from "@wedding-plan/types";
import { InlineColumn } from "../../common/DSInlineTable";
import { IconButton, Chip, Box, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DSSelectOption } from "../../common/cells/DSSelectCell";

// Extended task type that includes producer tasks for unified display
export interface DisplayTask extends Task {
  taskType?: "wedding" | "producer";
  weddingId?: string;
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

// Status colors map
export const STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: "#9e9e9e",
  in_progress: "#2196f3",
  completed: "#4caf50",
};

// Status sort order: not_started → in_progress → completed
const STATUS_SORT_ORDER: Record<TaskStatus, number> = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
};

// Priority sort order: High → Medium → Low (0 = highest priority)
const PRIORITY_SORT_ORDER: Record<string, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

// Get status from task (with backward compatibility)
export const getTaskStatus = (task: DisplayTask): TaskStatus => {
  if (task.status) return task.status;
  // Backward compatibility: derive from completed boolean
  return task.completed ? "completed" : "not_started";
};

interface WeddingMember {
  userId: string;
  displayName?: string;
  email?: string;
}

interface Wedding {
  id: string;
  name: string;
}

// Format due date with overdue styling
const formatDueDate = (dueDate: string, status: TaskStatus): React.ReactNode => {
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = status !== "completed" && date < today;
  const formattedDate = date.toLocaleDateString();

  if (isOverdue) {
    return (
      <Box component="span" sx={{ color: "error.main", fontWeight: "medium" }}>
        {formattedDate}
      </Box>
    );
  }

  return formattedDate;
};

// Get chip color for status
const getStatusChipColor = (status: TaskStatus): "default" | "primary" | "success" => {
  switch (status) {
    case "not_started":
      return "default";
    case "in_progress":
      return "primary";
    case "completed":
      return "success";
  }
};

export const createTaskInlineColumns = (
  onDelete: (task: DisplayTask) => void,
  t: (key: string) => string,
  options: {
    weddingMembers?: WeddingMember[];
    weddingMembersMap?: Record<string, WeddingMember[]>;
    currentUserName?: string;
    categoryOptions?: string[];
    showWeddingColumn?: boolean;
    weddings?: Wedding[];
  } = {}
): InlineColumn<DisplayTask>[] => {
  const {
    weddingMembers = [],
    weddingMembersMap = {},
    currentUserName,
    categoryOptions = [],
    showWeddingColumn = false,
    weddings = [],
  } = options;

  const columns: InlineColumn<DisplayTask>[] = [
    // Title (main field for inline add) - no filter, search bar handles it
    {
      id: "title",
      label: t("tasks.title"),
      sticky: true,
      sortable: true,
      editable: true,
      editType: "text",
      width: 220,
      minWidth: 220,
      render: (row: DisplayTask) => (
        <Tooltip title={row.title && row.title.length > 25 ? row.title : ""}>
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
      width: 280,
      minWidth: 280,
      filterConfig: { type: "text" },
      render: (row: DisplayTask) => (
        <Tooltip title={row.description && row.description.length > 30 ? row.description : ""}>
          <Box
            component="span"
            sx={{
              display: "block",
              maxWidth: 260,
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
  ];

  // Wedding column (only for producer context) - positioned after description
  if (showWeddingColumn && weddings.length > 0) {
    columns.push({
      id: "weddingId",
      label: t("common.wedding"),
      sortable: true,
      editable: false, // Read-only - task type is set during creation
      getValue: (row: DisplayTask) => row.taskType === "producer" ? "producer" : (row.weddingId || ""),
      width: 180,
      minWidth: 180,
      render: (row: DisplayTask) => {
        if (row.taskType === "producer") {
          return (
            <Chip
              label={t("tasksManagement.producerTask")}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ maxWidth: 160, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
            />
          );
        }
        const wedding = weddings.find((w) => w.id === row.weddingId);
        return wedding ? (
          <Chip
            label={wedding.name}
            size="small"
            variant="outlined"
            sx={{ maxWidth: 160, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
          />
        ) : (
          "-"
        );
      },
      filterConfig: {
        type: "select",
        options: [
          { value: "producer", label: t("tasksManagement.producerTask") },
          ...weddings.map((w) => ({ value: w.id, label: w.name })),
        ],
      },
    });
  }

  // Status
  columns.push({
    id: "status",
    label: t("common.status"),
    sortable: true,
    editable: true,
    editType: "select",
    editOptions: [
      { value: "not_started", label: t("tasks.status.notStarted"), color: STATUS_COLORS.not_started },
      { value: "in_progress", label: t("tasks.status.inProgress"), color: STATUS_COLORS.in_progress },
      { value: "completed", label: t("tasks.status.completed"), color: STATUS_COLORS.completed },
    ],
    width: 160,
    minWidth: 160,
    getValue: (row: DisplayTask) => getTaskStatus(row),
    getSortValue: (row: DisplayTask) => STATUS_SORT_ORDER[getTaskStatus(row)],
    render: (row: DisplayTask) => {
      const status = getTaskStatus(row);
      return (
        <Chip
          label={t(`tasks.status.${status === "not_started" ? "notStarted" : status === "in_progress" ? "inProgress" : "completed"}`)}
          size="small"
          color={getStatusChipColor(status)}
          variant="outlined"
          sx={{ maxWidth: 140, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
        />
      );
    },
    filterConfig: {
      type: "multiselect",
      options: [
        { value: "not_started", label: t("tasks.status.notStarted") },
        { value: "in_progress", label: t("tasks.status.inProgress") },
        { value: "completed", label: t("tasks.status.completed") },
      ],
    },
  });

  // Priority
  columns.push({
    id: "priority",
    label: t("common.priority"),
    sortable: true,
    getSortValue: (row: DisplayTask) => PRIORITY_SORT_ORDER[row.priority] ?? 999,
    editable: true,
    editType: "select",
    editOptions: PRIORITY_OPTIONS.map((opt) => ({
      ...opt,
      label: t(`tasks.priority.${opt.value.toLowerCase()}`),
    })),
    editColorMap: PRIORITY_COLORS,
    width: 140,
    minWidth: 140,
    filterConfig: {
      type: "multiselect",
      options: PRIORITY_OPTIONS.map((opt) => ({
        ...opt,
        label: t(`tasks.priority.${opt.value.toLowerCase()}`),
      })),
    },
  });

  // Due Date
  columns.push({
    id: "dueDate",
    label: t("common.dueDate"),
    sortable: true,
    editable: true,
    editType: "date",
    width: 130,
    minWidth: 130,
    filterConfig: { type: "date-range" },
    render: (row: DisplayTask) =>
      row.dueDate ? formatDueDate(row.dueDate, getTaskStatus(row)) : "-",
  });

  // Category
  columns.push({
    id: "category",
    label: t("common.category"),
    sortable: true,
    editable: true,
    editType: "autocomplete",
    autocompleteOptions: categoryOptions,
    width: 130,
    minWidth: 130,
    render: (row: DisplayTask) =>
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
  });

  // Assigned To column
  // For producer page (showWeddingColumn): show with dynamic options per wedding
  // For single wedding context: show with static weddingMembers
  const hasWeddingMembersMap = Object.keys(weddingMembersMap).length > 0;
  if (weddingMembers.length > 0 || (showWeddingColumn && hasWeddingMembersMap)) {
    columns.push({
      id: "assignedTo",
      label: t("common.assignTo"),
      sortable: true,
      editable: true,
      editType: "select",
      // Static options for single wedding context (backward compatibility)
      editOptions: weddingMembers.length > 0 ? [
        { value: "", label: t("common.unassigned") },
        ...weddingMembers.map((m) => ({
          value: m.userId,
          label: m.displayName || m.email || m.userId,
        })),
      ] : undefined,
      // Dynamic options for producer page - per wedding
      getEditOptions: hasWeddingMembersMap ? (row: DisplayTask) => {
        if (row.taskType === "producer") {
          return []; // Producer tasks are not editable
        }
        const members = weddingMembersMap[row.weddingId || ""] || [];
        return [
          { value: "", label: t("common.unassigned") },
          ...members.map((m) => ({
            value: m.userId,
            label: m.displayName || m.email || m.userId,
          })),
        ];
      } : undefined,
      // Conditional editability: producer tasks are not editable
      isEditable: hasWeddingMembersMap ? (row: DisplayTask) => row.taskType === "wedding" : undefined,
      width: 180,
      minWidth: 180,
      render: (row: DisplayTask) => {
        // Producer tasks: show producer name (non-editable)
        if (row.taskType === "producer") {
          return (
            <Chip
              label={currentUserName || t("common.producer")}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ maxWidth: 120, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
            />
          );
        }
        // Wedding tasks: find member from the appropriate source
        const members = hasWeddingMembersMap
          ? (weddingMembersMap[row.weddingId || ""] || [])
          : weddingMembers;
        // Only look for member if assignedTo has a value
        const member = row.assignedTo ? members.find((m) => m.userId === row.assignedTo) : null;
        return member ? (
          <Chip
            label={member.displayName || member.email || member.userId}
            size="small"
            variant="outlined"
            sx={{ maxWidth: 120, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
          />
        ) : (
          <Chip
            label={t("common.unassigned")}
            size="small"
            variant="outlined"
            sx={{ maxWidth: 120, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
          />
        );
      },
      filterConfig: {
        type: "select",
        options: weddingMembers.length > 0 ? [
          { value: "", label: t("common.unassigned") },
          ...weddingMembers.map((m) => ({
            value: m.userId,
            label: m.displayName || m.email || m.userId,
          })),
        ] : [{ value: "", label: t("common.unassigned") }],
      },
    });
  }

  // Actions column
  columns.push({
    id: "actions",
    label: "",
    sortable: false,
    editable: false,
    render: (row: DisplayTask) => (
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
    width: 50,
  });

  return columns;
};
