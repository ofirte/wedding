import React from "react";
import { Button, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useTranslation } from "../../../localization/LocalizationContext";
import { DisplayTask } from "./TaskInlineColumns";
import { isTaskCompleted } from "../taskUtils";

interface TaskBulkActionsProps {
  selectedRows: DisplayTask[];
  onBulkComplete: () => void;
  onBulkDelete: () => void;
  onBulkAssign?: () => void;
  showAssign?: boolean;
}

const TaskBulkActions: React.FC<TaskBulkActionsProps> = ({
  selectedRows,
  onBulkComplete,
  onBulkDelete,
  onBulkAssign,
  showAssign = false,
}) => {
  const { t } = useTranslation();

  if (selectedRows.length === 0) return null;

  // Count incomplete tasks for complete button
  const incompleteCount = selectedRows.filter((t) => !isTaskCompleted(t)).length;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {incompleteCount > 0 && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<CheckCircleIcon />}
          onClick={onBulkComplete}
          color="success"
        >
          {t("tasks.bulkComplete.button")} ({incompleteCount})
        </Button>
      )}
      {showAssign && onBulkAssign && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={onBulkAssign}
        >
          {t("tasks.bulkAssign")}
        </Button>
      )}
      <Button
        variant="outlined"
        color="error"
        size="small"
        startIcon={<DeleteIcon />}
        onClick={onBulkDelete}
      >
        {t("tasks.bulkDelete.button")} ({selectedRows.length})
      </Button>
    </Stack>
  );
};

export default TaskBulkActions;
