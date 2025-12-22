import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { DisplayTask } from "./TaskInlineColumns";
import { isTaskCompleted } from "../taskUtils";

interface TaskBulkCompleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedRows: DisplayTask[];
}

const TaskBulkCompleteDialog: React.FC<TaskBulkCompleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedRows,
}) => {
  const { t } = useTranslation();

  // Count only incomplete tasks
  const incompleteCount = selectedRows.filter((t) => !isTaskCompleted(t)).length;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("tasks.bulkComplete.title")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("tasks.bulkComplete.message", { count: incompleteCount })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={onConfirm} color="success" variant="contained">
          {t("tasks.bulkComplete.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskBulkCompleteDialog;
