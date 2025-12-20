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

interface TaskBulkDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedRows: DisplayTask[];
}

const TaskBulkDeleteDialog: React.FC<TaskBulkDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedRows,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("tasks.bulkDelete.title")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("tasks.bulkDelete.message", { count: selectedRows.length })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {t("tasks.bulkDelete.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskBulkDeleteDialog;
