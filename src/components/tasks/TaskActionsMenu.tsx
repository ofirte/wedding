import React from "react";
import { Menu, MenuItem } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Task } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { WeddingMemberWithDetails } from "../../hooks/wedding/useWeddingMembers";

interface TaskActionsMenuProps {
  anchorEl: HTMLElement | null;
  currentTaskId: string | null;
  tasks: Task[];
  weddingMembers: WeddingMemberWithDetails[];
  onClose: () => void;
  onAssign: (userId: string) => void;
  onDelete: () => void;
}

/**
 * Context menu for task actions (assign/unassign, delete)
 */
export const TaskActionsMenu: React.FC<TaskActionsMenuProps> = ({
  anchorEl,
  currentTaskId,
  tasks,
  weddingMembers,
  onClose,
  onAssign,
  onDelete,
}) => {
  const { t } = useTranslation();

  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const isAssigned = currentTask?.assignedTo;

  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      {!isAssigned &&
        weddingMembers.map((member) => (
          <MenuItem key={member.userId} onClick={() => onAssign(member.userId)}>
            {t("tasks.assignToName", {
              name: member.displayName || member.email,
            })}
          </MenuItem>
        ))}

      {isAssigned && (
        <MenuItem onClick={() => onAssign("")}>
          {t("tasks.unassign")}
        </MenuItem>
      )}

      <MenuItem onClick={onDelete} sx={{ color: "error.main" }}>
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />{" "}
        {t("tasks.deleteTask")}
      </MenuItem>
    </Menu>
  );
};
