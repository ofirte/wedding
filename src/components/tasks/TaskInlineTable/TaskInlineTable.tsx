import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Task } from "@wedding-plan/types";
import DSInlineTable from "../../common/DSInlineTable";
import { ColumnFilterState } from "../../common/DSInlineTable/types";
import { createTaskInlineColumns, DisplayTask } from "./TaskInlineColumns";
import { useTranslation } from "../../../localization/LocalizationContext";
import TaskBulkActions from "./TaskBulkActions";
import TaskBulkCompleteDialog from "./TaskBulkCompleteDialog";
import TaskBulkDeleteDialog from "./TaskBulkDeleteDialog";
import TaskTypePopover from "./TaskTypePopover";
import { isTaskCompleted } from "../taskUtils";

interface WeddingMember {
  userId: string;
  displayName?: string;
  email?: string;
}

interface Wedding {
  id: string;
  name: string;
}

interface TaskInlineTableProps {
  tasks: DisplayTask[];
  onCellUpdate: (
    rowId: string | number,
    field: string,
    value: any,
    row: DisplayTask
  ) => void | Promise<void>;
  onAddRow?: (
    newRow: Omit<Task, "id">,
    onSuccess?: (newRowId: string | number) => void
  ) => void;
  // Extended add row handler for task type selection (used with showWeddingColumn)
  onAddRowWithType?: (
    newRow: Omit<Task, "id">,
    taskType: "producer" | "wedding",
    weddingId: string | undefined,
    onSuccess?: (newRowId: string | number) => void
  ) => void;
  onDelete: (task: DisplayTask) => void;
  onDuplicate: (task: DisplayTask) => void;
  onBulkComplete?: (tasks: DisplayTask[]) => void;
  onBulkDelete?: (tasks: DisplayTask[]) => void;

  // Configuration
  weddingMembers?: WeddingMember[];
  weddingMembersMap?: Record<string, WeddingMember[]>;
  currentUserName?: string;
  categoryOptions?: string[];
  showWeddingColumn?: boolean;
  weddings?: Wedding[];

  // Optional overrides
  emptyMessage?: string;
  showExport?: boolean;
  exportFilename?: string;
  // Default filters to apply on initial render
  defaultFilters?: ColumnFilterState[];
}

const TaskInlineTable: React.FC<TaskInlineTableProps> = ({
  tasks,
  onCellUpdate,
  onAddRow,
  onAddRowWithType,
  onDelete,
  onDuplicate,
  onBulkComplete,
  onBulkDelete,
  weddingMembers = [],
  weddingMembersMap = {},
  currentUserName,
  categoryOptions: providedCategoryOptions,
  showWeddingColumn = false,
  weddings = [],
  emptyMessage,
  showExport = true,
  exportFilename,
  defaultFilters,
}) => {
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<DisplayTask[]>([]);
  const [isBulkCompleteOpen, setIsBulkCompleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Task type popover state (for management page two-step creation)
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [pendingRowData, setPendingRowData] = useState<{
    newRow: Omit<Task, "id">;
    onSuccess?: (newRowId: string | number) => void;
  } | null>(null);

  // Extract unique categories from tasks
  const [categoryOptions, setCategoryOptions] = useState<string[]>(
    providedCategoryOptions || []
  );

  // Update category options when tasks change
  useEffect(() => {
    if (providedCategoryOptions) {
      setCategoryOptions(providedCategoryOptions);
      return;
    }

    const newCategories = Array.from(
      new Set(tasks.map((t) => t.category).filter(Boolean))
    ) as string[];

    setCategoryOptions((prev) => {
      const hasNewCategories = newCategories.some((c) => !prev.includes(c));
      const hasRemovedCategories = prev.some((c) => !newCategories.includes(c));
      if (
        hasNewCategories ||
        hasRemovedCategories ||
        (prev.length === 0 && newCategories.length > 0)
      ) {
        return newCategories;
      }
      return prev;
    });
  }, [tasks, providedCategoryOptions]);

  // Create columns
  const columns = useMemo(() => {
    return createTaskInlineColumns(onDelete, onDuplicate, t, {
      weddingMembers,
      weddingMembersMap,
      currentUserName,
      categoryOptions,
      showWeddingColumn,
      weddings,
    });
  }, [onDelete, onDuplicate, t, weddingMembers, weddingMembersMap, currentUserName, categoryOptions, showWeddingColumn, weddings]);

  // Wrap onCellUpdate to handle status -> completed sync
  const handleCellUpdate = useCallback(
    (rowId: string | number, field: string, value: any, row: DisplayTask) => {
      // When status changes, also update the completed boolean for backward compatibility
      if (field === "status") {
        const isCompleted = value === "completed";
        // Update both status and completed
        onCellUpdate(rowId, "completed", isCompleted, row);
      }
      return onCellUpdate(rowId, field, value, row);
    },
    [onCellUpdate]
  );

  // Default new row values
  const defaultNewRow = useMemo(
    () => ({
      priority: "Medium",
      completed: false,
      status: "not_started" as const,
    }),
    []
  );

  // Selection change handler
  const handleSelectionChange = useCallback((rows: DisplayTask[]) => {
    setSelectedRows(rows);
  }, []);

  // Bulk action handlers
  const handleBulkCompleteOpen = useCallback(() => {
    setIsBulkCompleteOpen(true);
  }, []);

  const handleBulkCompleteClose = useCallback(() => {
    setIsBulkCompleteOpen(false);
  }, []);

  const handleBulkCompleteConfirm = useCallback(() => {
    if (onBulkComplete) {
      const incompleteTasks = selectedRows.filter((t) => !isTaskCompleted(t));
      onBulkComplete(incompleteTasks);
    }
    setSelectedRows([]);
    setIsBulkCompleteOpen(false);
  }, [onBulkComplete, selectedRows]);

  const handleBulkDeleteOpen = useCallback(() => {
    setIsBulkDeleteOpen(true);
  }, []);

  const handleBulkDeleteClose = useCallback(() => {
    setIsBulkDeleteOpen(false);
  }, []);

  const handleBulkDeleteConfirm = useCallback(() => {
    if (onBulkDelete) {
      onBulkDelete(selectedRows);
    }
    setSelectedRows([]);
    setIsBulkDeleteOpen(false);
  }, [onBulkDelete, selectedRows]);

  // Task type popover handlers
  const handlePopoverClose = useCallback(() => {
    setPopoverAnchor(null);
    setPendingRowData(null);
  }, []);

  const handlePopoverConfirm = useCallback(
    (taskType: "producer" | "wedding", weddingId?: string) => {
      if (pendingRowData && onAddRowWithType) {
        onAddRowWithType(
          pendingRowData.newRow,
          taskType,
          weddingId,
          pendingRowData.onSuccess
        );
      }
      handlePopoverClose();
    },
    [pendingRowData, onAddRowWithType, handlePopoverClose]
  );

  // Wrap onAddRow to show popover when showWeddingColumn is true
  const handleAddRow = useCallback(
    (
      newRow: Omit<Task, "id">,
      onSuccess?: (newRowId: string | number) => void
    ) => {
      // If we have the extended handler and showing wedding column, use popover flow
      if (showWeddingColumn && onAddRowWithType) {
        // Find the add button to anchor the popover
        const addButton = document.querySelector('[data-add-row-button="true"]');
        setPopoverAnchor(addButton as HTMLElement);
        setPendingRowData({ newRow, onSuccess });
      } else if (onAddRow) {
        // Use regular add flow
        onAddRow(newRow, onSuccess);
      }
    },
    [showWeddingColumn, onAddRowWithType, onAddRow]
  );

  // Bulk actions component
  const bulkActionsComponent = useMemo(
    () => (
      <TaskBulkActions
        selectedRows={selectedRows}
        onBulkComplete={handleBulkCompleteOpen}
        onBulkDelete={handleBulkDeleteOpen}
        showAssign={false}
      />
    ),
    [selectedRows, handleBulkCompleteOpen, handleBulkDeleteOpen]
  );

  const enableBulkActions = !!(onBulkComplete || onBulkDelete);
  const enableInlineAdd = !!(onAddRow || onAddRowWithType);

  return (
    <>
      <DSInlineTable
        columns={columns}
        data={tasks}
        onCellUpdate={handleCellUpdate}
        showSearch
        searchFields={["title", "description", "category"]}
        defaultSortField="createdAt"
        defaultFilters={defaultFilters}
        showSelectColumn={enableBulkActions}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        BulkActions={bulkActionsComponent}
        emptyMessage={emptyMessage || t("tasks.noTasks")}
        enableInlineAdd={enableInlineAdd}
        addRowPlaceholder={t("tasks.addTaskPlaceholder")}
        addRowField="title"
        defaultNewRow={defaultNewRow}
        onAddRow={handleAddRow}
        mobileCardTitle={(row) => row.title}
        showExport={showExport}
        exportFilename={exportFilename || t("tasks.exportFilename")}
      />

      {/* Bulk Complete Dialog */}
      <TaskBulkCompleteDialog
        open={isBulkCompleteOpen}
        onClose={handleBulkCompleteClose}
        onConfirm={handleBulkCompleteConfirm}
        selectedRows={selectedRows}
      />

      {/* Bulk Delete Dialog */}
      <TaskBulkDeleteDialog
        open={isBulkDeleteOpen}
        onClose={handleBulkDeleteClose}
        onConfirm={handleBulkDeleteConfirm}
        selectedRows={selectedRows}
      />

      {/* Task Type Popover (for two-step creation on management page) */}
      <TaskTypePopover
        anchorEl={popoverAnchor}
        open={!!popoverAnchor}
        onClose={handlePopoverClose}
        onConfirm={handlePopoverConfirm}
        weddings={weddings}
      />
    </>
  );
};

export default TaskInlineTable;
